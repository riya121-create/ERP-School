import User from "../models/User.js";
import Class from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import ExamResult from "../models/ExamResult.js";
import Homework from "../models/Homework.js";
import Exam from "../models/Exam.js";
import Fee from "../models/Fee.js";
import Announcement from "../models/Announcement.js";

/* =====================================================
   GET PARENT DASHBOARD DATA
===================================================== */
export const getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user.id;

    // Get parent details
    const parent = await User.findById(parentId).select('name email phone address');
    
    // Get children of this parent from database
    const children = await User.find({ 
      parentId: parentId,
      role: "student",
      isActive: true 
    })
      .populate('classId', 'name section')
      .select('name rollNo admissionNo classId');

    // Get today's attendance for all children
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = await Attendance.find({
      studentId: { $in: children.map(c => c._id) },
      date: { $gte: today, $lt: new Date(today).getTime() + 24 * 60 * 60 * 1000 }
    }).populate('studentId', 'name');

    // Get pending homework for all children
    const pendingHomework = await Homework.find({
      classId: { $in: children.map(c => c.classId._id) },
      dueDate: { $gte: today },
      isActive: true
    }).populate('classId', 'name section');

    // Get upcoming exams for all children
    const upcomingExams = await Exam.find({
      classes: { $elemMatch: { classId: { $in: children.map(c => c.classId._id) } } },
      date: { $gte: today },
      isActive: true
    }).select('title subject date type');

    // Get recent results for all children
    const recentResults = await ExamResult.find({
      studentId: { $in: children.map(c => c._id) }
    })
      .populate({
        path: 'examId',
        select: 'title subject type date'
      })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get fee information for all children
    const feeRecords = await Fee.find({
      studentId: { $in: children.map(c => c._id) },
      status: 'pending'
    });

    // Get announcements for all children's classes
    const announcements = await Announcement.find({
      classId: { $in: children.map(c => c.classId._id) },
      isActive: true
    }).sort({ createdAt: -1 }).limit(10);

    // Process children data with all related information
    const childrenWithDetails = children.map(child => {
      const childAttendance = attendanceRecords.filter(a => a.studentId.toString() === child._id);
      const childHomework = pendingHomework.filter(h => h.classId._id.toString() === child.classId._id.toString());
      const childExams = upcomingExams.filter(e => e.classes.some(c => c.classId.toString() === child.classId._id.toString()));
      const childResults = recentResults.filter(r => r.studentId.toString() === child._id);
      const childFees = feeRecords.filter(f => f.studentId.toString() === child._id);

      return {
        ...child.toObject(),
        attendance: {
          today: childAttendance,
          summary: {
            total: childAttendance.length,
            present: childAttendance.filter(a => a.status === 'present').length,
            absent: childAttendance.filter(a => a.status === 'absent').length,
            late: childAttendance.filter(a => a.status === 'late').length
          }
        },
        homework: {
          pending: childHomework.filter(h => new Date(h.dueDate) >= new Date()).length,
          submitted: childHomework.filter(h => h.submissions?.length > 0).length,
          overdue: childHomework.filter(h => new Date(h.dueDate) < new Date()).length,
          list: childHomework
        },
        exams: {
          upcoming: childExams,
          recent: childResults
        },
        fees: {
          pending: childFees.reduce((sum, f) => sum + f.amount, 0),
          records: childFees
        }
      };
    });

    res.json({
      parent,
      children: childrenWithDetails,
      attendance: {
        today: attendanceRecords,
        summary: {
          total: children.length,
          present: attendanceRecords.filter(a => a.status === 'present').length,
          absent: attendanceRecords.filter(a => a.status === 'absent').length,
          late: attendanceRecords.filter(a => a.status === 'late').length
        }
      },
      homework: {
        pending: pendingHomework,
        summary: {
          total: pendingHomework.length,
          submitted: pendingHomework.filter(h => h.submissions?.length > 0).length,
          overdue: pendingHomework.filter(h => new Date(h.dueDate) < new Date()).length
        }
      },
      exams: {
        upcoming: upcomingExams,
        recent: recentResults
      },
      fees: {
        pending: feeRecords.reduce((sum, f) => sum + f.amount, 0),
        records: feeRecords
      },
      announcements
    });

  } catch (err) {
    console.error("GET PARENT DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to load parent dashboard" });
  }
};

/* =====================================================
   GET CHILD ATTENDANCE DETAILS
===================================================== */
export const getChildAttendance = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.id;

    // Verify child belongs to this parent
    const child = await User.findOne({ 
      _id: childId, 
      parentId: parentId,
      role: "student" 
    });

    if (!child) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get attendance for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const attendance = await Attendance.find({
      studentId: childId,
      date: { $regex: `^${currentMonth}` }
    })
      .populate('studentId', 'name')
      .sort({ date: -1 });

    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    res.json({
      child,
      attendance,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage: parseFloat(attendancePercentage)
      }
    });

  } catch (err) {
    console.error("GET CHILD ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Failed to load attendance data" });
  }
};

/* =====================================================
   GET CHILD HOMEWORK
===================================================== */
export const getChildHomework = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.id;

    // Verify child belongs to this parent
    const child = await User.findOne({ 
      _id: childId, 
      parentId: parentId,
      role: "student" 
    });

    if (!child) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get homework for child's class
    const homework = await Homework.find({
      classId: child.classId,
      isActive: true
    })
      .populate('classId', 'name section')
      .populate('teacherId', 'name')
      .sort({ dueDate: 1 });

    // Categorize homework
    const allHomework = homework;
    const pendingHomework = homework.filter(h => new Date(h.dueDate) >= new Date());
    const submittedHomework = homework.filter(h => h.submissions?.some(s => s.studentId.toString() === childId));
    const overdueHomework = homework.filter(h => new Date(h.dueDate) < new Date() && !h.submissions?.some(s => s.studentId.toString() === childId));

    res.json({
      child,
      homework: {
        all: allHomework,
        pending: pendingHomework,
        submitted: submittedHomework,
        overdue: overdueHomework
      },
      statistics: {
        total: allHomework.length,
        pending: pendingHomework.length,
        submitted: submittedHomework.length,
        overdue: overdueHomework.length
      }
    });

  } catch (err) {
    console.error("GET CHILD HOMEWORK ERROR:", err);
    res.status(500).json({ message: "Failed to load homework data" });
  }
};

/* =====================================================
   GET CHILD EXAMS AND RESULTS
===================================================== */
export const getChildExams = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.id;

    // Verify child belongs to this parent
    const child = await User.findOne({ 
      _id: childId, 
      parentId: parentId,
      role: "student" 
    });

    if (!child) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get upcoming exams
    const today = new Date().toISOString().split('T')[0];
    const upcomingExams = await Exam.find({
      classes: { $elemMatch: { classId: child.classId } },
      date: { $gte: today },
      isActive: true
    })
      .populate('classes.classId', 'name section')
      .select('title subject date type maxMarks')
      .sort({ date: 1 });

    // Get exam results
    const examResults = await ExamResult.find({
      studentId: childId
    })
      .populate({
        path: 'examId',
        select: 'title subject type maxMarks date'
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate overall performance
    const totalResults = examResults.length;
    const passedResults = examResults.filter(r => r.status === 'PASS').length;
    const overallPercentage = totalResults > 0 ? 
      (examResults.reduce((sum, r) => sum + (r.marks / r.examId.maxMarks * 100), 0) / totalResults).toFixed(2) : 0;

    res.json({
      child,
      exams: {
        upcoming: upcomingExams,
        results: examResults,
        statistics: {
          totalExams: totalResults,
          passedExams: passedResults,
          overallPercentage: parseFloat(overallPercentage)
        }
      }
    });

  } catch (err) {
    console.error("GET CHILD EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load exam data" });
  }
};

/* =====================================================
   GET ANNOUNCEMENTS
===================================================== */
export const getAnnouncements = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.id;

    // Verify child belongs to this parent
    const child = await User.findOne({ 
      _id: childId, 
      parentId: parentId,
      role: "student" 
    });

    if (!child) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get announcements for child's class
    const announcements = await Announcement.find({
      classId: { $in: [child.classId._id] },
      isActive: true,
      $or: [
        { targetAudience: "all" },
        { targetAudience: "parents" },
        { targetAudience: "students" }
      ]
    })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      child,
      announcements
    });

  } catch (err) {
    console.error("GET ANNOUNCEMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to load announcements" });
  }
};
