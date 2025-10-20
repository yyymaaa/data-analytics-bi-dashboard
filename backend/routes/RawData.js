const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const DataSource = require("../models/DataSource");
const RawData = require("../models/RawData");
const authMiddleware = require("../middleware/authMiddleware");

// Configure file upload
const upload = multer({ dest: "uploads/" });

/**
 * Utility: Save parsed data to RawData model
 */
async function saveRawData(sourceId, data) {
  try {
    const rawData = new RawData({
      source: sourceId,
      data,
    });
    await rawData.save();
    console.log("Raw data saved for source:", sourceId);
  } catch (err) {
    console.error("Error saving raw data:", err.message);
  }
}

/**
 * Upload CSV
 */
router.post("/upload/csv", authMiddleware, upload.single("file"), async (req, res) => {
  console.log("CSV upload hit");

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "..", req.file.path);
  const results = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        fs.unlinkSync(filePath); // Clean up temp file

        // Save metadata in DataSource
        const source = new DataSource({
          name: req.file.originalname,
          type: "CSV",
          uploadedBy: req.user.id,
        });
        await source.save();

        // Save actual data
        await saveRawData(source._id, results);

        res.json({ message: "CSV uploaded and saved successfully", count: results.length });
      });
  } catch (err) {
    console.error("Error processing CSV:", err);
    res.status(500).json({ error: "Error processing CSV file" });
  }
});

/**
 * Upload Excel (.xlsx)
 */
router.post("/upload/excel", authMiddleware, upload.single("file"), async (req, res) => {
  console.log("Excel upload hit");

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "..", req.file.path);

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    fs.unlinkSync(filePath); // Clean up temp file

    // Save metadata in DataSource
    const source = new DataSource({
      name: req.file.originalname,
      type: "Excel",
      uploadedBy: req.user.id,
    });
    await source.save();

    // Save raw rows
    await saveRawData(source._id, sheetData);

    res.json({
      message: "Excel file uploaded and saved successfully",
      sheet: sheetName,
      rows: sheetData.length,
    });
  } catch (err) {
    console.error("Error processing Excel:", err);
    res.status(500).json({ error: "Error processing Excel file" });
  }
});

/**
 * Connect Google Analytics (stub for now)
 */
router.post("/upload/google-analytics", authMiddleware, async (req, res) => {
  console.log("Google Analytics upload hit");
  try {
    // You’ll later connect to GA API here.
    // For now, just simulate a successful upload
    const source = new DataSource({
      name: "Google Analytics",
      type: "GoogleAnalytics",
      uploadedBy: req.user.id,
      details: { status: "connected" },
    });
    await source.save();

    res.json({ message: "Google Analytics source added successfully" });
  } catch (err) {
    console.error("Error adding GA source:", err);
    res.status(500).json({ error: "Error adding Google Analytics source" });
  }
});

/**
 * Get all data sources for logged-in user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const sources = await DataSource.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(sources);
  } catch (err) {
    console.error("Error fetching sources:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
