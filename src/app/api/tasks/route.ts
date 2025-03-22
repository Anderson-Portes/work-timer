import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { StatusCodes } from "http-status-codes";

export async function GET(req: NextRequest) {
  const token = await getToken({ req })
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks = await prisma.task.findMany({
    where: {
      userId: token?.sub as string,
      startTime: { gte: today },
    },
    orderBy: { startTime: "desc" },
  });
  return NextResponse.json(tasks, { status: StatusCodes.OK });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req })
  const { description } = await req.json() as { description?: string }
  if (!description) {
    return NextResponse.json({ message: "Preencha a descrição da tarefa." }, { status: StatusCodes.BAD_REQUEST });
  }
  const task = await prisma.task.create({
    data: {
      description,
      startTime: new Date(),
      userId: token?.sub as string
    }
  })
  return NextResponse.json(task, { status: StatusCodes.CREATED })
}
