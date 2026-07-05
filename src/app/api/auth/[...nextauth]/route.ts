import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        
        // Find existing user in MongoDB
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // If database is completely empty, register the first user as super-admin, else register as murid
          const userCount = await User.countDocuments();
          const defaultRole = userCount === 0 ? "super-admin" : "murid";
          
          existingUser = await User.create({
            email: user.email,
            name: user.name || "User",
            role: defaultRole,
            avatar: user.image, // Save Google profile picture
          });
        } else if (existingUser.avatar !== user.image || existingUser.name !== user.name) {
          // Update avatar/name if changed on Google side
          existingUser.avatar = user.image;
          existingUser.name = user.name || existingUser.name;
          await existingUser.save();
        }
        return true;
      }
      return false;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email }).populate("tenantId");
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.picture = dbUser.avatar; // Pass avatar to token
          
          if (dbUser.tenantId) {
             token.tenantId = dbUser.tenantId._id.toString();
             token.tenantName = dbUser.tenantId.name;
             token.tenantCode = dbUser.tenantId.code;
             // Ambil period untuk hero banner di dashboard
             token.tenantPeriod = dbUser.tenantId.setting?.period || "Semester Berjalan";
          }
        }
      }
      
      // Update session manually
      if (trigger === "update" && session) {
        token.tenantId = session.tenantId;
        token.tenantName = session.tenantName;
        token.tenantCode = session.tenantCode;
        token.role = session.role;
        token.tenantPeriod = session.tenantPeriod;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantName = token.tenantName;
        (session.user as any).tenantCode = token.tenantCode;
        (session.user as any).tenantPeriod = token.tenantPeriod;
        (session.user as any).image = token.picture; // Restore passing avatar to client session
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
