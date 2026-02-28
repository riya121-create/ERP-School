import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import FeeStructure from "../models/FeeStructure.js";

const router = express.Router();

/* =====================================================
   CREATE FEE STRUCTURE
   POST /admin/fees/structure
===================================================== */
router.post("/structure", protect(["admin"]), async (req, res) => {

  try {
    const {
  session,
  className,
  section,
  structureName,
  components,
  transportConfig,
  status,
} = req.body;


    /* ===== BASIC VALIDATION ===== */
    if (!session || !className || !section) {

      return res.status(400).json({
        message: "Session, Class and Section are required"
      });
    }

    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({
        message: "At least one fee component required"
      });
    }

    /* ===== DUPLICATE CHECK ===== */
  const normalizedSection = section.toUpperCase();

const exists = await FeeStructure.findOne({
  session,
  className,
  section: normalizedSection
});


    if (exists) {
      return res.status(400).json({
        message: "Fee structure already exists for this class & section"
      });
    }

    /* =====================================================
       CALCULATION ENGINE (BACKEND IS AUTHORITY)
    ===================================================== */
    const calculatedBreakdown = {
      tuition: { monthly: 0, annual: 0 },
      transport: { monthly: 0, annual: 0 },
      stopWise: []
    };

    /* ===== TUITION CALCULATION ===== */
    components.forEach(c => {
      const amt = Number(c.amount || 0);

      if (c.frequency === "Monthly") {
        calculatedBreakdown.tuition.monthly += amt;
        calculatedBreakdown.tuition.annual += amt * 12;
      } else {
        calculatedBreakdown.tuition.annual += amt;
      }
    });

    /* ===== TRANSPORT: CLASS LEVEL ===== */
    if (transportConfig?.feeMode === "TRANSPORT") {
      const tf = Number(transportConfig.transportFee || 0);
      calculatedBreakdown.transport.monthly = tf;
      calculatedBreakdown.transport.annual = tf * 12;
    }

    /* ===== TRANSPORT: STOP LEVEL (INDEX-BASED) ===== */
    
if (transportConfig?.feeMode === "STOP") {
  Object.entries(transportConfig.stopFees || {}).forEach(
    ([stopIndex, fee]) => {
      const m = Number(fee || 0);
      const stopName = transportConfig?.stopNames?.[stopIndex];

      // 🔥 MOST IMPORTANT LINE
      if (!stopName) return; // invalid stop → skip

      calculatedBreakdown.stopWise.push({
        stopId: String(stopIndex),
        stopName, // ✅ always valid now
        transportMonthly: m,
        transportAnnual: m * 12,
        totalMonthly: calculatedBreakdown.tuition.monthly + m,
        totalAnnual: calculatedBreakdown.tuition.annual + m * 12
      });
    }
  );

  calculatedBreakdown.transport.monthly = 0;
  calculatedBreakdown.transport.annual = 0;
}



    /* ===== FINAL FINANCE SUMMARY ===== */
    const financeSummary = {
      monthlyBase:
        calculatedBreakdown.tuition.monthly +
        calculatedBreakdown.transport.monthly,
      annualBase:
        calculatedBreakdown.tuition.annual +
        calculatedBreakdown.transport.annual
    };

    /* ===== SAVE ===== */
const structure = await FeeStructure.create({
  session,
  className,
  section: normalizedSection,

  structureName,
  components,
  transportConfig,
  financeSummary,       // frontend + backend match
  calculatedBreakdown,
  status: status || "ACTIVE",
  createdBy: req.user?._id
});


    res.status(201).json({
      message: "Fee structure saved successfully",
      data: structure
    });
  } catch (err) {
    console.error("❌ FEE STRUCTURE SAVE ERROR:", err);
    res.status(500).json({
      message: "Failed to save fee structure"
    });
  }
});

/* =====================================================
   GET FEE STRUCTURES
   GET /admin/fees/structure
   👉 NO RE-CALCULATION (ERP RULE)
===================================================== */
router.get("/structure", protect(["admin"]), async (req, res) => {

  try {
    const structures = await FeeStructure.find()
      .sort({ createdAt: -1 })
      .lean();

    // ✅ backend authority — return stored breakdown
    res.json(structures);
  } catch (err) {
    console.error("❌ FEE STRUCTURE FETCH ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch fee structures"
    });
  }
});

export default router;
