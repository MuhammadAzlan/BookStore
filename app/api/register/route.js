import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb"

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()
    await connectMongoDB()

    // check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // create new user
    const newUser = new User({ name, email, password: hashedPassword })
    await newUser.save()

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    )
  } catch (err) {
    console.error("Registration error:", err)
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 }
    )
  }
}
