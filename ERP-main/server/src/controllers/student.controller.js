import User from "../models/User.js";
import fs from "fs";
import csv from "csv-parser";
import bcrypt from "bcryptjs";
import ExamResult from "../models/ExamResult.js";
import FinalExamResult from "../models/FinalExamResult.js";
import FeeStructure from "../models/FeeStructure.js";
import TransportVehicle from "../models/TransportVehicle.js";

/* =====================================================
   GET MY STUDENT PROFILE
===================================================== */
export const getMyStudentProfile = async (req, res) => {
  try {
    // 🔐 only student
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const student = await User.findById(req.user._id)
      .select("-password")
      .populate("classId", "name section")
.populate("transport.vehicle", "vehicleNo vehicleType")

      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo || null,
      gender: student.gender || null,
      dob: student.dob || null,

      parentName: student.parentName || null,
      parentPhone: student.parentPhone || null,
      address: student.address || null,

      academicStatus: student.academicStatus,
      statusReason: student.statusReason,
      statusChangedAt: student.statusChangedAt,

      class: student.classId
        ? {
            _id: student.classId._id,
            name: student.classId.name,
            section: student.classId.section
          }
        : null,
transport: student.transport?.vehicle
  ? {
      vehicle: {
        _id: student.transport.vehicle._id,
        vehicleNo: student.transport.vehicle.vehicleNo,
        vehicleType: student.transport.vehicle.vehicleType
      },
      routeName: student.transport.routeName || null,
      stopName: student.transport.stopName || null
    }
  : null,

      isActive: student.isActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    });
  } catch (err) {
    console.error("❌ Student profile error:", err);
    res.status(500).json({ message: "Failed to load student profile" });
  }
};

/* =====================================================
   BULK UPLOAD STUDENTS (FINAL & FIXED)
===================================================== */
export const bulkUploadStudents = async (req, res) => {
  try {
    const { classId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const rows = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", row => rows.push(row))
      .on("end", async () => {
        let success = 0;
        let failed = 0;

        for (const s of rows) {
          try {
            /* ===== BASIC VALIDATION ===== */
            if (!s.name || !s.admissionNo) {
              console.error("❌ Missing name/admissionNo:", s);
              failed++;
              continue;
            }

            /* ===== PHONE VALIDATION ===== */
            if (s.parentPhone && (s.parentPhone.length !== 10 || !/^\d{10}$/.test(s.parentPhone))) {
              console.error("❌ Invalid phone number:", s.parentPhone);
              failed++;
              continue;
            }

            /* ===== AUTO EMAIL ===== */
            const generatedEmail =
              `${s.admissionNo.toLowerCase()}@school.com`;

            /* ===== PASSWORD HASH (🔥 MAIN FIX) ===== */
            const hashedPassword = await bcrypt.hash("student@123", 10);

            /* ===== CREATE STUDENT ===== */
            await User.create({
              name: s.name.trim(),
              email: generatedEmail,
              admissionNo: s.admissionNo.trim(),
              rollNo: String(s.rollNo || ""),
              gender: s.gender,
              dob: s.dob ? new Date(String(s.dob)) : null,

              parentName: s.parentName,
              parentPhone: String(s.parentPhone || ""),
              address: s.address,

              role: "student",
              password: hashedPassword, // ✅ HASHED
              classId
            });

            success++;
          } catch (err) {
            console.error(
              "❌ BULK UPLOAD FAILED:",
              s.name,
              err.message
            );
            failed++;
          }
        }

        /* ===== CLEANUP ===== */
        fs.unlinkSync(req.file.path);

        return res.json({
          message: "Bulk upload completed",
          success,
          failed
        });
      });
  } catch (err) {
    console.error("❌ Bulk upload error:", err);
    res.status(500).json({ message: "Bulk upload failed" });
  }
};

/* =====================================================
   GET MY RESULTS (STUDENT SELF)
===================================================== */
export const getMyResults = async (req, res) => {
  try {
    const studentId = req.user._id;
    const exams = {};
    let totalMarks = 0;
    let totalMaxMarks = 0;

    /* ── UNIT / TERM EXAMS ── */
    const examResults = await ExamResult.find({ studentId })
      .populate({
        path: "examId",
        match: { status: "PUBLISHED" },
        select: "name subject type maxMarks"
      })
      .lean();

    for (const r of examResults) {
      if (!r.examId) continue;
      const marks    = r.absent ? 0 : (r.marks || 0);
      const maxMarks = r.examId.maxMarks || 0;
      totalMarks    += marks;
      totalMaxMarks += maxMarks;

      if (!exams[r.examId.type]) exams[r.examId.type] = [];
      exams[r.examId.type].push({
        examId:     r.examId._id,
        name:       r.examId.name,
        subject:    r.examId.subject,
        marks:      r.absent ? "AB" : marks,
        maxMarks,
        percentage: maxMarks ? Math.round((marks / maxMarks) * 100) : 0,
        result:     r.result
      });
    }

    /* ── FINAL EXAMS ── */
    const finalResults = await FinalExamResult.find({ studentId })
      .populate({
        path: "finalExamId",
        match: { status: "PUBLISHED" },
        select: "name maxMarks"
      })
      .lean();

    for (const r of finalResults) {
      if (!r.finalExamId) continue;
      const marks    = r.status === "ABSENT" ? 0 : (r.marks || 0);
      const maxMarks = r.finalExamId.maxMarks || 0;
      totalMarks    += marks;
      totalMaxMarks += maxMarks;

      if (!exams["FINAL"]) exams["FINAL"] = [];
      exams["FINAL"].push({
        examId:     r.finalExamId._id,
        name:       r.finalExamId.name,
        subject:    r.subject,
        marks:      r.status === "ABSENT" ? "AB" : marks,
        maxMarks,
        percentage: maxMarks ? Math.round((marks / maxMarks) * 100) : 0,
        result:     r.status
      });
    }

    const overallPercent = totalMaxMarks
      ? Math.round((totalMarks / totalMaxMarks) * 100)
      : 0;

    return res.json({
      summary: {
        totalMarks,
        totalMaxMarks,
        overallPercent,
        overallResult: overallPercent >= 33 ? "PASS" : "FAIL"
      },
      exams
    });
  } catch (err) {
    console.error("❌ Student results error:", err);
    res.status(500).json({ message: "Failed to load results" });
  }
};

/* =====================================================
   GET MY FEES (STUDENT SELF)
===================================================== */
export const getMyFees = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate("classId", "name section")
      .populate("transport.vehicle", "vehicleNo route")
      .lean();

    if (!student || !student.classId) {
      return res.status(404).json({ message: "Class not assigned" });
    }

    const feeStructure = await FeeStructure.findOne({
      className: student.classId.name,
      section:   student.classId.section
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!feeStructure) {
      return res.status(404).json({ message: "Fee structure not configured" });
    }

    const breakdown = feeStructure.calculatedBreakdown || {};
    const tuition   = {
      monthly: breakdown.tuition?.monthly || 0,
      annual:  breakdown.tuition?.annual  || 0
    };

    let transport = { enabled: false };
    let transportMonthly = 0;
    let transportAnnual  = 0;

    if (feeStructure.transportConfig?.feeMode === "TRANSPORT") {
      transportMonthly = breakdown.transport?.monthly || 0;
      transportAnnual  = breakdown.transport?.annual  || 0;
      transport = { enabled: true, mode: "TRANSPORT", monthly: transportMonthly, annual: transportAnnual };
    }

    if (feeStructure.transportConfig?.feeMode === "STOP" && student.transport?.stopName) {
      const stop = breakdown.stopWise?.find(s => s.stopName === student.transport.stopName);
      if (stop) {
        transportMonthly = stop.transportMonthly || 0;
        transportAnnual  = stop.transportAnnual  || 0;
        let vehicle = null;
        if (student.transport.vehicle) {
          vehicle = await TransportVehicle.findById(student.transport.vehicle).lean();
        }
        transport = {
          enabled:     true,
          mode:        "STOP",
          stopName:    stop.stopName,
          monthly:     transportMonthly,
          annual:      transportAnnual,
          vehicleNo:   vehicle?.vehicleNo || null,
          routeName:   vehicle?.route?.routeName || null,
          pickupTime:  vehicle?.route?.stops?.find(s => s.stopName === stop.stopName)?.pickupTime || null
        };
      }
    }

    return res.json({
      tuition,
      transport,
      total: {
        monthly: tuition.monthly + transportMonthly,
        annual:  tuition.annual  + transportAnnual
      },
      components: feeStructure.components || []
    });
  } catch (err) {
    console.error("❌ Student fees error:", err);
    res.status(500).json({ message: "Failed to load fees" });
  }
};

/* =====================================================
   GET MY HOMEWORK (STUDENT)
   — shows all homework for student's class
===================================================== */
export const getMyHomework = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("classId").lean();
    if (!student?.classId) return res.json([]);

    const Homework = (await import("../models/Homework.js")).default;
    const now = new Date();

    const list = await Homework.find({ classId: student.classId, isActive: true })
      .populate("teacherId", "name")
      .sort({ dueDate: 1 })
      .lean();

    const result = list.map(hw => {
      const mySubmission = hw.submissions?.find(
        s => s.studentId?.toString() === req.user._id.toString()
      );
      const isOverdue = new Date(hw.dueDate) < now && !mySubmission;
      return {
        _id:         hw._id,
        title:       hw.title,
        description: hw.description,
        subject:     hw.subject,
        dueDate:     hw.dueDate,
        fileUrl:     hw.fileUrl  || null,
        fileName:    hw.fileName || null,
        teacher:     hw.teacherId?.name || "Teacher",
        status:      mySubmission
          ? (mySubmission.status === "graded" ? "graded" : "submitted")
          : isOverdue ? "overdue" : "pending",
        marks:    mySubmission?.marks    || null,
        feedback: mySubmission?.feedback || null,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error("Student homework error:", err);
    res.status(500).json({ message: "Failed to load homework" });
  }
};

/* =====================================================
   GET MY NOTES (STUDENT)
   — shows all notes for student's class
===================================================== */
export const getMyNotes = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("classId").lean();
    if (!student?.classId) return res.json([]);

    const Note = (await import("../models/Note.js")).default;

    const notes = await Note.find({ classId: student.classId, isActive: true })
      .populate("teacherId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(notes.map(n => ({
      _id:      n._id,
      title:    n.title,
      subject:  n.subject,
      category: n.category,
      fileUrl:  n.fileUrl,
      fileName: n.fileName,
      fileType: n.fileType,
      fileSize: n.fileSize,
      teacher:  n.teacherId?.name || "Teacher",
      uploadedAt: n.createdAt,
    })));
  } catch (err) {
    console.error("Student notes error:", err);
    res.status(500).json({ message: "Failed to load notes" });
  }
};

/* =====================================================
   GET MY UPCOMING EXAMS (STUDENT)
===================================================== */
export const getMyExams = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("classId").lean();
    if (!student?.classId) return res.json([]);

    const Exam = (await import("../models/Exam.js")).default;

    const exams = await Exam.find({
      "classes.classId": student.classId,
      status: { $in: ["SCHEDULED", "PUBLISHED", "UPCOMING"] },
    })
      .sort({ date: 1 })
      .lean();

    return res.json(exams.map(e => ({
      _id:      e._id,
      name:     e.name || e.title,
      subject:  e.subject,
      type:     e.type,
      date:     e.date,
      maxMarks: e.maxMarks,
      status:   e.status,
    })));
  } catch (err) {
    console.error("Student exams error:", err);
    res.status(500).json({ message: "Failed to load exams" });
  }
};
