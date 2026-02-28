import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";

export default function AdminTeacherActivity() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get("/admin/teacher-login-history");
        setSessions(res.data || []);
      } catch (err) {
        console.error("Failed to load teacher activity", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  /* ======================
     FILTERED DATA
  ====================== */
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // status filter
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;

      // today filter
      if (todayOnly) {
        const today = new Date().toISOString().slice(0, 10);
        if (!new Date(s.loginAt).toISOString().startsWith(today)) {
          return false;
        }
      }

      // search filter
      const text = `${s.teacherId?.name} ${s.teacherId?.email}`.toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;

      return true;
    });
  }, [sessions, statusFilter, search, todayOnly]);

  /* ======================
     STATS
  ====================== */
  const stats = useMemo(() => ({
    online: sessions.filter(s => s.status === "ACTIVE").length,
    offline: sessions.filter(s => s.status !== "ACTIVE").length,
    today: sessions.filter(s =>
      new Date(s.loginAt).toISOString().startsWith(
        new Date().toISOString().slice(0, 10)
      )
    ).length
  }), [sessions]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading teacher activity…</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">👨‍🏫 Teacher Session Monitor</h1>
        <p className="text-sm text-gray-500">
          Enterprise-grade login & session intelligence
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Online" value={stats.online} color="green" />
        <Stat label="Offline" value={stats.offline} color="red" />
        <Stat label="Today" value={stats.today} color="blue" />
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search teacher…"
          className="border rounded-lg px-3 py-2 text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="LOGGED_OUT">LOGGED_OUT</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={todayOnly}
            onChange={e => setTodayOnly(e.target.checked)}
          />
          Today only
        </label>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <Th>Teacher</Th>
              <Th>Login</Th>
              <Th>Last Seen</Th>
              <Th>Logout</Th>
              <Th>IP</Th>
              <Th>Device</Th>
              <Th>Session</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {filteredSessions.length === 0 && (
              <tr>
                <Td colSpan={8} center>No sessions found</Td>
              </tr>
            )}

            {filteredSessions.map(s => {
              const online = s.status === "ACTIVE";
              return (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <Td>
                    <div className="font-medium">{s.teacherId?.name}</div>
                    <div className="text-xs text-gray-500">
                      {s.teacherId?.email}
                    </div>
                  </Td>
                  <Td>{formatDate(s.loginAt)}</Td>
                  <Td>{formatDate(s.lastSeenAt)}</Td>
                  <Td>{formatDate(s.logoutAt)}</Td>
                  <Td>{s.ipAddress || "—"}</Td>
                  <Td className="text-xs">
                    {s.browser || "—"}<br />{s.os || ""}
                  </Td>
                  <Td>{calcDuration(s.loginAt, s.logoutAt)}</Td>
                  <Td>
                    {online ? <Live /> : <Badge text={s.status} />}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= UI ================= */

function Stat({ label, value, color }) {
  const map = {
    green: "text-green-700 bg-green-50",
    red: "text-red-700 bg-red-50",
    blue: "text-blue-700 bg-blue-50"
  };
  return (
    <div className="border rounded-xl p-4 bg-white">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-semibold ${map[color]}`}>{value}</p>
    </div>
  );
}

function Live() {
  return (
    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
      ● Online
    </span>
  );
}

function Badge({ text }) {
  return (
    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
      {text}
    </span>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">
      {children}
    </th>
  );
}

function Td({ children, colSpan, center }) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 ${center ? "text-center text-gray-400" : ""}`}
    >
      {children}
    </td>
  );
}

/* ================= HELPERS ================= */

function formatDate(d) {
  return d ? new Date(d).toLocaleString() : "—";
}

function calcDuration(start, end) {
  if (!start) return "—";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const mins = Math.floor((e - s) / 60000);
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
