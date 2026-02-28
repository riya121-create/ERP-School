import Homework from "../models/Homework.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/* =========================
   CREATE HOMEWORK
========================= */
export const createHomework = async (req, res) => {
  try {
    const { title, description, subject, classId, dueDate } = req.body;
    const teacherId = req.user.id;

    // Verify teacher has access to this class
    const isClassTeacher = await Class.exists({
      _id: classId,
      teacherId: teacherId
    });

    if (!isClassTeacher) {
      return res.status(403).json({ message: "Access denied" });
    }

    const homework = await Homework.create({
      title,
      description,
      subject,
      classId,
      teacherId,
      dueDate: new Date(dueDate),
      fileUrl: req.file?.path || null,
      fileName: req.file?.originalname || null,
      fileType: req.file?.mimetype || null
    });

    res.status(201).json({
      message: "Homework created successfully",
      homework
    });

  } catch (err) {
    console.error("CREATE HOMEWORK ERROR:", err);
    res.status(500).json({ message: "Failed to create homework" });
  }
};

/* =========================
   GET TEACHER'S HOMEWORK
========================= */
export const getMyHomework = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.query;

    let filter = { teacherId, isActive: true };
    if (classId) {
      filter.classId = classId;
    }

    const homework = await Homework.find(filter)
      .populate("classId", "name section")
      .sort({ dueDate: 1 });

    res.json(homework);

  } catch (err) {
    console.error("GET MY HOMEWORK ERROR:", err);
    res.status(500).json({ message: "Failed to load homework" });
  }
};

/* =========================
   GET HOMEWORK DETAIL
========================= */
export const getHomeworkDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const homework = await Homework.findOne({
      _id: id,
      teacherId: teacherId
    })
      .populate("classId", "name section")
      .populate("submissions.studentId", "name rollNo admissionNo")
      .populate("submissions.gradedBy", "name");

    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    res.json(homework);

  } catch (err) {
    console.error("GET HOMEWORK DETAIL ERROR:", err);
    res.status(500).json({ message: "Failed to load homework" });
  }
};

/* =========================
   GRADE SUBMISSION
========================= */
export const gradeSubmission = async (req, res) => {
  try {
    const { homeworkId, studentId } = req.params;
    const { marks, feedback } = req.body;
    const teacherId = req.user.id;

    const homework = await Homework.findOne({
      _id: homeworkId,
      teacherId: teacherId
    });

    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    const submission = homework.submissions.id(studentId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = teacherId;

    await homework.save();

    res.json({
      message: "Submission graded successfully",
      submission
    });

  } catch (err) {
    console.error("GRADE SUBMISSION ERROR:", err);
    res.status(500).json({ message: "Failed to grade submission" });
  }
};

/* =========================
   DELETE HOMEWORK
========================= */
export const deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const homework = await Homework.findOne({
      _id: id,
      teacherId: teacherId
    });

    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    homework.isActive = false;
    await homework.save();

    res.json({ message: "Homework deleted successfully" });

  } catch (err) {
    console.error("DELETE HOMEWORK ERROR:", err);
    res.status(500).json({ message: "Failed to delete homework" });
  }
};

/* =========================
   GET HOMEWORK STATS
========================= */
export const getHomeworkStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const stats = await Homework.aggregate([
      { $match: { teacherId: new mongoose.Types.ObjectId(teacherId), isActive: true } },
      {
        $group: {
          _id: null,
          totalHomework: { $sum: 1 },
          pendingSubmissions: {
            $sum: {
              $size: {
                $filter: {
                  input: "$submissions",
                  cond: { $eq: ["$$this.status", "submitted"] }
                }
              }
            }
          },
          gradedSubmissions: {
            $sum: {
              $size: {
                $filter: {
                  input: "$submissions",
                  cond: { $eq: ["$$this.status", "graded"] }
                }
              }
            }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalHomework: 0,
      pendingSubmissions: 0,
      gradedSubmissions: 0
    });

  } catch (err) {
    console.error("GET HOMEWORK STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load homework stats" });
  }
};
