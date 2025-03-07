import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Payment } from "@/models/paymentSchema";
import mongoose from "mongoose";
import { Contract } from "@/models/ContractSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const userType = searchParams.get("userType");
    const contractId = searchParams.get("contractId");
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search") || "";
    const paymentMethod = searchParams.get("paymentMethod");

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID is required." },
        { status: 400 }
      );
    }

    if (!userType || !["client", "vendor"].includes(userType)) {
      return NextResponse.json(
        { success: false, message: "Valid userType ('client' or 'vendor') is required." },
        { status: 400 }
      );
    }

    // Build query filter
    const filter: any = {
      [`${userType === "client" ? "payerId" : "payeeId"}`]: new mongoose.Types.ObjectId(customerId)
    };

    // Add status filter
    if (status && status !== "all") {
      const formattedStatus = status.toLowerCase().replace(/\s+/g, '_');
      filter.status = formattedStatus;
    }

    // Add payment method filter
    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod.toLowerCase();
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate && startDate !== 'undefined') {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate && endDate !== 'undefined') {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Add search filter
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const numberSearch = !isNaN(parseFloat(searchTerm)) ? parseFloat(searchTerm) : null;
      
      filter.$or = [
        { stripePaymentIntentId: { $regex: searchTerm, $options: "i" } },
        { paymentMethod: { $regex: searchTerm, $options: "i" } },
        ...(numberSearch ? [
          { totalAmount: numberSearch },
          { platformFee: numberSearch },
          { escrowAmount: numberSearch }
        ] : [])
      ].filter(Boolean);
    }

    // Add contract filter if provided
    if (contractId) {
      filter.contractId = new mongoose.Types.ObjectId(contractId);
    }

    console.log('Query Filter:', JSON.stringify(filter, null, 2));

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch payments with pagination
    const [payments, totalCount] = await Promise.all([
      Payment.find(filter)
        .populate("payerId", "email userName firstName lastName userType")
        .populate("payeeId", "email userName firstName lastName userType")
        .populate("contractId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter)
    ]);

    // Return empty array instead of 404 when no payments found
    if (!payments || payments.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      }, { status: 200 });
    }

    // Add contract title if contractId is provided
    let paymentsWithTitle = payments;
    if (contractId) {
      const contract = await Contract.findById(contractId).select("title").lean() as { title?: string };
      paymentsWithTitle = payments.map(payment => ({
        ...payment,
        contractTitle: contract?.title || "Untitled Contract"
      }));
    }

    // Calculate payment stats
    const stats = await Payment.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          onHoldAmount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["process", "on_hold", "funded", "partially_released"]] },
                "$escrowAmount",
                0
              ]
            }
          },
          releasedAmount: {
            $sum: {
              $cond: [
                { $eq: ["$status", "fully_released"] },
                "$totalAmount",
                { $cond: [
                  { $eq: ["$status", "partially_released"] },
                  "$releasedAmount",
                  0
                ]}
              ]
            }
          }
        }
      }
    ]);

    const paymentStats = stats.length > 0 ? stats[0] : {
      totalAmount: 0,
      onHoldAmount: 0,
      releasedAmount: 0
    };

    return NextResponse.json({
      success: true,
      data: paymentsWithTitle,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        totalAmount: paymentStats.totalAmount || 0,
        onHoldAmount: paymentStats.onHoldAmount || 0,
        releasedAmount: paymentStats.releasedAmount || 0
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
