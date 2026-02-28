import TeacherSession from "../models/TeacherSession.js";
import Timetable from "../models/Timetable.js";

import TransportVehicle from "../models/TransportVehicle.js";

import Class from "../models/Class.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";
import Performance from "../models/Performance.js";
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
   UPDATE STUDENT
===================================================== */
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update allowed fields
    const allowedFields = [
      "name", "email", "phone", "rollNo", "admissionNo", 
      "classId", "section", "parentId", "address", "bloodGroup",
      "dateOfBirth", "gender", "emergencyContact", "medicalInfo"
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        student[field] = updateData[field];
      }
    });

    await student.save();

    res.json({ 
      message: "Student updated successfully",
      student 
    });
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ message: "Failed to update student" });
  }
};

/* =====================================================
   DELETE STUDENT
===================================================== */
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    await User.findByIdAndDelete(studentId);

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

/* =====================================================
   GENERATE TRANSFER CERTIFICATE (TC)
===================================================== */
export const generateTransferCertificate = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reason, lastDate, newSchool } = req.body;

    const student = await User.findById(studentId)
      .populate('classId', 'name section')
      .populate('parentId', 'name phone address');

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Generate TC data
    const tcData = {
      studentName: student.name,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      class: student.classId ? `${student.classId.name}-${student.classId.section}` : 'N/A',
      dateOfBirth: student.dateOfBirth,
      admissionDate: student.createdAt,
      lastDateAttended: lastDate || new Date(),
      reasonForLeaving: reason || "Transfer to another school",
      newSchool: newSchool || "Not specified",
      parentName: student.parentId?.name || "Not specified",
      parentContact: student.parentId?.phone || "Not specified",
      parentAddress: student.parentId?.address || "Not specified",
      certificateNumber: `TC-${Date.now()}`,
      issuedDate: new Date(),
      schoolName: "Echelon School",
      schoolAddress: "School Address, City, State",
      schoolPhone: "+91 1234567890",
      schoolEmail: "info@echelonschool.com",
      principalName: "Principal Name",
      status: "Issued"
    };

    // Update student status
    student.academicStatus = "transferred";
    student.statusReason = reason || "Transfer to another school";
    student.statusChangedAt = new Date();
    await student.save();

    res.json({
      message: "Transfer certificate generated successfully",
      transferCertificate: tcData
    });

  } catch (err) {
    console.error("Generate TC error:", err);
    res.status(500).json({ message: "Failed to generate transfer certificate" });
  }
};

/* =====================================================
   UPLOAD STUDENT DOCUMENTS
===================================================== */
export const uploadStudentDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // Handle multiple file uploads
    const uploadedFiles = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const document = {
          filename: file.originalname,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/documents/${file.filename}`,
          uploadedAt: new Date(),
          uploadedBy: req.user.id,
          type: req.body.documentType || 'general'
        };
        uploadedFiles.push(document);
      }
    }

    // Add documents to student record
    if (!student.documents) {
      student.documents = [];
    }
    student.documents.push(...uploadedFiles);
    await student.save();

    res.json({
      message: "Documents uploaded successfully",
      documents: uploadedFiles
    });

  } catch (err) {
    console.error("Upload documents error:", err);
    res.status(500).json({ message: "Failed to upload documents" });
  }
};

/* =====================================================
   GET STUDENT DOCUMENTS
===================================================== */
export const getStudentDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId).select('documents');
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      documents: student.documents || []
    });

  } catch (err) {
    console.error("Get documents error:", err);
    res.status(500).json({ message: "Failed to get documents" });
  }
};

/* =====================================================
   GET TEACHER BY ID
===================================================== */
export const getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId)
      .select("-password")
      .populate('subjects', 'name code type');

    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ teacher });
  } catch (err) {
    console.error("Get teacher by ID error:", err);
    res.status(500).json({ message: "Failed to get teacher" });
  }
};

/* =====================================================
   UPDATE TEACHER
===================================================== */
export const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updateData = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update allowed fields
    const allowedFields = [
      "name", "email", "phone", "employeeId", "department", 
      "qualification", "experience", "gender", "joiningDate", 
      "address", "isActive"
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        teacher[field] = updateData[field];
      }
    });

    await teacher.save();

    res.json({ 
      message: "Teacher updated successfully",
      teacher 
    });
  } catch (err) {
    console.error("Update teacher error:", err);
    res.status(500).json({ message: "Failed to update teacher" });
  }
};

/* =====================================================
   DELETE TEACHER
===================================================== */
export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if teacher is assigned to any class
    const assignedClass = await Class.findOne({ teacherId });
    if (assignedClass) {
      return res.status(400).json({ 
        message: "Cannot delete teacher. Teacher is assigned to a class." 
      });
    }

    await User.findByIdAndDelete(teacherId);

    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    console.error("Delete teacher error:", err);
    res.status(500).json({ message: "Failed to delete teacher" });
  }
};

/* =====================================================
   ASSIGN SUBJECTS TO TEACHER
===================================================== */
export const assignSubjectsToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subjectIds } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update teacher's subjects
    teacher.subjects = subjectIds;
    await teacher.save();

    res.json({ 
      message: "Subjects assigned successfully",
      subjects: teacher.subjects 
    });
  } catch (err) {
    console.error("Assign subjects error:", err);
    res.status(500).json({ message: "Failed to assign subjects" });
  }
};

/* =====================================================
   GET TEACHER SUBJECTS
===================================================== */
export const getTeacherSubjects = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId)
      .populate('subjects', 'name code type');

    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ subjects: teacher.subjects || [] });
  } catch (err) {
    console.error("Get teacher subjects error:", err);
    res.status(500).json({ message: "Failed to get teacher subjects" });
  }
};

/* =====================================================
   SALARY MANAGEMENT
===================================================== */
export const createSalaryStructure = async (req, res) => {
  try {
    const { teacherId, basicSalary, allowances, deductions, effectiveDate } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const salaryStructure = {
      teacherId,
      basicSalary,
      allowances: allowances || [],
      deductions: deductions || [],
      effectiveDate,
      totalSalary: basicSalary + (allowances?.reduce((sum, a) => sum + a.amount, 0) || 0) - (deductions?.reduce((sum, d) => sum + d.amount, 0) || 0),
      isActive: true,
      createdAt: new Date()
    };

    // Save to Salary model
    const salary = await Salary.create(salaryStructure);

    res.json({ 
      message: "Salary structure created successfully",
      salary 
    });
  } catch (err) {
    console.error("Create salary structure error:", err);
    res.status(500).json({ message: "Failed to create salary structure" });
  }
};

export const getTeacherSalary = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const salary = await Salary.findOne({ 
      teacherId, 
      isActive: true 
    }).sort({ effectiveDate: -1 });

    if (!salary) {
      return res.status(404).json({ message: "Salary structure not found" });
    }

    res.json({ salary });
  } catch (err) {
    console.error("Get teacher salary error:", err);
    res.status(500).json({ message: "Failed to get teacher salary" });
  }
};

/* =====================================================
   LEAVE MANAGEMENT
===================================================== */
export const createLeaveRequest = async (req, res) => {
  try {
    const { teacherId, leaveType, startDate, endDate, reason } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const leaveRequest = await Leave.create({
      teacherId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "pending",
      requestedBy: req.user.id,
      createdAt: new Date()
    });

    res.json({ 
      message: "Leave request submitted successfully",
      leaveRequest 
    });
  } catch (err) {
    console.error("Create leave request error:", err);
    res.status(500).json({ message: "Failed to create leave request" });
  }
};

export const approveLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, comments } = req.body;

    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    leave.comments = comments;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();

    await leave.save();

    res.json({ 
      message: `Leave request ${status} successfully`,
      leave 
    });
  } catch (err) {
    console.error("Approve leave request error:", err);
    res.status(500).json({ message: "Failed to approve leave request" });
  }
};

export const getTeacherLeaves = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const leaves = await Leave.find({ teacherId })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (err) {
    console.error("Get teacher leaves error:", err);
    res.status(500).json({ message: "Failed to get teacher leaves" });
  }
};

/* =====================================================
   PERFORMANCE MANAGEMENT
===================================================== */
export const createPerformanceNote = async (req, res) => {
  try {
    const { teacherId, evaluationPeriod, criteria, ratings, comments, overallRating } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const performance = await Performance.create({
      teacherId,
      evaluationPeriod,
      criteria,
      ratings,
      comments,
      overallRating,
      evaluatedBy: req.user.id,
      createdAt: new Date()
    });

    res.json({ 
      message: "Performance evaluation created successfully",
      performance 
    });
  } catch (err) {
    console.error("Create performance note error:", err);
    res.status(500).json({ message: "Failed to create performance evaluation" });
  }
};

export const getTeacherPerformance = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const performances = await Performance.find({ teacherId })
      .populate('evaluatedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ performances });
  } catch (err) {
    console.error("Get teacher performance error:", err);
    res.status(500).json({ message: "Failed to get teacher performance" });
  }
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

