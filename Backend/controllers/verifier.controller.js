const { PrismaClient, AdmissionStatus, DocumentStatus } = require("@prisma/client")
const prisma = new PrismaClient()

exports.getStudentsForVerification = async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      where: { status: AdmissionStatus.SUBMITTED }
    })

    res.json(students)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.getSingleStudent = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: req.params.id },
      include: { documents: true }
    })

    res.json(student)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.verifyDocument = async (req, res) => {
  try {
    const { status, remark } = req.body

    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        status: status,
        remark,
        verifiedById: req.user.id
      }
    })

    res.json(doc)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.finalDecision = async (req, res) => {
  try {
    const { decision } = req.body

    const status =
      decision === "APPROVE"
        ? AdmissionStatus.APPROVED
        : AdmissionStatus.REJECTED

    const student = await prisma.studentProfile.update({
      where: { id: req.params.studentId },
      data: { status }
    })

    res.json(student)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}