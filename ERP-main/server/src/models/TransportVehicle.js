import mongoose from "mongoose";

/* =========================
   SUB-SCHEMA : STOP
========================= */
const stopSchema = new mongoose.Schema(
  {
    stopName: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      trim: true,
    },

    pickupTime: {
      type: String, // e.g. "07:10 AM"
      required: true,
    },

    order: {
      type: Number, // 1, 2, 3...
      required: true,
    },
  },
  { _id: false }
);

/* =========================
   SUB-SCHEMA : ROUTE
========================= */
const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: true,
      trim: true,
    },

    routeCode: {
      type: String, // e.g. R-12
      trim: true,
    },

    startLocation: {
      type: String, // School / Depot
      required: true,
      trim: true,
    },

    endLocation: {
      type: String, // Last stop area
      required: true,
      trim: true,
    },

    /* ===== MORNING TIMING ===== */
    morningStartTime: {
      type: String, // "06:45 AM"
      required: true,
    },

    morningEndTime: {
      type: String, // "08:15 AM"
      required: true,
    },

    /* ===== EVENING TIMING ===== */
    eveningStartTime: {
      type: String, // "02:30 PM"
    },

    eveningEndTime: {
      type: String, // "04:00 PM"
    },

    distanceKm: {
      type: Number, // total route distance
    },

    stops: {
      type: [stopSchema],
      default: [],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/* =========================
   MAIN TRANSPORT VEHICLE
========================= */
const transportVehicleSchema = new mongoose.Schema(
  {
    /* ===== VEHICLE INFO ===== */
    vehicleNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    vehicleType: {
      type: String,
      enum: ["Bus", "Van", "Auto"],
      default: "Bus",
    },

    capacity: {
      type: Number,
      required: true,
    },

    /* ===== DRIVER DETAILS ===== */
    driver: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      licenseNo: {
        type: String,
        trim: true,
      },
    },

    /* ===== CONDUCTOR DETAILS ===== */
    conductor: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },

    /* ===== ROUTE ASSIGNMENT ===== */
    route: routeSchema,

    /* ===== VEHICLE STATUS ===== */
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },

    /* ===== META ===== */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "TransportVehicle",
  transportVehicleSchema
);
