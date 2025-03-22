import prisma from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req })
  const { id } = await params
  if (!id) {
    return NextResponse.json({ message: "Informe qual tarefa será deletada." }, { status: StatusCodes.BAD_REQUEST });
  }
  const task = await prisma.task.findFirst({ where: { id, userId: token?.sub as string } })
  if (!task) {
    return NextResponse.json({ message: "Tarefa não encontrada" }, { status: StatusCodes.NOT_FOUND });
  }
  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ message: "Tarefa deletada com sucesso." }, { status: StatusCodes.OK })
}