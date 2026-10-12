import { NavLink } from "react-router-dom";

const base =
  "block px-4 py-2 rounded-lg text-sm transition";
const normal = "text-slate-200 hover:bg-slate-800";
const active = "bg-slate-800 text-white font-semibold";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white flex flex-col">
      {/* TOP */}
      <div className="px-4 py-4 text-xl font-bold border-b border-slate-700">
        PDPB Analisa
      </div>

      {/* MENU */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        <NavLink to="/" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          Dashboard
        </NavLink>
<NavLink to="/model-rekap" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          Model Rekap
        </NavLink>
       

        <div className="pt-4 text-xs text-slate-400 uppercase">Analisa Ganda</div>
        <NavLink to="/ganda-kabko" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Dalam Kab/Kota
        </NavLink>
        <NavLink to="/ganda-antar-kabko" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Antar Kab/Kota
        </NavLink>
        <NavLink to="/potensial-dalam-kabko" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Potensial Ganda Dalam Kabko
        </NavLink>
        <NavLink to="/potensial-antar-kabko" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Potensial Ganda Antar Kabko
        </NavLink>

        <div className="pt-4 text-xs text-slate-400 uppercase">Analisa Anomali</div>
        <NavLink to="/anomali-umur" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Umur
        </NavLink>
        <NavLink to="/anomali-kelamin" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Kelamin
        </NavLink>
        <NavLink to="/fuzzy-matching" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Fuzzy Dalam
        </NavLink>
        <NavLink to="/fuzzy-antar-kabko" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • Fuzzy Antar
        </NavLink>
        <NavLink to="/outlier-nkk-prov" className={({ isActive }) => `${base} ${isActive ? active : normal}`}>
          • NKK 10NIK
        </NavLink>
        
      </nav>


      {/* BOTTOM MENU */}
      <div className="p-4 border-t border-slate-700">
        <NavLink
          to="/upload-csv"
          className={({ isActive }) => `${base} ${isActive ? active : normal}`}
        >
          ⬆️ Unggah CSV
        </NavLink>

        <NavLink
          to="/upload-csv-dhs"
          className={({ isActive }) => `${base} ${isActive ? active : normal}`}
        >
          ⬆️ Unggah CSV DHS
        </NavLink>
      </div>
    </aside>
  );
}
