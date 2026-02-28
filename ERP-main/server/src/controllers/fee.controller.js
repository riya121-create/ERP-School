import User from "../models/User.js";
import FeeStructure from "../models/FeeStructure.js";
import FeePayment from "../models/FeePayment.js";

/* =========================================
   GET STUDENT FEE PROFILE (ADMIN)
========================================= */
export const getStudentFeeProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findOne({
      _id: studentId,
      role: "student",
      academicStatus: "active",
      isActive: true
    })
      .populate("classId", "name section")
      .lean();

    if (!student || !student.classId) {
      return res.status(404).json({
        message: "Student or class not found"
      });
    }

    const structure = await FeeStructure.findOne({
      className: student.classId.name,
      section: student.classId.section,
       session: "2026-27",  
      status: "ACTIVE"
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!structure) {
      return res.status(404).json({
        message: "Fee structure not configured"
      });
    }

    const payments = await FeePayment.find({
      studentId: student._id
    });

    const totalPaid = payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    const totalAnnual =
      structure.financeSummary?.annualBase || 0;

    const totalDue = Math.max(totalAnnual - totalPaid, 0);

    return res.json({
      student: {
        _id: student._id,
        name: student.name,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo
      },
      totalAnnual,
      totalPaid,
      totalDue,
      status: totalDue === 0 ? "PAID" : "DUE"
    });
  } catch (err) {
    console.error("FEE PROFILE ERROR:", err);
    res.status(500).json({
      message: "Failed to load fee profile"
    });
  }
};

/* =========================================
   GET PAYMENT HISTORY
========================================= */
export const getStudentPayments = async (req, res) => {
  try {
    const payments = await FeePayment.find({
      studentId: req.params.studentId
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load payments"
    });
  }
};

/* =========================================
   COLLECT FEE (ADMIN)
========================================= */
export const collectFee = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      paymentMode,
      referenceNo
    } = req.body;

    if (!studentId || !amount) {
      return res.status(400).json({
        message: "Student & amount required"
      });
    }

    const receiptNo = `RCPT-${Date.now()}`;

    await FeePayment.create({
      studentId,
      amount,
      paymentMode,
      referenceNo,
      receiptNo,
      collectedBy: req.user._id
    });

    res.json({
      message: "Fee collected successfully",
      receiptNo
    });
  } catch (err) {
    res.status(500).json({
      message: "Fee collection failed"
    });
  }
};
