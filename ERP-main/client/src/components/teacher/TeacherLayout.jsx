import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setCollapsed(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* fetch teacher profile once and cache in localStorage */
  useEffect(() => {
    const cached = localStorage.getItem("name");
    if (!cached) {
      api.get("/teacher/me")
        .then(res => {
          const { name, email } = res.data || {};
          if (name)  localStorage.setItem("name",  name);
          if (email) localStorage.setItem("email", email);
          // force sidebar re-render by dispatching a storage event
          window.dispatchEvent(new Event("storage"));
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <TeacherSidebar
        collapsed={collapsed}
        isMobile={isMobile}
        onToggle={() => setCollapsed(c => !c)}
      />
      <main
        className={`min-h-screen p-6 md:p-8 overflow-y-auto transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-72"}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
