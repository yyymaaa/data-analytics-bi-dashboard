// backend/routes/DataSource.js
const express = require("express");
const router = express.Router();
const csv = require("csv-parser");
const fs = require("fs");
const xlsx = require("xlsx");
const multer = require("multer");
const DataSource = require("../models/DataSource");
const RawData = require("../models/RawData");
const authMiddleware = require("../middleware/authMiddleware");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/* -------------------------------
   GET all data sources (optional search)
-------------------------------- */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const search = req.query.search || "";

    const sources = await DataSource.find({
      user: userId,
      name: { $regex: search, $options: "i" } // case-insensitive search
    }).sort({ createdAt: -1 });

    res.json({ sources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------
   GET single data source by ID
-------------------------------- */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id);
    if (!source) return res.status(404).json({ error: "Data source not found" });
    if (source.user.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    res.json(source);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------
   CREATE a new data source
-------------------------------- */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { type, name, config } = req.body;
    const newSource = new DataSource({ user: req.user.id, type, name, config });
    await newSource.save();
    res.status(201).json({ message: "Data source created", source: newSource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------
   UPDATE existing data source
-------------------------------- */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id);
    if (!source) return res.status(404).json({ error: "Data source not found" });
    if (source.user.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    Object.assign(source, req.body);
    await source.save();
    res.json({ message: "Data source updated", source });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------
   DELETE a data source
-------------------------------- */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id);
    if (!source) return res.status(404).json({ error: "Data source not found" });
    if (source.user.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    await source.remove();
    res.json({ message: "Data source deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------
   FILE UPLOAD — CSV / Excel
-------------------------------- */
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const newSource = new DataSource({
      user: req.user.id,
      type,
      name,
      fileInfo: {
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
    await newSource.save();

    // Parse file
    let rows = [];
    if (req.file.mimetype.includes("csv")) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on("data", (row) => rows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });
    } else if (req.file.originalname.endsWith(".xlsx")) {
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = xlsx.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Store in RawData
    const formattedRows = rows.map((row) => ({
      source: newSource._id,
      user: req.user.id,
      data: row,
    }));
    if (formattedRows.length > 0) await RawData.insertMany(formattedRows);

    // Update metadata
    newSource.metadata = { headers: Object.keys(rows[0] || {}), rowCount: rows.length };
    await newSource.save();

    fs.unlinkSync(req.file.path);

    res.json({
      message: "File uploaded and stored successfully",
      rowsSaved: rows.length,
      source: newSource,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------
   PLACEHOLDER — Google Analytics / AWS S3
-------------------------------- */
router.post("/connect/google-analytics", authMiddleware, async (req, res) => {
  res.json({ message: "Google Analytics integration not implemented yet" });
});

router.post("/connect/aws-s3", authMiddleware, async (req, res) => {
  res.json({ message: "AWS S3 integration not implemented yet" });
});

module.exports = router;
