const router = require("express").Router()

const { protect, authorize } = require("../middleware/auth.middleware")

const {
  getAllStudents,
  getDashboardStats
  ,
  assignVerifier,
  listAssignments,
  getStudentDetails
  ,
  createVerifier
} = require("../controllers/admin.controller")

router.use(protect)
router.use(authorize("ADMIN"))

router.get("/students", getAllStudents)
router.get("/dashboard", getDashboardStats)
router.post("/assign-verifier", assignVerifier)
router.get("/assignments", listAssignments)
router.get("/students/:id", getStudentDetails)
router.post("/create-verifier", createVerifier)

module.exports = router