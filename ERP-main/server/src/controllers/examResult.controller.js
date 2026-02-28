import Exam from "../models/Exam.js";
import User from "../models/User.js";
import ExamResult from "../models/ExamResult.js";

/* =====================================================
   HELPER: EVALUATION LABEL
===================================================== */
const getEvaluationLabel = (marks, rules) => {
  if (!Array.isArray(rules)) return null;

  const rule = rules.find(
    r => marks >= r.minMarks && marks <= r.maxMarks
  );

  return rule ? rule.label : null;
};

/* =====================================================
   GET STUDENTS FOR EXAM (CLASS-WISE)
   RULES:
   - classKey = classId_section
   - section ignored
===================================================== */
export const getStudentsForExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { classKey } = req.query;

    if (!classKey) {
      return res.status(400).json({ message: "classKey is required" });
    }

    const [classId] = classKey.split("_");

    /* ---------- EXAM ---------- */
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    /* ---------- CLASS VALIDATION ---------- */
    const allowed = exam.classes.some(
      c => c.classId.toString() === classId
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Class not part of this exam"
      });
    }

    /* ---------- STUDENTS ---------- */
    const students = await User.find({
      role: "student",
      academicStatus: "active",
      classId
    }).select("_id name rollNo");

    const rows = [];

    for (const s of students) {
      const r = await ExamResult.findOneAndUpdate(
        { examId, studentId: s._id },
        {
          examId,
          studentId: s._id,
          classId
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      ).populate("studentId", "name rollNo");

      rows.push({
        studentId: {
          _id: r.studentId._id,
          name: r.studentId.name,
          rollNo: r.studentId.rollNo
        },
        marks: r.marks ?? "",
        absent: Boolean(r.absent)
      });
    }

    res.json(rows);
  } catch (err) {
    console.error("GET STUDENTS FOR EXAM ERROR:", err);
    res.status(500).json({ message: "Failed to load students" });
  }
};

/* =====================================================
   SAVE MARKS (CLASS-WISE)
   → Exam COMPLETED only when ALL classes finished
===================================================== */
export const saveMarks = async (req, res) => {
  try {
    const { examId, marks, classKey } = req.body;

    if (!examId || !Array.isArray(marks) || !classKey) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const [classId] = classKey.split("_");

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const allowed = exam.classes.some(
      c => c.classId.toString() === classId
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Invalid class for this exam"
      });
    }

    /* ---------- SAVE MARKS ---------- */
    for (const m of marks) {
      const safeMarks =
        m.absent || m.marks === "" || m.marks == null
          ? null
          : Number(m.marks);

      if (!m.absent && safeMarks < 0) {
        return res.status(400).json({
          message: "Marks cannot be negative"
        });
      }

      if (!m.absent && safeMarks > exam.maxMarks) {
        return res.status(400).json({
          message: "Marks cannot exceed maximum marks"
        });
      }

      const evaluation =
        m.absent || safeMarks == null
          ? null
          : getEvaluationLabel(safeMarks, exam.evaluationRules);

      const percentage =
        m.absent || safeMarks == null
          ? null
          : Math.round((safeMarks / exam.maxMarks) * 100);

      const result =
        m.absent
          ? "ABSENT"
          : safeMarks >= exam.passingMarks
          ? "PASS"
          : "FAIL";

      await ExamResult.findOneAndUpdate(
        { examId, studentId: m.studentId },
        {
          classId,
          marks: safeMarks,
          absent: m.absent,
          percentage,
          result,
          evaluation
        },
        { upsert: true }
      );
    }

    /* =====================================================
       CHECK IF ALL CLASSES ARE COMPLETED
    ===================================================== */
    let allClassesCompleted = true;

    for (const c of exam.classes) {
      const totalStudents = await User.countDocuments({
        role: "student",
        academicStatus: "active",
        classId: c.classId
      });

      const evaluated = await ExamResult.countDocuments({
        examId,
        classId: c.classId,
        $or: [{ marks: { $ne: null } }, { absent: true }]
      });

      if (evaluated < totalStudents) {
        allClassesCompleted = false;
        break;
      }
    }

    if (allClassesCompleted) {
      exam.marksStatus = "COMPLETED";
      await exam.save();
    }

    res.json({
      message: allClassesCompleted
        ? "Marks saved & exam marked COMPLETED ✅"
        : "Marks saved (other classes pending)"
    });
  } catch (err) {
    console.error("SAVE MARKS ERROR:", err);
    res.status(500).json({ message: "Failed to save marks" });
  }
};

/* =====================================================
   GET EXAM RESULTS (CLASS-WISE)
===================================================== */
export const getExamResultsForTeacher = async (req, res) => {
  try {
    const { examId } = req.params;
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const results = await ExamResult.find({
      examId,
      classId
    })
      .populate("studentId", "name rollNo")
      .sort({ "studentId.rollNo": 1 });

    res.json(
      results.map(r => ({
        studentId: r.studentId._id,
        name: r.studentId.name,
        rollNo: r.studentId.rollNo,
        marks: r.marks,
        absent: r.absent,
        percentage: r.percentage,
        result: r.absent ? "ABSENT" : r.result,
        evaluation: r.evaluation,
        classId: r.classId
      }))
    );
  } catch (err) {
    console.error("GET EXAM RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to load exam results" });
  }
};
