import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req });
  const { id } = await params
  const task = await prisma.task.findFirst({
    where: {
      id,
      userId: token?.sub
    }
  })
  if (!task) {
    return NextResponse.json({ message: "Tarefa não encontrada" }, { status: StatusCodes.NOT_FOUND });
  }
  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      endTime: new Date()
    }
  })
  return NextResponse.json(updatedTask, { status: StatusCodes.OK })
}