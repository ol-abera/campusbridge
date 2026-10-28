
const express = require("express");
const internships = require("../data/internships");

const router = express.Router();

// GET /api/internships
router.get("/", (req, res) => {
  res.json({
    success: true,
    count: internships.length,
    data: internships,
  });
});

// GET /api/internships/:id
router.get("/:id", (req, res) => {
  const internship = internships.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!internship) {
    return res.status(404).json({
      success: false,
      message: "Internship not found.",
    });
  }

  res.json({
    success: true,
    data: internship,
  });
});

module.exports = router;
