import csv from "csv-parser";
import { Readable } from "stream";
import User from "../models/User.js";

/* =====================================================
   CONSTANTS
===================================================== */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

/* =====================================================
   UTILITY HELPERS (🔥 IMPORTANT)
===================================================== */

// normalize any string (name/day/etc)
const normalize = (val = "") =>
  val
    .toString()
    .trim()
    .replace(/\s+/g, " ")     // multiple spaces → single
    .toLowerCase();

// normalize day with proper casing
const normalizeDay = (day) => {
  const d = normalize(day);
  return DAYS.find(x => x.toLowerCase() === d) || null;
};

const isOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && aEnd > bStart;

/* =====================================================
   ADMIN: CSV PREVIEW (NO DB WRITE)
===================================================== */
export const previewTimetableCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const rows = [];

    /* ---------- READ CSV FROM MEMORY ---------- */
    Readable.from(req.file.buffer)
      .pipe(csv({ mapHeaders: ({ header }) => normalize(header) }))
      .on("data", data => rows.push(data))
      .on("end", async () => {
        try {
          /*
            CSV HEADERS (flexible):
            day,starttime,endtime,subject,teachername
          */

          const errors = [];
          const weekMap = {};

          DAYS.forEach(d => (weekMap[d] = []));

          /* ---------- LOAD TEACHERS (ONCE) ---------- */
          const teachers = await User.find({ role: "teacher" })
            .select("_id name email");

          // build strong lookup map
          const teacherMap = {};
          teachers.forEach(t => {
            teacherMap[normalize(t.name)] = t._id;
          });

          /* ---------- PARSE EACH ROW ---------- */
          rows.forEach((row, index) => {
            const rowNum = index + 2;

            const dayRaw = row.day;
            const startTime = row.starttime?.trim();
            const endTime = row.endtime?.trim();
            const subject = row.subject?.trim();
            const teacherRaw = row.teachername;

            /* ---- REQUIRED FIELDS ---- */
            if (!dayRaw || !startTime || !endTime || !subject || !teacherRaw) {
              errors.push(`Row ${rowNum}: Missing required fields`);
              return;
            }

            /* ---- DAY FIX ---- */
            const day = normalizeDay(dayRaw);
            if (!day) {
              errors.push(`Row ${rowNum}: Invalid day "${dayRaw}"`);
              return;
            }

            /* ---- TIME CHECK ---- */
            if (startTime >= endTime) {
              errors.push(`Row ${rowNum}: Invalid time range`);
              return;
            }

            /* ---- TEACHER MATCH (🔥 BULLETPROOF) ---- */
            const teacherKey = normalize(teacherRaw);
            const teacherId = teacherMap[teacherKey];

            if (!teacherId) {
              errors.push(
                `Row ${rowNum}: Teacher "${teacherRaw}" not found`
              );
              return;
            }

            weekMap[day].push({
              startTime,
              endTime,
              subject,
              teacherId,
              teacherName: teacherRaw.trim() // preview only
            });
          });

          /* ---------- OVERLAP CHECK ---------- */
          for (const day of DAYS) {
            const periods = weekMap[day];

            for (let i = 0; i < periods.length; i++) {
              for (let j = i + 1; j < periods.length; j++) {
                const a = periods[i];
                const b = periods[j];

                if (isOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
                  errors.push(
                    `${day}: Overlap ${a.startTime}-${a.endTime}`
                  );
                }
              }
            }

            periods.sort((a, b) =>
              a.startTime.localeCompare(b.startTime)
            );
          }

          /* ---------- RESPONSE ---------- */
          return res.json({
            preview: DAYS.map(day => ({
              day,
              periods: weekMap[day]
            })),
            errors
          });

        } catch (err) {
          return res.status(500).json({ message: err.message });
        }
      });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
