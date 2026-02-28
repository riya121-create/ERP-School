import Timetable from "../models/Timetable.js";

/* =====================================================
   COMMON HELPERS
===================================================== */
const isOverlap = (aStart, aEnd, bStart, bEnd) => {
  return aStart < bEnd && aEnd > bStart;
};

/* =====================================================
   ADMIN: CREATE / UPDATE SINGLE DAY
===================================================== */
export const upsertTimetable = async (req, res) => {
  try {
    const { classId, section, day, periods } = req.body;

    if (!classId || !section || !day || !Array.isArray(periods)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    /* ---------- VALIDATION ---------- */
    for (const p of periods) {
      if (!p.startTime || !p.endTime || !p.subject || !p.teacherId) {
        return res.status(400).json({
          message: "Each period must have startTime, endTime, subject and teacher"
        });
      }

      if (p.startTime >= p.endTime) {
        return res.status(400).json({ message: "Invalid time range" });
      }
    }

    /* ---------- CLASH CHECK ---------- */
    const existing = await Timetable.find({ day })
      .select("classId section periods");

    for (const newP of periods) {
      for (const table of existing) {
        for (const oldP of table.periods) {
          if (!isOverlap(newP.startTime, newP.endTime, oldP.startTime, oldP.endTime))
            continue;

          if (
            table.classId.toString() === classId &&
            table.section === section
          ) {
            return res.status(400).json({
              message: `Class clash on ${day} (${newP.startTime})`
            });
          }

          if (oldP.teacherId?.toString() === newP.teacherId) {
            return res.status(400).json({
              message: `Teacher busy on ${day} (${newP.startTime})`
            });
          }
        }
      }
    }

    await Timetable.findOneAndUpdate(
      { classId, section, day },
      { periods },
      { upsert: true, new: true }
    );

    res.json({ message: "✅ Day timetable saved successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   ADMIN: GET TIMETABLE BY CLASS ID (EDIT / PREVIEW)
===================================================== */
export const getTimetableByClass = async (req, res) => {
  try {
    const { classId, section } = req.query;

    if (!classId || !section) {
      return res.status(400).json({ message: "classId & section required" });
    }

    const timetables = await Timetable.find({ classId, section })
      .populate("classId", "name section")
      .populate("periods.teacherId", "name")
      .sort({ day: 1 });

    res.json(timetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   ADMIN: CREATE FULL WEEK (CREATE MODE)
===================================================== */
export const upsertWeekTimetable = async (req, res) => {
  try {
    const { classId, section, days } = req.body;

    if (!classId || !section || !Array.isArray(days) || !days.length) {
      return res.status(400).json({ message: "Invalid weekly payload" });
    }

    /* ---------- VALIDATE ALL DAYS FIRST ---------- */
    for (const block of days) {
      const { day, periods } = block;
      if (!day || !Array.isArray(periods)) continue;

      const existing = await Timetable.find({ day })
        .select("classId section periods");

      for (const newP of periods) {
        if (!newP.startTime || !newP.endTime || !newP.subject || !newP.teacherId) {
          return res.status(400).json({ message: `Incomplete data on ${day}` });
        }

        if (newP.startTime >= newP.endTime) {
          return res.status(400).json({ message: `Invalid time range on ${day}` });
        }

        for (const table of existing) {
          for (const oldP of table.periods) {
            if (!isOverlap(newP.startTime, newP.endTime, oldP.startTime, oldP.endTime))
              continue;

            if (
              table.classId.toString() === classId &&
              table.section === section
            ) {
              return res.status(400).json({
                message: `Class clash on ${day} (${newP.startTime})`
              });
            }

            if (oldP.teacherId?.toString() === newP.teacherId) {
              return res.status(400).json({
                message: `Teacher busy on ${day} (${newP.startTime})`
              });
            }
          }
        }
      }
    }

    /* ---------- SAVE ---------- */
    for (const block of days) {
      const { day, periods } = block;

      await Timetable.findOneAndUpdate(
        { classId, section, day },
        { periods },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "✅ Timetable created successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   ADMIN: UPDATE FULL WEEK (EDIT MODE - SAFE)
===================================================== */
export const updateWeekTimetable = async (req, res) => {
  try {
    const { classId, section, days } = req.body;

    if (!classId || !section || !Array.isArray(days)) {
      return res.status(400).json({ message: "Invalid update payload" });
    }

    /* ---------- VALIDATE FIRST (NO DELETE) ---------- */
    for (const block of days) {
      const { day, periods } = block;
      if (!day || !Array.isArray(periods)) continue;

      const existing = await Timetable.find({ day })
        .select("classId section periods");

      for (const newP of periods) {
        if (!newP.startTime || !newP.endTime || !newP.subject || !newP.teacherId) {
          return res.status(400).json({ message: `Incomplete data on ${day}` });
        }

        if (newP.startTime >= newP.endTime) {
          return res.status(400).json({ message: `Invalid time range on ${day}` });
        }

        for (const table of existing) {
          for (const oldP of table.periods) {
            if (!isOverlap(newP.startTime, newP.endTime, oldP.startTime, oldP.endTime))
              continue;

            if (oldP.teacherId?.toString() === newP.teacherId) {
              return res.status(400).json({
                message: `Teacher busy on ${day} (${newP.startTime})`
              });
            }
          }
        }
      }
    }

    /* ---------- SAFE UPSERT ---------- */
    for (const block of days) {
      const { day, periods } = block;

      await Timetable.findOneAndUpdate(
        { classId, section, day },
        { periods },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "✅ Timetable updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   STUDENT: VIEW WEEKLY
===================================================== */
export const getStudentTimetable = async (req, res) => {
  try {
    // 🔥 populate class to get section
    const student = await req.user.populate("classId", "section");

    if (!student.classId) {
      return res.json([]);
    }

    const timetable = await Timetable.find({
      classId: student.classId._id,
      section: student.classId.section
    })
      .populate("periods.teacherId", "name")
      .sort({ day: 1 });

    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   ADMIN: VIEW ALL
===================================================== */
export const getAllTimetablesForAdmin = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("classId", "name section")
      .populate("periods.teacherId", "name")
      .sort({ "classId.name": 1, section: 1, day: 1 });

    res.json(timetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   TEACHER: VIEW OWN
===================================================== */
export const getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const timetables = await Timetable.find({
      "periods.teacherId": teacherId
    })
      .populate("classId", "name section")
      .populate("periods.teacherId", "name")
      .sort({ day: 1 });

    const teacherTimetable = timetables.map(t => ({
      _id: t._id,
      day: t.day,
      classId: t.classId,
      periods: t.periods.filter(
        p => p.teacherId && p.teacherId._id.toString() === teacherId.toString()
      )
    }));

    res.json(teacherTimetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
