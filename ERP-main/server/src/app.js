import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import examRoutes from "./routes/exam.routes.js";
import feeStructureRoutes from "./routes/feeStructure.routes.js";
import homeworkRoutes from "./routes/homework.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import publishResultsRoutes from "./routes/publishResults.routes.js";

import parentRoutes from "./routes/parent.routes.js";
import adminAttendanceRoutes from "./routes/admin.attendance.routes.js";
import feeCollectionRoutes from "./routes/adminFee.routes.js";

dotenv.config();

const app = express();   // ✅ app FIRST

app.use(cors());
app.use(express.json());

// ✅ routes AFTER app init
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/publish-results", publishResultsRoutes);

app.use("/api/teacher", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin/fees", feeStructureRoutes); 
app.use("/api/parent", parentRoutes); 

app.use("/api/admin", adminAttendanceRoutes);
app.use("/api/admin/fees", feeCollectionRoutes);

export default app;