export const adminSidebarConfig = [
  /* ======================
     CORE
  ====================== */
  {
    section: "Core",
    items: [
      { label: "Dashboard", icon: "📊", to: "/admin" },
    ],
  },

  /* ======================
     ACADEMIC
  ====================== */
  {
    section: "Academic",
    items: [
      // 🔥 MOST USED
      { label: "Classes", icon: "🏫", to: "/admin/classes" },

      { label: "Academic Structure", icon: "📘", to: "/admin/academic-structure" },

      {
        label: "Timetable",
        icon: "📅",
        children: [
          { label: "Create Timetable", icon: "➕", to: "/admin/timetable/create" },
          { label: "Timetable List", icon: "📋", to: "/admin/timetable/list" },
        ],
      },
{
  label: "Attendance",
  icon: "🕒",
  children: [
    {
      label: "Overview",
      icon: "📊",
      to: "/admin/attendance",
    },
    {
      label: "By Class",
      icon: "🏫",
      to: "/admin/attendance/classes",
    },
    {
      label: "By Student",
      icon: "🎓",
      to: "/admin/attendance/students",
    },
    {
      label: "Audit Logs",
      icon: "🧾",
      to: "/admin/attendance/logs",
    },
  ],
},

    ],
  },

  /* ======================
     USERS
  ====================== */
  {
    section: "Users",
    items: [
      { label: "Students", icon: "🎓", to: "/admin/students" },
      { label: "Teachers", icon: "👩‍🏫", to: "/admin/teachers" },
      { label: "Teacher Activity", icon: "🟢", to: "/admin/teacher-activity" },
    ],
  },

  /* ======================
     EXAMINATION
  ====================== */
  {
    section: "Examination",
    items: [
      {
        label: "Examination Authority",
        icon: "🎓",
        children: [
          { label: "Create Final Exam", icon: "➕", to: "/admin/exams/final/create" },
          { label: "All Final Exams", icon: "📑", to: "/admin/exams/final" },
        ],
      },
    ],
  },






  
  /* ======================
     FINANCE
  ====================== */
  {
    section: "Finance",
    items: [
      {
        label: "Fee Management",
        icon: "💰",
        children: [
          { label: "Fee Structure", icon: "🧾", to: "/admin/fees/structure" },
          { label: "Fee Collection", icon: "💳", to: "/admin/fees/collection" },
        ],
      },
      {
        label: "Payroll",
        icon: "💼",
        children: [
          { label: "Salary Structure", icon: "🧮", to: "/admin/payroll/structure" },
          { label: "Salary Slips", icon: "📄", to: "/admin/payroll/slips" },
        ],
      },
    ],
  },


  {
    section: "Vechicles",
    items: [
      {
        label: "Transport",
        icon: "🚌",
        to: "/admin/fees/transport",
      },
    ],
  },
];










