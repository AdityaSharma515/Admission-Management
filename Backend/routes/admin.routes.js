const router = require("express").Router()

const { protect, authorize } = require("../middleware/auth.middleware")

const {
  getAllStudents,
  getDashboardStats
} = require("../controllers/admin.controller")

router.use(protect)
router.use(authorize("ADMIN"))

router.get("/students", getAllStudents)
router.get("/dashboard", getDashboardStats)

module.exports = router