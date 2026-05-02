import { useNavigate } from "react-router-dom";
import { Shield, GraduationCap, Users, BookOpen, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SLIDES = [
  { tag: "Academic Management System",  heading: "Transform The Way Your Institution Delivers Education",  sub: "A secure, role-based academic operating system built for modern schools." },
  { tag: "Smart Attendance Tracking",   heading: "Real-Time Attendance Monitoring For Every Classroom",    sub: "Teachers mark digitally. Parents get instant updates. Admins see live reports." },
  { tag: "Exam & Results Management",   heading: "Publish Results Instantly, Track Performance Deeply",    sub: "Create exams, enter marks, publish results — all in one place with analytics." },
  { tag: "Parent Engagement",           heading: "Keep Parents Connected To Their Child's Progress",       sub: "Fees, attendance, homework, results — parents see everything in real time." },
  { tag: "Fee Management",              heading: "Simplify Fee Collection With Smart Billing",             sub: "Structured fee plans, transport billing, and payment tracking — automated." },
];

const PORTALS = [
  { tag: "ADMIN",   title: "Administrator", desc: "Institution-wide control & analytics", icon: <Shield size={20} />,       route: "/login?as=admin",   border: "border-blue-500/40",   bg: "from-blue-600/20 to-blue-900/20",   badge: "bg-blue-500/20 text-blue-300",   btn: "bg-blue-600 hover:bg-blue-500",   glow: "rgba(59,130,246,0.35)" },
  { tag: "FACULTY", title: "Teacher",       desc: "Classes, attendance & daily ops",      icon: <BookOpen size={20} />,     route: "/login?as=teacher", border: "border-indigo-500/40", bg: "from-indigo-600/20 to-indigo-900/20", badge: "bg-indigo-500/20 text-indigo-300", btn: "bg-indigo-600 hover:bg-indigo-500", glow: "rgba(99,102,241,0.35)", hot: true },
  { tag: "STUDENT", title: "Student",       desc: "Attendance, subjects & performance",   icon: <GraduationCap size={20} />, route: "/login?as=student", border: "border-violet-500/40", bg: "from-violet-600/20 to-violet-900/20", badge: "bg-violet-500/20 text-violet-300", btn: "bg-violet-600 hover:bg-violet-500", glow: "rgba(139,92,246,0.35)" },
  { tag: "PARENT",  title: "Parent",        desc: "Child progress & academic monitoring", icon: <Users size={20} />,        route: "/login?as=parent",  border: "border-cyan-500/40",   bg: "from-cyan-600/20 to-cyan-900/20",   badge: "bg-cyan-500/20 text-cyan-300",   btn: "bg-cyan-600 hover:bg-cyan-500",   glow: "rgba(6,182,212,0.35)" },
];

const INTERVAL = 10000;

export default function Landing() {
  const navigate = useNavigate();
  const [current,  setCurrent]  = useState(0);
  const [visible,  setVisible]  = useState(true);
  const [progress, setProgress] = useState(0);
  const rafRef   = useRef(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    const tick = () => {
      const pct = Math.min(((Date.now() - startRef.current) / INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [current]);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setCurrent(p => (p + 1) % SLIDES.length); setVisible(true); }, 500);
    }, INTERVAL);
    return () => clearInterval(t);
  }, []);

  const goTo = i => { setVisible(false); setTimeout(() => { setCurrent(i); setVisible(true); }, 300); };
  const slide = SLIDES[current];

  return (
    <div className="relative h-screen text-white overflow-hidden bg-black flex flex-col">

      {/* VIDEO — full opacity so it's clearly visible */}
      <video autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50">
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* OVERLAY — lighter so video shows */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/75" />

      {/* GLOW ORBS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-30 bg-blue-600 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-25 bg-purple-600 pointer-events-none" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col h-full">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 sm:px-12 py-4 border-b border-white/10 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm">V</div>
            <div>
              <p className="font-bold text-sm leading-tight">Vidyalaya</p>
              <p className="text-[9px] text-gray-400 tracking-widest uppercase">Academic ERP</p>
            </div>
          </div>
          <p className="hidden sm:block text-[11px] text-gray-400 tracking-[0.2em] uppercase">
            Secure &bull; Role-Based &bull; Auditable
          </p>
        </header>

        {/* MAIN — fills remaining height */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-4 gap-5 min-h-0">

          {/* HERO TEXT */}
          <div className="text-center max-w-3xl w-full transition-all duration-500"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)" }}>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-gray-300">{slide.tag}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3 drop-shadow-lg">
              {slide.heading}
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
              {slide.sub}
            </p>
          </div>

          {/* PROGRESS + DOTS */}
          <div className="flex flex-col items-center gap-2 w-48">
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${progress}%`, transition: "none" }} />
            </div>
            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === current ? "24px" : "6px", background: i === current ? "#818cf8" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
          </div>

          {/* PORTAL CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-5xl">
            {PORTALS.map(p => (
              <div key={p.tag} onClick={() => navigate(p.route)}
                className={`group relative cursor-pointer rounded-2xl p-4 sm:p-5 bg-gradient-to-b ${p.bg} backdrop-blur-xl border ${p.border} transition-all duration-300 hover:-translate-y-1.5`}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 16px 48px ${p.glow}`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>

                {p.hot && (
                  <span className="absolute top-2.5 right-2.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white tracking-wider">
                    POPULAR
                  </span>
                )}

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${p.badge}`}>
                  {p.icon}
                </div>

                <p className={`text-[9px] tracking-[0.25em] font-bold uppercase mb-1 ${p.badge.split(" ")[1]}`}>{p.tag}</p>
                <h3 className="text-sm sm:text-base font-bold mb-1 text-white">{p.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{p.desc}</p>

                <button className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${p.btn}`}>
                  Enter Portal
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          {/* AWARD BADGES */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {["Alma Nirbhar Bharat Award", "Best Digital Transformation", "Education Excellence Award", "Most Innovative School ERP"].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 max-w-[80px] sm:max-w-[100px]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-amber-400/50 bg-amber-500/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <p className="text-[8px] sm:text-[9px] text-amber-300/70 text-center leading-tight font-medium">{b}</p>
              </div>
            ))}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="text-center py-3 text-[10px] text-gray-600 border-t border-white/[0.06] flex-shrink-0">
          &copy; {new Date().getFullYear()} Vidyalaya &bull; All rights reserved
        </footer>
      </div>
    </div>
  );
}
