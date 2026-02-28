import mongoose from "mongoose";

/* =========================
   PERIOD SCHEMA
========================= */
const periodSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/ // HH:mm
    },

    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    room: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

/* =========================
   TIMETABLE SCHEMA
========================= */
const timetableSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true
    },

    section: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      index: true
    },

    periods: {
      type: [periodSchema],
      validate: {
        validator: function (periods) {
          if (!Array.isArray(periods) || periods.length === 0) return false;

          // ❌ duplicate / overlapping slots inside same day
          for (let i = 0; i < periods.length; i++) {
            for (let j = i + 1; j < periods.length; j++) {
              const a = periods[i];
              const b = periods[j];

              const overlap =
                a.startTime < b.endTime && a.endTime > b.startTime;

              if (overlap) return false;
            }
          }

          return true;
        },
        message: "Overlapping or invalid periods detected in same timetable"
      }
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

/* =========================
   UNIQUE CONSTRAINT
========================= */
// ✅ ONE timetable per Class + Section + Day
timetableSchema.index(
  { classId: 1, section: 1, day: 1 },
  { unique: true }
);

export default mongoose.model("Timetable", timetableSchema);
