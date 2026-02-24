const router = require("express").Router()

const authRoutes = require("./auth.routes")
const studentRoutes = require("./student.routes")
const verifierRoutes = require("./verifier.routes")
const adminRoutes = require("./admin.routes")

router.use("/auth", authRoutes)
router.use("/student", studentRoutes)
router.use("/verifier", verifierRoutes)
router.use("/admin", adminRoutes)

module.exports = router