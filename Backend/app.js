const express = require("express")
const cors = require("cors")

const routes = require("./routes")

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", require("express").static("src/uploads"))
// Health check
app.get("/", (req, res) => {
  res.json({ message: "Admission Management API Running" })
})

// Routes
app.use("/api", routes)

module.exports = app