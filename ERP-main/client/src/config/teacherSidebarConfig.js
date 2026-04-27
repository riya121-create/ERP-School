export const teacherSidebarConfig = [
  {
    section: "Core",
    items: [
      { label: "Dashboard", icon: "📊", to: "/teacher" },
    ],
  },
  {
    section: "Academic",
    items: [
      { label: "My Classes",  icon: "🏫", to: "/teacher/classes"    },
      { label: "Timetable",   icon: "📅", to: "/teacher/timetable"  },
      { label: "Attendance",  icon: "🕒", to: "/teacher/attendance" },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "Homework",    icon: "📝", to: "/teacher/homework" },
      { label: "Notes",       icon: "📁", to: "/teacher/notes"    },
    ],
  },
  {
    section: "Examination",
    items: [
      {
        label: "Exam Centre",
        icon: "🎓",
        children: [
          { label: "Hub",         icon: "🏠", to: "/teacher/exams"             },
          { label: "Create Exam", icon: "➕", to: "/teacher/exams/create"      },
          { label: "My Exams",    icon: "📋", to: "/teacher/exams/list"        },
          { label: "Performance", icon: "📈", to: "/teacher/exams/performance" },
        ],
      },
    ],
  },
];
