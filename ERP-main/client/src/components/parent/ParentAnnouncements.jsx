import { useState, useEffect } from "react";
import { Megaphone, Calendar } from "lucide-react";
import api from "../../services/api";
import DarkCard from "./DarkCard";

function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"; }

export default function ParentAnnouncements({ activeStudentId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStudentId) return;
    setLoading(true);
    api.get(`/parent-dashboard/announcements/${activeStudentId}`)
      .then(res => setAnnouncements(res.data.announcements || []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, [activeStudentId]);

  if (loading) {
    return <DarkCard title="Announcements"><p className="text-sm text-gray-500">Loading...</p></DarkCard>;
  }

  return (
    <DarkCard title="School Announcements">
      {announcements.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No announcements at this time.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, i) => (
            <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <Megaphone size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-200 mb-1">{ann.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{ann.message || ann.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {fmtDate(ann.createdAt)}
                    </span>
                    {ann.author?.name && (
                      <span>By: {ann.author.name}</span>
                    )}
                    {ann.targetAudience && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] uppercase tracking-wider">
                        {ann.targetAudience}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DarkCard>
  );
}
