import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const userId = token?.sub as string;
  const uniqueDescriptions = await prisma.task.findMany({
    select: {
      description: true
    },
    distinct: ['description'],
    where: {
      userId
    }
  });
  const descriptions = uniqueDescriptions.map((d) => d.description);
  return NextResponse.json(descriptions, { status: StatusCodes.OK });
}