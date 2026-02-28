import TeacherSession from "../models/TeacherSession.js";
import Timetable from "../models/Timetable.js";

import TransportVehicle from "../models/TransportVehicle.js";

import Class from "../models/Class.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

/* =====================================================
   DASHBOARD STATS
===================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    const teachers = await User.countDocuments({ role: "teacher" });
    const students = await User.countDocuments({
  role: "student",
  academicStatus: "active",
  isActive: true
});

    const classes = await Class.countDocuments();

    res.json({
      teachers,
      students,
      classes,
      attendanceToday: "Pending"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE CLASS
===================================================== */
export const createClass = async (req, res) => {
  try {
    const name = req.body.name?.trim();
const section = req.body.section?.trim().toUpperCase();


    if (!name || !section) {
      return res.status(400).json({ message: "Name and section required" });
    }

  const exists = await Class.findOne({
  name: name,
  section: section
});

    if (exists) {
      return res.status(400).json({ message: "Class already exists" });
    }

    const newClass = await Class.create({ name, section });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   ASSIGN TEACHER
===================================================== */
export const assignTeacher = async (req, res) => {
  try {
    const { classId, teacherId } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher" });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // ✅ SAME TEACHER
    if (cls.teacherId?.toString() === teacherId) {
      return res.status(400).json({
        message: "This teacher is already assigned to this class"
      });
    }

    if (cls.teacherId) {
      return res.status(400).json({
        message: "This class already has a class teacher assigned"
      });
    }

    cls.teacherId = teacher._id;
    await cls.save();

    res.json({ message: "Teacher assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE TEACHER
===================================================== */
export const createTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name & email required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const password = await bcrypt.hash("teacher123", 10);

    const teacher = await User.create({
  name,
  email,
  password,
  role: "teacher",
  isPasswordChanged: false
});


    res.status(201).json({
      message: "Teacher created",
      teacherId: teacher._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET ALL TEACHERS
===================================================== */
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   GET ALL CLASSES
===================================================== */
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teacherId", "name email")
      .sort({ name: 1, section: 1 });

    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   CREATE STUDENT
===================================================== */
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      admissionNo,
      rollNo,
      classId,
      gender,
      dob,
      parentName,
      parentPhone,
      address,
      transportVehicle,
  routeName,
  stopName
    } = req.body;

    if (!name || !admissionNo || !classId) {
      return res.status(400).json({
        message: "Name, Admission No & Class are required"
      });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    const exists = await User.findOne({ admissionNo });
    if (exists) {
      return res.status(400).json({
        message: "Student with this admission number already exists"
      });
    }
if (rollNo) {
  const rollExists = await User.findOne({
    role: "student",
    classId,
    rollNo,
    academicStatus: "active"
  });

  if (rollExists) {
    return res.status(400).json({
      message: "Roll number already exists in this class"
    });
  }
}

    // 🔥 FIX: AUTO-GENERATED UNIQUE EMAIL
    const email = `${admissionNo}@student.echelonschool.com`;

    const password = await bcrypt.hash("student123", 10);

    const student = await User.create({
      name,
      email,                 // ✅ CRITICAL FIX
      password,
      role: "student",
      admissionNo,
      rollNo,
      classId,
      gender,
      dob,
      parentName,
      parentPhone,
      address,
      academicStatus: "active",
      isActive: true,
      transport: transportVehicle
    ? {
        vehicle: transportVehicle,
        routeName,
        stopName
      }
    : undefined,
    });

    // ✅ 2️⃣ NOW LINK / CREATE PARENT
    if (parentPhone) {
      let parent = await User.findOne({
        role: "parent",
        phone: parentPhone
      });

      if (!parent) {
        const hashed = await bcrypt.hash("parent123", 10);

        parent = await User.create({
          name: parentName || "Parent",
          phone: parentPhone,
          password: hashed,
          role: "parent",
          isPasswordChanged: false
        });
      }

      student.parentId = parent._id;
      await student.save();
    }
    res.status(201).json({
      message: "Student added successfully",
      studentId: student._id,
      login: {
        email,
        password: "student123"
      }
    });
  } catch (err) {
    console.error("Create student error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate student data"
      });
    }

    res.status(500).json({
      message: "Failed to add student"
    });
  }
};


/* =====================================================
   GET ACTIVE STUDENTS BY CLASS
===================================================== */
/* =====================================================
   GET ACTIVE STUDENTS BY CLASS (FEE COLLECTION READY)
===================================================== */
export const getStudentsByClass = async (req, res) => {
  try {
   const students = await User.find({
  role: "student",
  classId: req.params.classId,
  academicStatus: "active",
  isActive: true
})
.select("name rollNo admissionNo parentName parentPhone address")
.sort({ rollNo: 1 });


    res.json(students);
  } catch (err) {
    console.error("Get students by class error:", err);
    res.status(500).json({
      message: "Failed to load students"
    });
  }
};


/* =====================================================
   PROMOTE / CHANGE CLASS  ✅ FIXED
===================================================== */


export const promoteStudent = async (req, res) => {
  const { studentId, newClassId } = req.body;



  const student = await User.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
if (student.academicStatus !== "active") {
    return res.status(400).json({
      message: "Only active students can be promoted"
    });
  }

  const newClass = await Class.findById(newClassId);
  if (!newClass) {
    return res.status(404).json({ message: "New class not found" });
  }

  if (student.classId?.toString() === newClassId) {
    return res.status(400).json({ message: "Student already in this class" });
  }

  student.previousClassId = student.classId;
  student.classId = newClassId;
  student.academicStatus = "active"; // 🔥 FIXED
  student.statusReason = "Promoted / Class changed";
  student.statusChangedAt = new Date();

  await student.save();
  res.json({ message: "Student promoted successfully" });
};

/* =====================================================
   STUDENT STATUS ACTIONS
===================================================== */
export const expelStudent = async (req, res) => {
  const student = await User.findById(req.body.studentId);
  if (!student) return res.status(404).json({ message: "Not found" });

  student.classId = null;
  student.academicStatus = "expelled";
  student.statusReason = req.body.reason || "Expelled";
  student.statusChangedAt = new Date();
  student.isActive = false;

  await student.save();
  res.json({ message: "Student expelled" });
};

export const transferStudent = async (req, res) => {
  const student = await User.findById(req.body.studentId);
  if (!student) return res.status(404).json({ message: "Not found" });

  student.classId = null;
  student.academicStatus = "transferred";
  student.statusReason = `Transferred to ${req.body.schoolName}`;
  student.statusChangedAt = new Date();
  student.isActive = false;

  await student.save();
  res.json({ message: "Student transferred" });
};

export const markStudentAlumni = async (req, res) => {
  const student = await User.findById(req.body.studentId);
  if (!student) return res.status(404).json({ message: "Not found" });

  student.classId = null;
  student.academicStatus = "alumni";
  student.statusReason = `Passed out in ${req.body.year}`;
  student.statusChangedAt = new Date();
  student.isActive = false;

  await student.save();
  res.json({ message: "Student marked alumni" });
};

/* =====================================================
   GET STUDENTS BY STATUS
===================================================== */
export const getStudentsByStatus = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    const students = await User.find({
  role: "student",
  academicStatus: status,
  isActive: status === "active"
})
  .populate("classId", "name section")
  .select("-password")
  .sort({ updatedAt: -1 });


    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   TEACHER LOGIN ACTIVITY (ADMIN)
===================================================== */
export const getTeacherLoginHistory = async (req, res) => {
  try {
    const sessions = await TeacherSession.find()
      .populate("teacherId", "name email")
      .sort({ loginAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error("Teacher login history error:", err);
    res.status(500).json({
      message: "Failed to fetch teacher login history"
    });
  }
};








/* =====================================================
   yaha se chheda h FINAL EXAM: CLASSES & SUBJECTS (AUTO FROM TIMETABLE)
===================================================== */
export const getFinalExamStructure = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("classId", "_id name")
      .lean();

    const map = {};

    for (const tt of timetables) {
if (!tt.classId || !tt.section || !Array.isArray(tt.periods)) {
  continue;
}


      const key = `${tt.classId._id}_${tt.section}`;

      if (!map[key]) {
        map[key] = {
          classId: tt.classId._id.toString(),
          className: tt.classId.name,
          section: tt.section,
          subjects: new Set()
        };
      }

      for (const p of tt.periods || []) {
        if (p.subject) {
          map[key].subjects.add(
            p.subject.trim().toUpperCase()
          );
        }
      }
    }

    const result = Object.values(map).map(c => ({
      classId: c.classId,
      className: c.className,
      section: c.section,
      subjects: Array.from(c.subjects)
    }));

    res.json(result);
  } catch (err) {
    console.error("FINAL EXAM STRUCTURE ERROR:", err);
    res.status(500).json({
      message: "Failed to load final exam structure"
    });
  }
};












/* =====================================================
   STUDENT STATUS COUNTS (ADMIN → STUDENTS PAGE)
===================================================== */
export const getStudentStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: "$academicStatus",
          total: { $sum: 1 }
        }
      }
    ]);

    const result = {
      active: 0,
      expelled: 0,
      transferred: 0,
      alumni: 0
    };

    stats.forEach(s => {
      if (result.hasOwnProperty(s._id)) {
        result[s._id] = s.total;
      }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to load student stats" });
  }
};







/* =====================================================
   ASSIGN / CHANGE TRANSPORT TO STUDENT
===================================================== */
export const assignTransportToStudent = async (req, res) => {
  try {
    const { studentId, vehicleId, routeName, stopName } = req.body;

    if (!studentId || !vehicleId || !routeName || !stopName) {
      return res.status(400).json({
        message: "studentId, vehicleId, routeName, stopName required"
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const vehicle = await TransportVehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    student.transport = {
      vehicle: vehicle._id,
      routeName,
      stopName
    };

    await student.save();

    res.json({ message: "Transport assigned to student successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to assign transport",
      error: err.message
    });
  }
};
