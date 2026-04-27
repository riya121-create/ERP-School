import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Reusable back button — dark themed, consistent across all pages.
 * Usage: <BackButton /> or <BackButton to="/teacher/exams" />
 */
export default function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate();
  const handleClick = () => (to ? navigate(to) : navigate(-1));

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition group mb-5"
    >
      <ArrowLeft
        size={15}
        className="group-hover:-translate-x-0.5 transition-transform"
      />
      {label}
    </button>
  );
}
