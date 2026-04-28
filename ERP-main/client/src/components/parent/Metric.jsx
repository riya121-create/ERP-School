const COLORS = {
  indigo:  "text-indigo-400",
  emerald: "text-emerald-400",
  rose:    "text-rose-400",
  amber:   "text-amber-400",
};

export default function Metric({ title, value, accent }) {
  return (
    <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${COLORS[accent] || "text-white"}`}>{value}</p>
    </div>
  );
}
