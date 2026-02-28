import mongoose from "mongoose";

/* ================= FEE COMPONENT ================= */
const FeeComponentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ["Monthly", "One Time"],
      required: true,
    },
    refundable: { type: Boolean, default: false },
    optional: { type: Boolean, default: false },
  },
  { _id: false }
);

/* ================= TRANSPORT CONFIG ================= */
const TransportConfigSchema = new mongoose.Schema(
  {
    feeMode: {
      type: String,
      enum: ["TRANSPORT", "STOP"],
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    transportFee: Number, // monthly (TRANSPORT mode)
    stopFees: {
      type: Map,
      of: Number, 
       default: {}, // { stopId: monthlyFee }
    },
    
    // 🔥 ADD THIS
    stopNames: {
      type: Map,
      of: String,
       default: {},
  },
},
  { _id: false }
);

/* ================= CALCULATED BREAKDOWN ================= */
const CalculatedBreakdownSchema = new mongoose.Schema(
  {
    tuition: {
      monthly: { type: Number, default: 0 },
      annual: { type: Number, default: 0 },
    },

    transport: {
      monthly: { type: Number, default: 0 },
      annual: { type: Number, default: 0 },
    },

    stopWise: [
      {
        stopId: {
          type: String, // ObjectId as string
          required: true,
        },
          stopName: {
      type: String,
      required: true,
    },
        transportMonthly: Number,
        transportAnnual: Number,
        totalMonthly: Number, // tuition + transport
        totalAnnual: Number,
      },
    ],
  },
  { _id: false }
);

/* ================= MAIN FEE STRUCTURE ================= */
const FeeStructureSchema = new mongoose.Schema(
  {
    session: {
  type: String,
  required: true,
  trim: true,
},

className: {
  type: String,
  required: true,
  trim: true,
},

section: {
  type: String,
  required: true,
  trim: true,
  uppercase: true,   // 🔥 "b" → "B"
},

   structureName: {
  type: String,
  required: true,
  trim: true,
},


    components: {
      type: [FeeComponentSchema],
      required: true,
    },





    transportConfig: TransportConfigSchema,

    financeSummary: {
      monthlyBase: { type: Number, required: true },
      annualBase: { type: Number, required: true },
    },

    calculatedBreakdown: CalculatedBreakdownSchema,

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "LOCKED"],
      default: "DRAFT",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* ================= UNIQUE INDEX ================= */
FeeStructureSchema.index(
  { session: 1, className: 1, section: 1 },
  { unique: true }
);

export default mongoose.model("FeeStructure", FeeStructureSchema);
