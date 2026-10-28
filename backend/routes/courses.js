
const express = require("express");
const courses = require("../data/courses");

const router = express.Router();

// GET /api/courses
router.get("/", (req, res) => {
  res.json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// GET /api/courses/:id
router.get("/:id", (req, res) => {
  const course = courses.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found.",
    });
  }

  res.json({
    success: true,
    data: course,
  });
});

module.exports = router;
