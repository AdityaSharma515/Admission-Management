const router = require("express").Router()

const { protect, authorize } = require("../middleware/auth.middleware")
const upload = require("../middleware/upload.middleware")


const {
  createProfile,
  getProfile,
  updateProfile,
  submitApplication
} = require("../controllers/student.controller")

const {
  getPayment,
  generatePaymentLink,
  confirmPayment,
  submitReceipt
} = require("../controllers/payment.controller")

const { uploadDocument } = require("../controllers/document.controller")

router.use(protect)
router.use(authorize("STUDENT"))
router.post("/upload-document",upload.single("file"),uploadDocument)
router.post("/profile", createProfile)
router.get("/profile", getProfile)
router.put("/profile", updateProfile)
router.put("/submit", submitApplication)

// Payment endpoints (stubbed: always succeed)
router.get("/payment", getPayment)
router.post("/payment/generate", generatePaymentLink)
router.post("/payment/confirm", confirmPayment)
router.post("/payment/submit-receipt", upload.single("file"), submitReceipt)

module.exports = router