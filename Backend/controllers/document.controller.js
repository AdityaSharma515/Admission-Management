const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

exports.uploadDocument = async (req, res) => {
  try {
    const { type } = req.body

    if (!type) {
      return res.status(400).json({
        message: "Document type is required"
      })
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      })
    }

    // Find student
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    })

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found"
      })
    }

    // Save in database
    const document = await prisma.document.create({
      data: {
        type,
        fileUrl: `/uploads/${req.file.filename}`,
        studentId: student.id
      }
    })

    res.status(201).json({
      message: "Document uploaded successfully",
      document
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}