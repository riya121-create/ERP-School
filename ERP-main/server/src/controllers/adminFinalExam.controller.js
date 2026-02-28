import FinalExam from "../models/AdminExam.js";

/* =====================================================
   CREATE FINAL EXAM (ADMIN)
   - Frontend: subjectSchedule (OBJECT)
   - DB Schema: schedule (ARRAY)
===================================================== */
export const createFinalExam = async (req, res) => {
  try {
    const { name, examCode, subjectSchedule } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!name || !examCode) {
      return res.status(400).json({
        message: "Exam name and exam code are required"
      });
    }

    if (
      !subjectSchedule ||
      typeof subjectSchedule !== "object" ||
      Object.keys(subjectSchedule).length === 0
    ) {
      return res.status(400).json({
        message: "Exam schedule is missing"
      });
    }

    /* ---------- OBJECT → ARRAY (SCHEMA FIX) ---------- */
    const schedule = Object.values(subjectSchedule).map(s => {
      if (
        !s.classId ||
        !s.section ||
        !s.subject ||
        !s.date ||
        !s.startTime ||
        !s.endTime
      ) {
        throw new Error(
          `Invalid schedule entry for ${s.className || "class"} ${s.section}`
        );
      }

      return {
        classId: s.classId,
        className: s.className,
        section: s.section,
        subject: s.subject.toUpperCase(), // 🔥 normalize
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes: Number(s.duration) || 0
      };
    });

    /* ---------- CREATE FINAL EXAM ---------- */
    const exam = await FinalExam.create({
      name: name.trim(),
      examCode: examCode.trim(),
      schedule,
      createdBy: req.user._id,
      status: "DRAFT"
    });

    res.status(201).json({
      message: "Final exam created successfully",
      exam
    });
  } catch (err) {
    console.error("CREATE FINAL EXAM ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Exam code already exists"
      });
    }

    res.status(500).json({
      message: err.message || "Failed to create final exam"
    });
  }
};



/* =====================================================
   PUBLISH FINAL EXAM (ADMIN)
===================================================== */
export const publishFinalExam = async (req, res) => {
  try {
    const exam = await FinalExam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Final exam not found" });
    }

    exam.status = "PUBLISHED";
    await exam.save();

    res.json({
      message: "Final exam published successfully"
    });
  } catch (err) {
    console.error("PUBLISH FINAL EXAM ERROR:", err);
    res.status(500).json({
      message: "Failed to publish final exam"
    });
  }
};





// ✅ GET ALL FINAL EXAMS (ADMIN LIST)
export const getAllFinalExams = async (req, res) => {
  try {
    const exams = await FinalExam.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(exams);
  } catch (err) {
    console.error("GET FINAL EXAMS ERROR:", err);
    res.status(500).json({
      message: "Failed to load final exams"
    });
  }
};





export const getFinalExamById = async (req, res) => {
  try {
    const exam = await FinalExam.findById(req.params.id).lean();

    if (!exam) {
      return res.status(404).json({ message: "Final exam not found" });
    }

    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Failed to load final exam" });
  }
};
