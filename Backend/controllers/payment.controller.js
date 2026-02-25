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
