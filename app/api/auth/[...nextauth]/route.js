import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. connect DB
        await connectMongoDB()

        // 2. find user
        const user = await User.findOne({ email: credentials.email })
        if (!user) {
          throw new Error("No user found with this email")
        }

        // 3. compare password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        // 4. return safe user object
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
