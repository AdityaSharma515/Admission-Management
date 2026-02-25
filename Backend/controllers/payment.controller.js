const { PrismaClient, AdmissionStatus } = require("@prisma/client")

const prisma = new PrismaClient()

exports.getPayment = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    })

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" })
    }

    // No dedicated Payment table in this project.
    // Treat payment as completed once the user has confirmed it.
    const paymentComplete = profile.status !== AdmissionStatus.DRAFT

    res.json({
      status: paymentComplete ? "completed" : "pending",
      payment_status: paymentComplete ? "completed" : "pending"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.generatePaymentLink = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    })

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" })
    }

    // Always succeed: return a placeholder link.
    // Frontend only needs a link string to display/open.
    const payment_link = `https://sbi-collect.example/pay?studentId=${encodeURIComponent(profile.id)}`

    res.json({
      status: "pending",
      payment_status: "pending",
      payment_link
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.confirmPayment = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    })

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" })
    }

    // Always succeed and update status.
    // We only move DRAFT -> SUBMITTED to avoid overwriting later states.
    if (profile.status === AdmissionStatus.DRAFT) {
      await prisma.$transaction([
        prisma.studentProfile.update({
          where: { id: profile.id },
          data: { status: AdmissionStatus.SUBMITTED }
        }),
        prisma.auditLog.create({
          data: {
            action: "PAYMENT_CONFIRMED",
            performedBy: req.user.id,
            studentId: profile.id
          }
        })
      ])
    }

    res.json({
      message: "Payment confirmed successfully",
      status: "completed",
      payment_status: "completed"
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Submit fee receipt with transaction id and amount
exports.submitReceipt = async (req, res) => {
  try {
    const { transactionId, amount, type } = req.body

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required" })
    }

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" })
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Invalid amount" })
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    })

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" })
    }

    const docType = type || "INSTITUTE_FEE_RECEIPT"

    const document = await prisma.document.create({
      data: {
        type: docType,
        fileUrl: `/uploads/${req.file.filename}`,
        studentId: student.id,
        transactionId,
        amount: amountNum
      }
    })

    await prisma.auditLog.create({
      data: {
        action: "FEE_RECEIPT_SUBMITTED",
        performedBy: req.user.id,
        studentId: student.id
      }
    })

    res.status(201).json({ message: "Fee receipt submitted successfully", document })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
