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

exports.deleteDocument = async (req, res) => {
  try {
    const { id: documentId } = req.params

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required"
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

    // Find and delete document (verify it belongs to the student)
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      })
    }

    if (document.studentId !== student.id) {
      return res.status(403).json({
        message: "Unauthorized: This document does not belong to you"
      })
    }

    // Delete the document
    await prisma.document.delete({
      where: { id: documentId }
    })

    res.status(200).json({
      message: "Document deleted successfully"
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}