import mongoose from "mongoose";

/* =========================
   SYLLABUS SCHEMA
========================= */
const syllabusSchema = new mongoose.Schema({
  chapter: { type: String, required: true },
  topics: [String]
});

/* =========================
   EXAM SCHEMA
========================= */
const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    type: {
      type: String,
      enum: ["Unit Test", "Mid Term", "Final", "Practical"],
      required: true
    },

    mode: {
      type: String,
      enum: ["Offline", "Online"],
      default: "Offline"
    },

    /* 🔹 MAIN SUBJECT (for listing / UI) */
    subject: { type: String, required: true },

    /* =========================
       CLASSES + SUBJECT ↔ TEACHER MAP
    ========================= */
    classes: [
      {
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
          required: true
        },

        section: {
          type: String,
          trim: true
        },

        /* 🔥 REQUIRED for teacher access control */
        subjects: [
          {
            name: {
              type: String,
              required: true,
              trim: true
            },
            teacherId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true
            }
          }
        ]
      }
    ],

    /* =========================
       EXAM TIMING
    ========================= */
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    /* =========================
       MARKING
    ========================= */
    maxMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },

    /* =========================
       EVALUATION / GRADING RULES
    ========================= */
    evaluationRules: {
      type: [
        {
          label: { type: String, required: true }, // Excellent / Good / Poor
          minMarks: { type: Number, required: true },
          maxMarks: { type: Number, required: true },
          remark: { type: String }
        }
      ],
      default: []
    },

    /* =========================
       SYLLABUS
    ========================= */
    syllabus: [syllabusSchema],

    /* =========================
       EXAM RULES
    ========================= */
    rules: {
      allowAbsent: { type: Boolean, default: true },
      autoGrade: { type: Boolean, default: true },
      lockAfterPublish: { type: Boolean, default: true },
      reEvaluation: { type: Boolean, default: false },
      graceMarks: { type: Boolean, default: false }
    },

    /* =========================
       EXAM VISIBILITY
    ========================= */
    scope: {
      type: String,
      enum: ["CUSTOM", "GLOBAL"],
      default: "CUSTOM"
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT"
    },

    marksStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING"
    },

    /* =========================
       META
    ========================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

/* =========================
   INDEXES (PERFORMANCE)
========================= */
examSchema.index({ "classes.subjects.teacherId": 1 });
examSchema.index({ status: 1 });
examSchema.index({ scope: 1 });

export default mongoose.model("Exam", examSchema);
