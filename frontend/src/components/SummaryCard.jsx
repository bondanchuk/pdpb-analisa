export default function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}
