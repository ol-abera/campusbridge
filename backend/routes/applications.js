
const express = require("express");
const internships = require("../data/internships");

const router = express.Router();

let applications = [];
let nextId = 1;

// GET /api/applications
router.get("/", (req, res) => {
  res.json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// POST /api/applications
router.post("/", (req, res) => {
  const { internshipId, studentName, email } = req.body;

  if (
    internshipId === undefined ||
    !Number.isInteger(Number(internshipId)) ||
    !studentName?.trim() ||
    !email?.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Internship ID, student name, and email are required.",
    });
  }

  const internship = internships.find(
    (item) => item.id === Number(internshipId)
  );

  if (!internship) {
    return res.status(404).json({
      success: false,
      message: "Internship not found.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const alreadyApplied = applications.some(
    (application) =>
      application.internshipId === internship.id &&
      application.email === normalizedEmail
  );

  if (alreadyApplied) {
    return res.status(409).json({
      success: false,
      message: "You have already applied for this internship.",
    });
  }

  const application = {
    id: nextId++,
    internshipId: internship.id,
    internshipTitle: internship.title,
    company: internship.company,
    studentName: studentName.trim(),
    email: normalizedEmail,
    status: "Pending",
    appliedAt: new Date().toISOString(),
  };

  applications.push(application);

  res.status(201).json({
    success: true,
    message: "Application submitted successfully.",
    data: application,
  });
});

module.exports = router;
