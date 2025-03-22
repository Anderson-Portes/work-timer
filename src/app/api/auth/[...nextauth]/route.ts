import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import * as bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

const options: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email?: string; password?: string };
        if (!email || !password) {
          throw new Error("Todos os campos são obrigatórios");
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !bcrypt.compareSync(password, user.password)) {
          throw new Error("Email ou senha inválidos.");
        }
        return { ...user, password: undefined };
      },
    })
  ],
  pages: {
    signIn: '/'
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(options);
export { handler as GET, handler as POST }