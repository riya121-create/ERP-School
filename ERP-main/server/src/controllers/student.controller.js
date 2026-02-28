import User from "../models/User.js";
import fs from "fs";
import csv from "csv-parser";
import bcrypt from "bcryptjs";

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
