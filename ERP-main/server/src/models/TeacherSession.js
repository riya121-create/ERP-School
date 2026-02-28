import mongoose from "mongoose";

/*
  SESSION STATUS FLOW:
  - ACTIVE    → logged in & recently active
  - INACTIVE  → no activity (auto-offline)
  - LOGGED_OUT→ explicit logout
  - EXPIRED   → token/session expired
*/

const teacherSessionSchema = new mongoose.Schema(
  {
    /* =====================
       CORE RELATION
    ===================== */
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* =====================
       SESSION IDENTITY
    ===================== */
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    /* =====================
       TIMESTAMPS
    ===================== */
    loginAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    logoutAt: {
      type: Date,
      default: null
    },

    /* =====================
       SESSION STATUS
    ===================== */
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LOGGED_OUT", "EXPIRED"],
      default: "ACTIVE",
      index: true
    },

    /* =====================
       CLIENT INFO
    ===================== */
    ipAddress: {
      type: String
    },

    device: {
      type: String
    },

    browser: {
      type: String
    },

    os: {
      type: String
    },

    /* =====================
       LOCATION (OPTIONAL)
    ===================== */
    location: {
      country: String,
      city: String,
      timezone: String
    },

    /* =====================
       SECURITY FLAGS
    ===================== */
    isForceLoggedOut: {
      type: Boolean,
      default: false
    },

    logoutReason: {
      type: String,
      enum: [
        "USER_LOGOUT",
        "INACTIVITY",
        "TOKEN_EXPIRED",
        "ADMIN_FORCE",
        null
      ],
      default: null
    }
  },
  {
    timestamps: true
  }
);

/* =====================
   INDEXES (FAANG LEVEL)
===================== */
teacherSessionSchema.index({ teacherId: 1, status: 1 });
teacherSessionSchema.index({ lastSeenAt: 1 });
teacherSessionSchema.index({ createdAt: 1 });

/* =====================
   VIRTUALS
===================== */
teacherSessionSchema.virtual("isOnline").get(function () {
  return this.status === "ACTIVE";
});

/* =====================
   METHODS
===================== */
teacherSessionSchema.methods.markLogout = function (reason = "USER_LOGOUT") {
  this.logoutAt = new Date();
  this.status = "LOGGED_OUT";
  this.logoutReason = reason;
  return this.save();
};

teacherSessionSchema.methods.markInactive = function () {
  this.status = "INACTIVE";
  this.logoutReason = "INACTIVITY";
  return this.save();
};

teacherSessionSchema.methods.touch = function () {
  this.lastSeenAt = new Date();
  if (this.status !== "ACTIVE") {
    this.status = "ACTIVE";
    this.logoutReason = null;
  }
  return this.save();
};

const TeacherSession = mongoose.model(
  "TeacherSession",
  teacherSessionSchema
);

export default TeacherSession;
