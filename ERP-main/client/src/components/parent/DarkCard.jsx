export default function DarkCard({ title, children }) {
  return (
    <section className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 md:p-6">
      {title && <h2 className="text-base font-semibold text-gray-200 mb-4">{title}</h2>}
      {children}
    </section>
  );
}
