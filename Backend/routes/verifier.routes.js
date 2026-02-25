const router = require("express").Router()

const { protect, authorize } = require("../middleware/auth.middleware")

const {
  getStudentsForVerification,
  getSingleStudent,
  verifyDocument,
  finalDecision
  ,
  approveAllDocuments,
  approveMultipleDocuments
} = require("../controllers/verifier.controller")

// Only VERIFIER & ADMIN can access
router.use(protect)
router.use(authorize("VERIFIER", "ADMIN"))

router.get("/students", getStudentsForVerification)

router.get("/student/:id", getSingleStudent)

router.put("/document/:id", verifyDocument)

router.put("/final-decision/:studentId", finalDecision)
router.put("/student/:id/approve-all", approveAllDocuments)
router.put("/student/:id/approve-selected", approveMultipleDocuments)

module.exports = router