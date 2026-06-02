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

        const user = await User.findOne({ where: { email: credentials.email } }) as any;
        console.log('Login attempt for:', credentials.email, 'User found:', !!user, 'isVerified:', user?.isVerified);

        if (!user) {
          console.log("Login failed: User not found", credentials.email);
          throw new Error("Email ou mot de passe incorrect");
        }

        if (!user.isVerified) {
          console.log("Login failed: User not verified", credentials.email);
          throw new Error("Veuillez vérifier votre email avant de vous connecter");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          console.log("Login failed: Incorrect password", credentials.email);
          throw new Error("Email ou mot de passe incorrect");
        }

        console.log("Login success:", credentials.email);
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
