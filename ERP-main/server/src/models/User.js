import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* =====================
       COMMON (ALL ROLES)
    ====================== */
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    password: {
      type: String
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent"],
      required: true,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    /* =====================
       STUDENT ACADEMIC LIFECYCLE
       (NEVER DELETE STUDENT)
    ====================== */
    academicStatus: {
      type: String,
      enum: [
        "active",      // currently studying
        "expelled",    // removed by admin
        "transferred", // moved to another school
        "alumni"       // passed out
      ],
      default: "active",
      index: true
    },

    statusReason: {
      type: String,
      default: null
    },

    statusChangedAt: {
      type: Date,
      default: null
    },

    /* =====================
       CLASS TRACKING
       (FOR PROMOTION / CLASS CHANGE)
    ====================== */
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
      index: true
    },

    previousClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null
    },

    /* =====================
       SECURITY
    ====================== */
    isPasswordChanged: {
      type: Boolean,
      default: false
    },

    passwordChangedAt: {
      type: Date,
      default: null
    },

    /* =====================
       TEACHER DETAILS
    ====================== */
    employeeId: String,
    department: String,
    qualification: String,
    experience: Number,

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },

    joiningDate: Date,
    address: String,

    /* =====================
       STUDENT DETAILS
    ====================== */
    admissionNo: {
      type: String,
      unique: true,
      sparse: true
    },

    rollNo: String,
    dob: Date,

    parentName: String,
    parentPhone: String,
    /* =====================
   TRANSPORT DETAILS
===================== */
transport: {
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TransportVehicle",
    default: null
  },
  routeName: String,
  stopName: String
}
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
