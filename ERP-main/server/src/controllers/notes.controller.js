import Note from "../models/Note.js";
import Class from "../models/Class.js";
import mongoose from "mongoose";

/* =========================
   UPLOAD NOTE
========================= */
export const uploadNote = async (req, res) => {
  try {
    const { title, description, subject, classId, category, tags } = req.body;
    const teacherId = req.user.id;

    // Verify teacher has access to this class
    const isClassTeacher = await Class.exists({
      _id: classId,
      teacherId: teacherId
    });

    if (!isClassTeacher) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const note = await Note.create({
      title,
      description,
      subject,
      classId,
      teacherId,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || "notes",
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    res.status(201).json({
      message: "Note uploaded successfully",
      note
    });

  } catch (err) {
    console.error("UPLOAD NOTE ERROR:", err);
    res.status(500).json({ message: "Failed to upload note" });
  }
};

/* =========================
   GET TEACHER'S NOTES
========================= */
export const getMyNotes = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, subject, category } = req.query;

    let filter = { teacherId, isActive: true };
    if (classId) filter.classId = classId;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (category) filter.category = category;

    const notes = await Note.find(filter)
      .populate("classId", "name section")
      .sort({ createdAt: -1 });

    res.json(notes);

  } catch (err) {
    console.error("GET MY NOTES ERROR:", err);
    res.status(500).json({ message: "Failed to load notes" });
  }
};

/* =========================
   GET NOTE DETAIL
========================= */
export const getNoteDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const note = await Note.findOne({
      _id: id,
      teacherId: teacherId
    }).populate("classId", "name section");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Increment download count
    note.downloadCount += 1;
    await note.save();

    res.json(note);

  } catch (err) {
    console.error("GET NOTE DETAIL ERROR:", err);
    res.status(500).json({ message: "Failed to load note" });
  }
};

/* =========================
   UPDATE NOTE
========================= */
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { title, description, subject, category, tags } = req.body;

    const note = await Note.findOne({
      _id: id,
      teacherId: teacherId
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update fields
    if (title) note.title = title;
    if (description) note.description = description;
    if (subject) note.subject = subject;
    if (category) note.category = category;
    if (tags) note.tags = tags.split(',').map(tag => tag.trim());

    // Update file if new file uploaded
    if (req.file) {
      note.fileUrl = req.file.path;
      note.fileName = req.file.originalname;
      note.fileType = req.file.mimetype;
      note.fileSize = req.file.size;
    }

    await note.save();

    res.json({
      message: "Note updated successfully",
      note
    });

  } catch (err) {
    console.error("UPDATE NOTE ERROR:", err);
    res.status(500).json({ message: "Failed to update note" });
  }
};

/* =========================
   DELETE NOTE
========================= */
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const note = await Note.findOne({
      _id: id,
      teacherId: teacherId
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isActive = false;
    await note.save();

    res.json({ message: "Note deleted successfully" });

  } catch (err) {
    console.error("DELETE NOTE ERROR:", err);
    res.status(500).json({ message: "Failed to delete note" });
  }
};

/* =========================
   GET NOTES STATS
========================= */
export const getNotesStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const stats = await Note.aggregate([
      { $match: { teacherId: new mongoose.Types.ObjectId(teacherId), isActive: true } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          totalDownloads: { $sum: "$downloadCount" },
          categories: {
            $push: "$category"
          }
        }
      }
    ]);

    const categoryStats = stats[0]?.categories?.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      totalNotes: stats[0]?.totalNotes || 0,
      totalDownloads: stats[0]?.totalDownloads || 0,
      categories: categoryStats
    });

  } catch (err) {
    console.error("GET NOTES STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load notes stats" });
  }
};
