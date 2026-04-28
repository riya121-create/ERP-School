export default function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-200">{value ?? "-"}</p>
    </div>
  );
}
