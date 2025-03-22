import prisma from "@/lib/prisma";
import IRegisterRequest from "@/types/requests/IRegisterRequest";
import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";


export async function POST(req: Request) {
  const { name, email, password, confirmPassword } = await req.json() as IRegisterRequest
  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ message: "Todos os campos são obrigatórios." }, { status: StatusCodes.BAD_REQUEST });
  }
  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    return NextResponse.json({ message: "Este email ja esta sendo utilizado." }, { status: StatusCodes.BAD_REQUEST });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ message: "As senhas precisam ser iguais." }, { status: StatusCodes.BAD_REQUEST });
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name, email, password: hashedPassword
    }
  });
  return NextResponse.json({ message: "Usuário criado com sucesso." });
}