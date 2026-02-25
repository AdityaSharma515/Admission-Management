const { PrismaClient, AdmissionStatus } = require("@prisma/client")
const prisma = new PrismaClient()

exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {fullName,dateOfBirth,gender,bloodGroup,religion,aadhaarNumber,contactNumber,parentName,parentContactNumber,parentEmail,permanentAddress,state,seatSource,allottedCategory,allottedBranch}=req.body;
    // Parse dateOfBirth if provided (accepts YYYY-MM-DD or full ISO strings)
    let dob = undefined
    if (dateOfBirth) {
      dob = new Date(dateOfBirth)
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ message: "Invalid dateOfBirth format. Use YYYY-MM-DD or ISO-8601." })
      }
    }
    const existing = await prisma.studentProfile.findUnique({
      where: { userId }
    })

    if (existing) {
      return res.status(400).json({ message: "Profile already exists" })
    }

    const profile = await prisma.studentProfile.create({
      data: {
        fullName,
        dateOfBirth: dob,
        gender,
        bloodGroup,
        religion,
        aadhaarNumber,
        contactNumber,
        parentName,
        parentContactNumber,
        parentEmail,
        permanentAddress,
        state,
        seatSource,
        allottedCategory,
        allottedBranch,
        userId
      }
    })

    res.status(201).json(profile)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error from create profile" })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { email: true } },
        verifier: { select: { id: true, email: true } },
        documents: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            status: true,
            remark: true,
            transactionId: true,
            amount: true,
            verifiedBy: { select: { id: true, email: true } },
            uploadedAt: true
          }
        }
      }
    })

    res.json(profile)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    // Prepare data and convert dateOfBirth string to Date if present
    const data = { ...req.body }
    if (data.dateOfBirth) {
      const parsed = new Date(data.dateOfBirth)
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ message: "Invalid dateOfBirth format. Use YYYY-MM-DD or ISO-8601." })
      }
      data.dateOfBirth = parsed
    }

    const updated = await prisma.studentProfile.update({
      where: { userId: req.user.id },
      data
    })

    res.json(updated)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.submitApplication = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: { documents: true }
    })

    if (!student) {
      return res.status(404).json({ message: "Profile not found" })
    }

    if (student.documents.length === 0) {
      return res.status(400).json({ message: "Upload required documents first" })
    }

    await prisma.$transaction([
      prisma.studentProfile.update({
        where: { id: student.id },
        data: { status: AdmissionStatus.SUBMITTED }
      }),
      prisma.auditLog.create({
        data: {
          action: "APPLICATION_SUBMITTED",
          performedBy: req.user.id,
          studentId: student.id
        }
      })
    ])

    res.json({ message: "Application submitted successfully" })

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}