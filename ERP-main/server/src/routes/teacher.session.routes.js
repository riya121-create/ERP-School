import { teacherLogin, teacherLogout } from "../controllers/teacherAuth.controller.js";

router.post("/login", teacherLogin);
router.post("/logout", teacherLogout); // 🆕
