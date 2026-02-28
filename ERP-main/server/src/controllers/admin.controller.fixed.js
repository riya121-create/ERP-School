/* =====================================================
   GET TEACHER BY ID - FIXED VERSION
===================================================== */
export const getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId)
      .select("-password")
      .populate('subjects', 'name code type');

    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ teacher });
  } catch (err) {
    console.error("Get teacher by ID error:", err);
    res.status(500).json({ message: "Failed to get teacher" });
  }
};
