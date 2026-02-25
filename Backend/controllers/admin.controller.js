const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const prisma = new PrismaClient()

exports.getAllStudents = async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: { user: true }
    })

    res.json(students)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.getDashboardStats = async (req, res) => {
  try {
    const total = await prisma.studentProfile.count()

    const approved = await prisma.studentProfile.count({
      where: { status: "APPROVED" }
    })

    const rejected = await prisma.studentProfile.count({
      where: { status: "REJECTED" }
    })

    const pending = await prisma.studentProfile.count({
      where: { status: "SUBMITTED" }
    })

    res.json({
      total,
      approved,
      rejected,
      pending
    })

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

// Assign a verifier to a student
exports.assignVerifier = async (req, res) => {
  try {
    const { studentId, verifierId } = req.body

    if (!studentId || !verifierId) {
      return res.status(400).json({ message: "studentId and verifierId are required" })
    }

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } })
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const verifier = await prisma.user.findUnique({ where: { id: verifierId } })
    if (!verifier || verifier.role !== "VERIFIER") {
      return res.status(400).json({ message: "Verifier not found or not a verifier" })
    }

    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { verifierId: verifierId }
    })

    await prisma.auditLog.create({
      data: {
        action: "ASSIGNED_VERIFIER",
        performedBy: req.user.id,
        studentId: studentId
      }
    })

    res.json({ message: "Verifier assigned successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// List students with assigned verifier and basic info
exports.listAssignments = async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: true,
        verifier: { select: { id: true, email: true } },
        documents: { select: { id: true, type: true, status: true, remark: true, transactionId: true, amount: true } }
      }
    })

    res.json(students)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get detailed student info including verifier remarks and payment documents
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        verifier: { select: { id: true, email: true } },
        documents: { include: { verifiedBy: { select: { id: true, email: true } } } }
      }
    })

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json(student)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a verifier account (admin only)
exports.createVerifier = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: "User already exists" })
    }

    let pwd = password
    if (!pwd) {
      // generate an 8-char alphanumeric temporary password
      pwd = crypto.randomBytes(6).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)
    }

    const hashed = await bcrypt.hash(pwd, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: "VERIFIER"
      }
    })

    await prisma.auditLog.create({
      data: {
        action: "CREATED_VERIFIER",
        performedBy: req.user.id,
        studentId: user.id
      }
    })

    res.status(201).json({ message: "Verifier created successfully", userId: user.id, password: pwd })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}