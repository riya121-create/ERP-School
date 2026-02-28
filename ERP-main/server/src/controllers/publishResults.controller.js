import Exam from "../models/Exam.js";
import ExamResult from "../models/ExamResult.js";
import User from "../models/User.js";

/* =====================================================
   PUBLISH EXAM RESULTS
===================================================== */
export const publishExamResults = async (req, res) => {
  try {
    const { examId, classKey, results } = req.body;
    const teacherId = req.user.id;

    // Verify exam exists and belongs to teacher
    const exam = await Exam.findOne({
      _id: examId,
      createdBy: teacherId
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Verify class is part of this exam
    const [classId] = classKey.split("_");
    const isClassInExam = exam.classes.some(
      c => c.classId.toString() === classId
    );

    if (!isClassInExam) {
      return res.status(403).json({ message: "Class not part of this exam" });
    }

    // Update exam status to PUBLISHED
    exam.status = "PUBLISHED";
    exam.publishedAt = new Date();
    await exam.save();

    // Update all results for this class
    const updatePromises = results.map(result => 
      ExamResult.findOneAndUpdate(
        { 
          examId: examId,
          studentId: result.studentId,
          classId: classId
        },
        { 
          status: "PUBLISHED",
          publishedAt: new Date(),
          marks: result.marks,
          grade: result.grade,
          remarks: result.remarks
        },
        { new: true, upsert: true }
      )
    );

    await Promise.all(updatePromises);

    // Create notification for students and parents
    const studentsInClass = await User.find({
      role: "student",
      classId: classId,
      isActive: true
    });

    // Here you can implement notification system
    console.log(`Published results for ${studentsInClass.length} students in class ${classKey}`);

    res.json({
      message: "Results published successfully",
      publishedStudents: results.length,
      totalStudents: studentsInClass.length,
      examTitle: exam.title,
      publishedAt: exam.publishedAt
    });

  } catch (err) {
    console.error("PUBLISH EXAM RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to publish results" });
  }
};

/* =====================================================
   GET PUBLISHED EXAMS (TEACHER)
===================================================== */
export const getPublishedExams = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const exams = await Exam.find({
      createdBy: teacherId,
      status: "PUBLISHED"
    })
      .populate("classes.classId", "name section")
      .sort({ publishedAt: -1 });

    res.json(exams);

  } catch (err) {
    console.error("GET PUBLISHED EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load published exams" });
  }
};

/* =====================================================
   GET PUBLISHED RESULTS FOR EXAM
===================================================== */
export const getPublishedResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { classKey } = req.query;
    const teacherId = req.user.id;

    // Verify exam exists and belongs to teacher
    const exam = await Exam.findOne({
      _id: examId,
      createdBy: teacherId,
      status: "PUBLISHED"
    });

    if (!exam) {
      return res.status(404).json({ message: "Published exam not found" });
    }

    // Get results for specific class if classKey provided
    let filter = { examId, status: "PUBLISHED" };
    if (classKey) {
      const [classId] = classKey.split("_");
      filter.classId = classId;
    }

    const results = await ExamResult.find(filter)
      .populate("studentId", "name rollNo admissionNo")
      .populate("classId", "name section")
      .sort({ publishedAt: -1 });

    // Calculate statistics
    const totalResults = results.length;
    const passedStudents = results.filter(r => r.status === "PASS").length;
    const failedStudents = results.filter(r => r.status === "FAIL").length;
    const passRate = totalResults > 0 ? ((passedStudents / totalResults) * 100).toFixed(1) : 0;

    res.json({
      exam: {
        title: exam.title,
        subject: exam.subject,
        type: exam.type,
        publishedAt: exam.publishedAt
      },
      results,
      stats: {
        total: totalResults,
        passed: passedStudents,
        failed: failedStudents,
        passRate: `${passRate}%`
      }
    });

  } catch (err) {
    console.error("GET PUBLISHED RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to load published results" });
  }
};

/* =====================================================
   UNPUBLISH RESULTS (REVOKE PUBLICATION)
===================================================== */
export const unpublishResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user.id;

    const exam = await Exam.findOne({
      _id: examId,
      createdBy: teacherId,
      status: "PUBLISHED"
    });

    if (!exam) {
      return res.status(404).json({ message: "Published exam not found" });
    }

    // Update exam status back to COMPLETED
    exam.status = "COMPLETED";
    await exam.save();

    // Update all results for this exam
    await ExamResult.updateMany(
      { examId },
      { 
        status: "COMPLETED",
        publishedAt: null
      }
    );

    res.json({
      message: "Results unpublished successfully",
      examTitle: exam.title
    });

  } catch (err) {
    console.error("UNPUBLISH RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to unpublish results" });
  }
};
