
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const coursesRouter = require("./routes/courses");
const internshipsRouter = require("./routes/internships");
const applicationsRouter = require("./routes/applications");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the CampusBridge API!",
    status: "running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    project: "CampusBridge",
  });
});

app.use("/api/courses", coursesRouter);
app.use("/api/internships", internshipsRouter);
app.use("/api/applications", applicationsRouter);

// Handle invalid routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// Handle invalid JSON and other errors.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body.",
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

app.listen(PORT, () => {
  console.log(`CampusBridge API running at http://localhost:${PORT}`);
});
