import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const kabkoOptions = ["", "Bintan","Karimun","Natuna","Lingga","Anambas","Batam","Tanjungpinang"];

function fmt(n){ return new Intl.NumberFormat("id-ID").format(n||0); }

export default function FuzzyMatching() {
  const [kabkota, setKabkota] = useState("");
  const [minScore, setMinScore] = useState(0.85);
  const [page, setPage] = useState(1);
  const limit = 200;

  const [total,setTotal] = useState(0);
  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(false);

  async function fetchData(){
    setLoading(true);
    const url = `http://127.0.0.1:8000/analisa/fuzzy-summary?kabkota=${kabkota}&min_score=${minScore}&page=${page}&limit=${limit}`;
    const res = await fetch(url);
    const json = await res.json();
    setRows(json.data||[]);
    setTotal(json.total||0);
    setLoading(false);
  }

  useEffect(()=>{ fetchData(); },[page,kabkota]);

  const totalPages = Math.ceil(total/limit);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Fuzzy Matching Nama (Kemiripan Nama)</h2>

        {/* FILTER */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center">
          <select value={kabkota} onChange={(e)=>{setKabkota(e.target.value); setPage(1);}}
            className="border rounded-lg px-3 py-2">
            {kabkoOptions.map(k=>(
              <option key={k} value={k}>{k===""?"Semua Kab/Kota":k}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Min Score:</span>
            <input type="number" step="0.01" min="0.5" max="1"
              value={minScore}
              onChange={(e)=>setMinScore(e.target.value)}
              className="border rounded-lg px-2 py-2 w-24"
            />
          </div>

          <button
            onClick={()=>{setPage(1); fetchData();}}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Refresh
          </button>

          <button
            onClick={()=>window.open(`http://127.0.0.1:8000/analisa/fuzzy-export?kabkota=${kabkota}&min_score=${minScore}`,"_blank")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Export CSV
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-4 border-b text-sm text-slate-600">
            Total kandidat fuzzy match: <b>{fmt(total)}</b>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border px-3 py-2">Kab/Kota</th>
                    <th className="border px-3 py-2">Tgl Lahir</th>
                    <th className="border px-3 py-2">Tempat Lahir</th>
                    <th className="border px-3 py-2">NIK 1</th>
                    <th className="border px-3 py-2">Nama 1</th>
                    <th className="border px-3 py-2">NIK 2</th>
                    <th className="border px-3 py-2">Nama 2</th>
                    <th className="border px-3 py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="border px-3 py-2">{r.kabkota}</td>
                      <td className="border px-3 py-2">{r.tanggal_lahir}</td>
                      <td className="border px-3 py-2">{r.tempat_lahir}</td>
                      <td className="border px-3 py-2 font-mono text-xs">{r.nik_1}</td>
                      <td className="border px-3 py-2">{r.nama_1}</td>
                      <td className="border px-3 py-2 font-mono text-xs">{r.nik_2}</td>
                      <td className="border px-3 py-2">{r.nama_2}</td>
                      <td className="border px-3 py-2 text-center font-bold">{r.skor_similarity}</td>
                    </tr>
                  ))}
                  {rows.length===0 && (
                    <tr><td colSpan={8} className="p-6 text-center text-slate-500">Tidak ada data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          <div className="p-4 border-t flex justify-between items-center">
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}
              className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50">Prev</button>
            <span className="text-sm text-slate-600">Page {page}/{totalPages||1}</span>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}
              className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
