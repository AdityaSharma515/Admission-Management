const { PrismaClient } = require("@prisma/client")
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