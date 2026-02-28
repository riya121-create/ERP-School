import User from "../models/User.js";
import FeeStructure from "../models/FeeStructure.js";
import TransportVehicle from "../models/TransportVehicle.js";

export const getParentFeeSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    /* ================= FIND STUDENT (BACKWARD SAFE) ================= */
    const student = await User.findOne({
      _id: studentId,
      role: "student",
      isActive: true,
      $or: [
        { parentId: req.user._id },       // ✅ new system
        { parentPhone: req.user.phone }   // ✅ old system support
      ]
    })
      .populate("classId", "name section")
      .lean();

    if (!student) {
      return res.status(404).json({
        message: "Student not found or not linked to this parent"
      });
    }

    if (!student.classId) {
      return res.status(404).json({
        message: "Student is not assigned to any class"
      });
    }

    /* ================= FIND LATEST FEE STRUCTURE ================= */
    const feeStructure = await FeeStructure.findOne({
      className: student.classId.name,
      section: student.classId.section
    })
      .sort({ createdAt: -1 }) // 🔥 MOST IMPORTANT
      .lean();

    if (!feeStructure) {
      return res.status(404).json({
        message: "Fee structure not configured for this class"
      });
    }

    const breakdown = feeStructure.calculatedBreakdown || {};

    /* ================= TUITION ================= */
    const tuition = {
      monthly: breakdown.tuition?.monthly || 0,
      annual: breakdown.tuition?.annual || 0
    };

    /* ================= TRANSPORT ================= */
    let transport = { enabled: false };
    let transportMonthly = 0;
    let transportAnnual = 0;

    // CLASS LEVEL TRANSPORT
    if (feeStructure.transportConfig?.feeMode === "TRANSPORT") {
      transport = {
        enabled: true,
        mode: "TRANSPORT",
        monthly: breakdown.transport?.monthly || 0,
        annual: breakdown.transport?.annual || 0
      };
      transportMonthly = transport.monthly;
      transportAnnual = transport.annual;
    }

    // STOP LEVEL TRANSPORT
    if (
      feeStructure.transportConfig?.feeMode === "STOP" &&
      student.transport?.stopName
    ) {
      const stop = breakdown.stopWise?.find(
        s => s.stopName === student.transport.stopName
      );

      if (stop) {
        transportMonthly = stop.transportMonthly || 0;
        transportAnnual = stop.transportAnnual || 0;

        let vehicle = null;
        if (student.transport.vehicle) {
          vehicle = await TransportVehicle.findById(
            student.transport.vehicle
          ).lean();
        }

        transport = {
          enabled: true,
          mode: "STOP",
          stopName: stop.stopName,
          monthly: transportMonthly,
          annual: transportAnnual,
          vehicleNo: vehicle?.vehicleNo || null,
          routeName: vehicle?.route?.routeName || null,
          pickupTime:
            vehicle?.route?.stops?.find(
              s => s.stopName === stop.stopName
            )?.pickupTime || null
        };
      }
    }

    /* ================= TOTAL ================= */
    const total = {
      monthly: tuition.monthly + transportMonthly,
      annual: tuition.annual + transportAnnual
    };

    /* ================= RESPONSE ================= */
    return res.json({
      student: {
        _id: student._id,
        name: student.name,
        className: student.classId.name,
        section: student.classId.section
      },
      tuition,
      transport,
      total
    });
  } catch (err) {
    console.error("❌ PARENT FEES ERROR:", err);
    res.status(500).json({
      message: "Failed to load fee summary"
    });
  }
};
