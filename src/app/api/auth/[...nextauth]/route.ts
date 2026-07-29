import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant"; // WAJIB DIIMPORT UNTUK POPULATE DI SERVERLESS

// Initialize models to prevent tree-shaking in serverless
Tenant.init();

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
        try {
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
          } else if (user.image && existingUser.avatar !== user.image) {
            // HANYA update foto profil (avatar) dari akun Google
            // TIDAK menimpa existingUser.name agar Display Name di database aman dari timpaan Google
            existingUser.avatar = user.image;
            await existingUser.save();
          }
          return true;
        } catch (error) {
          console.error("SIGN_IN_ERROR: ", error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, trigger, session }) {
      try {
        if (user || trigger === "update") {
          await dbConnect();
          // Gunakan token.email karena object 'user' hanya ada saat pertama kali sign-in
          const userEmail = user?.email || token?.email;
          if (userEmail) {
            const dbUser = await User.findOne({ email: userEmail }).populate("tenantId");
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = dbUser.role;
              token.picture = dbUser.avatar || token.picture || user?.image; // Gunakan dbUser.avatar atau fallback ke foto Google
              token.name = dbUser.name || token.name || user?.name; // Prioritaskan Display Name dari database
              
              if (dbUser.tenantId) {
                 const tId = dbUser.tenantId._id || dbUser.tenantId;
                 token.tenantId = tId.toString();
                 token.tenantName = dbUser.tenantId.name || "Unknown Tenant";
                 token.tenantCode = dbUser.tenantId.code || "";
                 token.tenantPeriod = dbUser.tenantId.setting?.period || "Semester Berjalan";
              }
            }
          }
        }
      } catch (error) {
        console.error("JWT_ERROR: ", error);
      }
      
      // Update session manually jika diperlukan
      if (trigger === "update" && session) {
        if (session.tenantId) token.tenantId = session.tenantId;
        if (session.tenantName) token.tenantName = session.tenantName;
        if (session.tenantCode) token.tenantCode = session.tenantCode;
        if (session.role) token.role = session.role;
        if (session.tenantPeriod) token.tenantPeriod = session.tenantPeriod;
        if (session.name) token.name = session.name;
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
        (session.user as any).name = token.name; // Official name from database
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
