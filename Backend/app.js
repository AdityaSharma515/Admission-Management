const express = require("express")
const cors = require("cors")
const path = require("path")

const routes = require("./routes")

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
// Health check
app.get("/", (req, res) => {
  res.json({ message: "Admission Management API Running" })
})

// Routes
app.use("/api", routes)

module.exports = app