import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* ===== BACKGROUND IMAGE LAYER ===== */}
      <div
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: "url('/campus1.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      {/* ===== SMART CINEMATIC OVERLAY (MOBILE FRIENDLY) ===== */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/80 sm:from-black/85 sm:via-black/65 sm:to-black/90" />

      {/* ===== VIGNETTE (DEPTH FEEL) ===== */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85))]" />

      {/* ===== AURORA GLOWS ===== */}
      <div className="absolute -top-24 -left-24 w-[18rem] h-[18rem] sm:w-[32rem] sm:h-[32rem] bg-blue-500/35 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[18rem] h-[18rem] sm:w-[32rem] sm:h-[32rem] bg-purple-500/35 rounded-full blur-[160px]" />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">

        {/* ===== HERO ===== */}
        <header className="text-center mb-20 sm:mb-32">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-[0_6px_30px_rgba(0,0,0,0.7)]">
            JN Public School
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            A secure academic operating system for administrators,
            teachers, students & parents.
          </p>

          <p className="mt-4 text-[11px] sm:text-xs tracking-[0.35em] text-gray-300 uppercase">
            Authorized Institutional Access Only
          </p>
        </header>

        {/* ===== PORTALS ===== */}
        <section className="grid gap-6 sm:gap-10 md:grid-cols-4 max-w-6xl mx-auto">

          <Portal title="Administrator" tag="ADMIN"
            desc="Institution-wide control, analytics & governance"
            onClick={() => navigate("/login?as=admin")}
          />

          <Portal title="Teacher" tag="FACULTY" highlight
            desc="Attendance, classes, notes & daily operations"
            onClick={() => navigate("/login?as=teacher")}
          />

          <Portal title="Student" tag="STUDENT"
            desc="Attendance, subjects & performance tracking"
            onClick={() => navigate("/login?as=student")}
          />

          <Portal title="Parent" tag="PARENT"
            desc="Child attendance & academic monitoring"
            onClick={() => navigate("/login?as=parent")}
          />

        </section>

        {/* ===== FOOTER ===== */}
        <footer className="mt-24 sm:mt-40 text-center text-[11px] sm:text-xs text-gray-300">
          <p className="tracking-widest">
            Secure • Private • Role-Based • Auditable
          </p>
          <p className="mt-2 opacity-70">
            © {new Date().getFullYear()} JN Public School
          </p>
        </footer>
      </div>
    </div>
  )
}

/* =================================================
   PORTAL CARD – FAANG FEEL
================================================= */
function Portal({ title, desc, onClick, tag, highlight }) {
  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer
        rounded-2xl sm:rounded-[2rem]
        p-6 sm:p-8
        bg-white/12 backdrop-blur-xl
        border border-white/25
        shadow-[0_40px_120px_rgba(0,0,0,0.75)]
        transition-all duration-300 ease-out
        sm:hover:-translate-y-4 sm:hover:scale-[1.07]
        sm:hover:border-blue-400/70
        ${highlight ? "ring-1 ring-blue-500/60" : ""}
      `}
    >
      <span className="text-[11px] sm:text-xs tracking-[0.35em] font-semibold text-blue-400">
        {tag}
      </span>

      <h3 className="mt-4 text-xl sm:text-2xl font-semibold">
        {title}
      </h3>

      <p className="mt-4 text-sm text-gray-200 leading-relaxed">
        {desc}
      </p>

      <button
        className={`
          mt-8 sm:mt-10 w-full py-3.5 rounded-xl
          text-sm sm:text-base font-medium
          transition
          ${
            highlight
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white/15 hover:bg-white/25"
          }
        `}
      >
        Enter Portal →
      </button>
    </div>
  )
}
