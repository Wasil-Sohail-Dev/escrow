import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { PromotionCode } from "@/models/PromotionCodeSchema";
import { Admin } from "@/models/AdminSchema";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const data = await req.json();

    // Handle validation request
    if (data.action === "validate") {
      const promoCode = await PromotionCode.findOne({
        code: data.code.toUpperCase(),
      });

      if (!promoCode) {
        return NextResponse.json(
          { success: false, error: "Invalid promotion code" },
          { status: 404 }
        );
      }

      // Check if code is active
      if (promoCode.status === "inactive") {
        return NextResponse.json(
          { success: false, error: "This promotion code is inactive" },
          { status: 400 }
        );
      }

      if (promoCode.usageCount >= promoCode.usageLimit) {
        await PromotionCode.findByIdAndUpdate(promoCode._id, {
          status: "expired",
        });
        return NextResponse.json(
          {
            success: false,
            error: "This promotion code has reached its usage limit",
          },
          { status: 400 }
        );
      }

      if (promoCode.status === "expired") {
        return NextResponse.json(
          { success: false, error: "This promotion code has expired" },
          { status: 400 }
        );
      }

      // Get current date in local timezone then convert to UTC for comparison
      const now = new Date();
      const currentDate = new Date(
        Date.UTC(
          now.getFullYear(), // Use local year instead of UTCFullYear
          now.getMonth(), // Use local month instead of UTCMonth
          now.getDate(), // Use local date instead of UTCDate
          0,
          0,
          0,
          0
        )
      );

      // Convert validFrom and validUntil to UTC dates for comparison
      const validFrom = new Date(promoCode.validFrom);
      const validFromUTC = new Date(
        Date.UTC(
          validFrom.getFullYear(), // Use local year
          validFrom.getMonth(), // Use local month
          validFrom.getDate(), // Use local date
          0,
          0,
          0,
          0
        )
      );

      const validUntil = new Date(promoCode.validUntil);
      const validUntilUTC = new Date(
        Date.UTC(
          validUntil.getFullYear(), // Use local year
          validUntil.getMonth(), // Use local month
          validUntil.getDate(), // Use local date
          23,
          59,
          59,
          999
        )
      );

      // Debug logging
      console.log({
        localNow: now.toLocaleString(),
        currentDate: currentDate.toISOString(),
        validFromUTC: validFromUTC.toISOString(),
        validUntilUTC: validUntilUTC.toISOString(),
      });

      if (currentDate < validFromUTC) {
        return NextResponse.json(
          { success: false, error: "This promotion code is not yet valid" },
          { status: 400 }
        );
      }

      if (currentDate > validUntilUTC) {
        await PromotionCode.findByIdAndUpdate(promoCode._id, {
          status: "expired",
        });
        return NextResponse.json(
          { success: false, error: "This promotion code has expired" },
          { status: 400 }
        );
      }

      // Increment usage count
      promoCode.usageCount += 1;

      // If this increment reaches the limit, update status to expired
      if (promoCode.usageCount >= promoCode.usageLimit) {
        promoCode.status = "expired";
      }

      await promoCode.save();

      return NextResponse.json({
        success: true,
        discountPercentage: promoCode.discountPercentage,
        message: "Promotion code applied successfully",
      });
    }

    // Handle code creation
    const admin = await Admin.findOne({ userType: "super_admin" });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found." },
        { status: 500 }
      );
    }

    // Create new promotion code with admin reference
    const promotionCode = new PromotionCode({
      ...data,
      createdBy: admin._id,
    });

    await promotionCode.save();

    return NextResponse.json({
      success: true,
      message: "Promotion code created successfully",
      data: promotionCode,
    });
  } catch (error: any) {
    console.error("Error with promotion code:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process promotion code request",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch promotion codes with pagination
    const [codes, total] = await Promise.all([
      PromotionCode.find(query)
        .populate("createdBy", "userName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PromotionCode.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: codes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching promotion codes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch promotion codes",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();

    const data = await req.json();
    const { id, ...updateData } = data;

    const updatedCode = await PromotionCode.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCode) {
      return NextResponse.json(
        { error: "Promotion code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promotion code updated successfully",
      data: updatedCode,
    });
  } catch (error: any) {
    console.error("Error updating promotion code:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update promotion code",
      },
      { status: 500 }
    );
  }
}
