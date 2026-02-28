import ExamResult from "../models/ExamResult.js";
import FinalExamResult from "../models/FinalExamResult.js";
import User from "../models/User.js";

export const getParentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    /* =========================
       🔐 VERIFY STUDENT ↔ PARENT
    ========================= */
    const student = await User.findOne({
      _id: studentId,
      role: "student",
      parentPhone: req.user.phone,
      isActive: true
    }).lean();

    if (!student) {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    const exams = {};

    let totalMarks = 0;
    let totalMaxMarks = 0;

    /* =========================
       NORMAL EXAMS (🔥 FIXED)
    ========================= */
    const examResults = await ExamResult.find({ studentId })
      .populate({
        path: "examId",
        match: { status: "PUBLISHED" },   // 🔥 MAIN FIX
        select: "name subject type maxMarks"
      })
      .lean();

    for (const r of examResults) {
      if (!r.examId) continue; // unpublished auto removed

      const marks = r.absent ? 0 : r.marks;
      const maxMarks = r.examId.maxMarks;

      totalMarks += marks;
      totalMaxMarks += maxMarks;
// 🔹 examType ke hisaab se group
if (!exams[r.examId.type]) {
  exams[r.examId.type] = [];
}

exams[r.examId.type].push({
  examId: r.examId._id,
  name: r.examId.name,
  subject: r.examId.subject,
  marks: r.absent ? "AB" : marks,
  maxMarks,
  percentage:
    marks === 0 || maxMarks === 0
      ? 0
      : Math.round((marks / maxMarks) * 100),
  result: r.result
});

    }

    /* =========================
       FINAL EXAMS
    ========================= */
    const finalResults = await FinalExamResult.find({ studentId })
      .populate({
        path: "finalExamId",
        match: { status: "PUBLISHED" },
        select: "name maxMarks"
      })
      .lean();

    for (const r of finalResults) {
      if (!r.finalExamId) continue;

      const marks = r.status === "ABSENT" ? 0 : r.marks;
      const maxMarks = r.finalExamId.maxMarks;

      totalMarks += marks;
      totalMaxMarks += maxMarks;

  if (!exams["FINAL"]) {
  exams["FINAL"] = [];
}

exams["FINAL"].push({
  examId: r.finalExamId._id,
  name: r.finalExamId.name,
  subject: r.subject,
  marks: r.status === "ABSENT" ? "AB" : marks,
  maxMarks,
  percentage:
    maxMarks === 0
      ? 0
      : Math.round((marks / maxMarks) * 100),
  result: r.status
});



    }

    /* =========================
       RESPONSE
    ========================= */
    const overallPercent = totalMaxMarks
      ? Math.round((totalMarks / totalMaxMarks) * 100)
      : 0;

    return res.json({
      student: {
        _id: student._id,
        name: student.name
      },
      summary: {
        totalMarks,
        totalMaxMarks,
        overallPercent,
        overallResult: overallPercent >= 33 ? "PASS" : "FAIL"
      },
      exams
    });

  } catch (err) {
    console.error("❌ PARENT RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to load results" });
  }
};
