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

// Approve all documents for a student at once
exports.approveAllDocuments = async (req, res) => {
  try {
    const studentId = req.params.id
    const { remark } = req.body

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } })
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Update all documents for this student to APPROVED and set verifiedBy
    const result = await prisma.document.updateMany({
      where: { studentId },
      data: {
        status: DocumentStatus.APPROVED,
        verifiedById: req.user.id,
        remark: remark || undefined
      }
    })

    await prisma.auditLog.create({
      data: {
        action: "BULK_DOCUMENT_APPROVAL",
        performedBy: req.user.id,
        studentId: studentId
      }
    })

    // Fetch updated documents to return
    const documents = await prisma.document.findMany({ where: { studentId } })

    res.json({ message: "Documents approved", count: result.count, documents })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}