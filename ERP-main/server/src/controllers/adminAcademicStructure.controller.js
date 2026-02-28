import Timetable from "../models/Timetable.js";

/* =====================================================
   ADMIN: ACADEMIC STRUCTURE (NORMALIZED + SAFE)
===================================================== */
export const getAcademicStructure = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("classId", "name")
      .populate("periods.teacherId", "name email");

    const structure = {};

    for (const tt of timetables) {
      const className = tt.classId?.name || "Unknown Class";
      const section = tt.section || "—";

      if (!structure[className]) structure[className] = {};
      if (!structure[className][section])
        structure[className][section] = {};

      for (const p of tt.periods) {
        if (!p.subject) continue;

      const subject = p.subject.trim().toUpperCase();


        if (!structure[className][section][subject]) {
          structure[className][section][subject] = {
            teachers: {},          // 👈 multiple teachers supported
            periodsPerWeek: 0
          };
        }

        const teacherId = p.teacherId?._id?.toString();

        // 👇 teacher safe handling
        if (teacherId) {
          if (!structure[className][section][subject].teachers[teacherId]) {
            structure[className][section][subject].teachers[teacherId] = {
              teacherId,
          teacherName: p.teacherId?.name || "Unassigned"

            };
          }
        }

        structure[className][section][subject].periodsPerWeek += 1;
      }
    }

    /* =================================================
       🔄 FLATTEN FOR FRONTEND (BACKWARD COMPATIBLE)
    ================================================= */
    const formatted = {};

    Object.entries(structure).forEach(([className, sections]) => {
      formatted[className] = {};

      Object.entries(sections).forEach(([section, subjects]) => {
        formatted[className][section] = {};

        Object.entries(subjects).forEach(([subject, info]) => {
          const teachersArr = Object.values(info.teachers);

          // 🔥 if only one teacher → same structure as UI expects
          if (teachersArr.length === 1) {
            formatted[className][section][subject] = {
              teacherId: teachersArr[0].teacherId,
              teacherName: teachersArr[0].teacherName,
              periodsPerWeek: info.periodsPerWeek
            };
          } else {
            // 🔥 multiple teachers → merged display
            formatted[className][section][subject] = {
              teacherId: null,
              teacherName: teachersArr
                .map(t => t.teacherName)
                .join(", "),
              periodsPerWeek: info.periodsPerWeek
            };
          }
        });
      });
    });

    res.json(formatted);
  } catch (err) {
    console.error("ACADEMIC STRUCTURE ERROR:", err);
    res.status(500).json({
      message: "Failed to load academic structure"
    });
  }
};
