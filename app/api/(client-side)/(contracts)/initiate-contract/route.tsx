import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Contract } from "@/models/ContractSchema";

export async function GET(req: Request) {
  await dbConnect();

  try {
    // Function to generate a unique contractId
    const generateUniqueContractId = async (): Promise<string> => {
      const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
      const numbers = Math.floor(1000 + Math.random() * 9000).toString();
      const contractId = `${letters}-${numbers}`;

      // Ensure the contractId is unique
      const existingContract = await Contract.findOne({ contractId });
      if (existingContract) {
        // If not unique, recursively generate another ID
        return generateUniqueContractId();
      }
      return contractId;
    };

    // Generate a unique contractId
    const contractId = await generateUniqueContractId();

    return NextResponse.json(
      {
        message: "Unique contract ID generated successfully.",
        contractId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating contract ID:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}