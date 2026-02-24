const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const prisma = new PrismaClient()

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body

    const allowedRoles = ["STUDENT", "VERIFIER", "ADMIN"]
    let roleValue
    if (role) {
      roleValue = String(role).toUpperCase()
      if (!allowedRoles.includes(roleValue)) {
        return res.status(400).json({ message: "Invalid role" })
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...(roleValue ? { role: roleValue } : {})
      }
    })

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id
    })

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({ token })

  } catch (error) {
    res.status(500).json({ message: "Server error" })
    console.error(error)
  }
}