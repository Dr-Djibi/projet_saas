import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "./models";

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter(prisma) est supprimé. 
  // NextAuth nécessite un adaptateur Sequelize spécifique ou une implémentation personnalisée.
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Identifiants manquants");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        const user = await User.findOne({ where: { email: normalizedEmail } }) as any;

        if (!user) {
          throw new Error("Email ou mot de passe incorrect");
        }

        if (!user.isVerified) {
          throw new Error("Veuillez vérifier votre email avant de vous connecter");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Email ou mot de passe incorrect");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
