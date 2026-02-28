import { BrowserRouter, Routes, Route, Outlet  } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AdminTimetable from "./pages/admin/AdminTimetable";
import AdminTimetableList from "./pages/admin/AdminTimetableList";
import TeacherTimetableMini from "./pages/teacher/TeacherTimetableMini";
import AddStudentBulk from "./pages/admin/AddStudentBulk";
import AdminTeacherActivity from "./pages/admin/AdminTeacherActivity";
import TeacherExamHub from "./pages/teacher/TeacherExamHub";
import TeacherExamView from "./pages/teacher/TeacherExamView";
import TeacherFinalExamMarks from "./pages/teacher/TeacherFinalExamMarks";

import TeacherExamList from "./pages/teacher/TeacherExamList";
import TeacherEnterMarks from "./pages/teacher/TeacherEnterMarks";
import TeacherExamResult from "./pages/teacher/TeacherExamResult";
import AdminCreateFinalExam from "./pages/admin/AdminCreateFinalExam";
import AdminFinalExamList from "./pages/admin/AdminFinalExamList";
import TeacherAdminFinalExamView from "./pages/teacher/TeacherAdminFinalExamView";

import TeacherClasses from "./pages/teacher/TeacherClasses";
import AdminFinalExamView from "./pages/admin/AdminFinalExamView";
import AdminAcademicStructure from "./pages/admin/AdminAcademicStructure";

import ProtectedRoute from "./routes/ProtectedRoute";

// ===== ADMIN =====
import AdminLayoutRoute from "@/pages/admin/AdminLayoutRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Teachers from "./pages/admin/Teachers";
import AddTeacher from "./pages/admin/AddTeacher";
import EditTeacher from "./pages/admin/EditTeacher";
import TeacherSubjects from "./pages/admin/TeacherSubjects";
import TeacherSalary from "./pages/admin/TeacherSalary";
import TeacherLeave from "./pages/admin/TeacherLeave";
import TeacherPerformance from "./pages/admin/TeacherPerformance";
import TestAPI from "./pages/admin/TestAPI";
import Classes from "./pages/admin/Classes";
import ClassDetails from "./pages/admin/ClassDetails";
import AddStudent from "./pages/admin/AddStudent";
import AdminStudents from "./pages/admin/AdminStudents";

// ===== OTHER ROLES =====
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/MarkAttendance";
import TeacherHomework from "./pages/teacher/TeacherHomework";
import TeacherNotes from "./pages/teacher/TeacherNotes";
import TeacherPublishResults from "./pages/teacher/TeacherPublishResults";
import StudentDashboard from "./pages/student/StudentDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentDashboardEnhanced from "./pages/parent/ParentDashboardEnhanced";
import ChildProfile from "./pages/parent/ChildProfile";
import TeacherCreateExam from "./pages/teacher/TeacherCreateExam"


import FeeStructure from "@/pages/admin/fees/FeeStructure";
import StudentFeeOptions from "@/pages/admin/fees/StudentFeeOptions";
import TransportManager from "@/pages/admin/transport/TransportManager";

// ===== ADMIN ATTENDANCE =====
import AdminAttendance from "@/pages/admin/attendance/AdminAttendance";
import AdminAttendanceByClass from "@/pages/admin/attendance/AdminAttendanceByClass";
import AdminAttendanceByStudent from "@/pages/admin/attendance/AdminAttendanceByStudent";
import AdminAttendanceLogs from "@/pages/admin/attendance/AdminAttendanceLogs";
import FeeCollection from "@/pages/admin/fees/FeeCollection";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 FORCE PASSWORD CHANGE */}
        <Route path="/change-password" element={<ProtectedRoute />}>
          <Route index element={<ChangePassword />} />
        </Route>

      {/* ================= ADMIN ================= */}
<Route path="/admin" element={<ProtectedRoute role="admin" />}>
  <Route element={<AdminLayoutRoute />}>

    <Route index element={<AdminDashboard />} />

    {/* ===== ACADEMIC ===== */}
    <Route path="classes" element={<Classes />} />
    <Route path="classes/:classId" element={<ClassDetails />} />
    <Route path="classes/:classId/add-student" element={<AddStudent />} />
    <Route
      path="classes/:classId/add-student/bulk"
      element={<AddStudentBulk />}
    />

    <Route
      path="academic-structure"
      element={<AdminAcademicStructure />}
    />
{/* ===== ATTENDANCE (ADMIN) ===== */}
<Route path="attendance" element={<Outlet />}>

  {/* Overview */}
  <Route index element={<AdminAttendance />} />

  {/* By Class */}
  <Route path="classes" element={<AdminAttendanceByClass />} />

  {/* By Student */}
  <Route path="students" element={<AdminAttendanceByStudent />} />

  {/* Audit Logs */}
  <Route path="logs" element={<AdminAttendanceLogs />} />

</Route>

    {/* ===== FEES (✅ SINGLE PARENT) ===== */}
    <Route path="fees" element={<Outlet />}>

      {/* Fee master */}
      <Route path="structure" element={<FeeStructure />} />

      {/* Class-level fee allocation */}
      <Route path="allocation" element={<StudentFeeOptions />} />

      {/* Transport master */}
      <Route path="transport" element={<TransportManager />} />
       <Route path="collection" element={<FeeCollection />} />

    </Route>

    {/* ===== USERS ===== */}
    <Route path="students" element={<AdminStudents />} />
    <Route path="teachers" element={<Teachers />} />
    <Route path="teachers/add" element={<AddTeacher />} />
    <Route path="teachers/edit/:teacherId" element={<EditTeacher />} />
    <Route path="teachers/:teacherId/subjects" element={<TeacherSubjects />} />
    <Route path="teachers/:teacherId/salary" element={<TeacherSalary />} />
    <Route path="teachers/:teacherId/leave" element={<TeacherLeave />} />
    <Route path="teachers/:teacherId/performance" element={<TeacherPerformance />} />
    <Route path="test-api" element={<TestAPI />} />
    <Route path="teacher-activity" element={<AdminTeacherActivity />} />

    {/* ===== TIMETABLE ===== */}
    <Route path="timetable/create" element={<AdminTimetable />} />
    <Route path="timetable/list" element={<AdminTimetableList />} />

    {/* ===== EXAMS ===== */}
    <Route path="exams" element={<Outlet />}>
      <Route path="final" element={<Outlet />}>
        <Route index element={<AdminFinalExamList />} />
        <Route path="create" element={<AdminCreateFinalExam />} />
        <Route path="view/:id" element={<AdminFinalExamView />} />
      </Route>
    </Route>

  </Route>
</Route>



          


        {/* ================= TEACHER ================= */}
        <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="homework" element={<TeacherHomework />} />
          <Route path="notes" element={<TeacherNotes />} />
          <Route path="publish-results/:examId" element={<TeacherPublishResults />} />
<Route
  path="final-exams/view/:id"
  element={<TeacherAdminFinalExamView />}
/>
<Route
  path="final-exams/:examId/marks"
  element={<TeacherFinalExamMarks />}
/>

          <Route
  path="timetable"
  element={<TeacherTimetableMini/>}
/>
 <Route path="classes" element={<TeacherClasses />} />

     {/* ===== EXAMS MODULE ===== */}
  <Route path="exams" element={<Outlet />}>
    <Route index element={<TeacherExamHub />} />
    <Route path="create" element={<TeacherCreateExam />} />
    <Route path="list" element={<TeacherExamList />} />
     <Route path="view/:id" element={<TeacherExamView />} />
 <Route
  path=":examId/marks"
  element={<TeacherEnterMarks />}
/>

 {/* ✅ ACADEMIC PERFORMANCE RECORD */}

 {/* 🔹 STEP 1: Performance LIST */}
  <Route
    path="performance"
    element={<TeacherExamList mode="performance" />}
  />

  {/* 🔹 STEP 2: Performance DETAIL */}
  <Route
    path="performance/:examId"
    element={<TeacherExamResult />}
  />




  </Route>
</Route>
        {/* ================= STUDENT ================= */}
        <Route path="/student" element={<ProtectedRoute role="student" />}>
          <Route index element={<StudentDashboard />} />
        </Route>

        {/* ================= PARENT ================= */}
        <Route path="/parent" element={<ProtectedRoute role="parent" />}>
          <Route index element={<ParentDashboardEnhanced />} />
          <Route path="child-profile/:childId" element={<ChildProfile />} />
          <Route path="profile/:childId" element={<ChildProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}





export default App;
