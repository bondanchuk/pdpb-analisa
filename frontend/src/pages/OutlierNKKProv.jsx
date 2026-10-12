import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function fmt(n){ return new Intl.NumberFormat("id-ID").format(n||0); }

export default function OutlierNKKProv() {
  const [minOrang,setMinOrang] = useState(10);
  const [page,setPage] = useState(1);
  const limit = 200;

  const [rows,setRows] = useState([]);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(false);

  const [detailOpen,setDetailOpen] = useState(false);
  const [detailData,setDetailData] = useState([]);
  const [selectedNKK,setSelectedNKK] = useState("");

  async function fetchData(){
    setLoading(true);
    const url = `http://127.0.0.1:8000/analisa/outlier-nkk-prov-summary?min_orang=${minOrang}&page=${page}&limit=${limit}`;
    const res = await fetch(url);
    const json = await res.json();
    setRows(json.data||[]);
    setTotal(json.total||0);
    setLoading(false);
  }

  async function openDetail(nkk){
    setSelectedNKK(nkk);
    const url = `http://127.0.0.1:8000/analisa/outlier-nkk-prov-detail?nkk=${nkk}`;
    const res = await fetch(url);
    const json = await res.json();
    setDetailData(json.data||[]);
    setDetailOpen(true);
  }

  useEffect(()=>{ fetchData(); },[page]);

  const totalPages = Math.ceil(total/limit);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Outlier NKK Provinsi</h2>

        {/* FILTER */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Min Orang:</span>
            <input
              type="number"
              value={minOrang}
              onChange={(e)=>setMinOrang(e.target.value)}
              className="border rounded-lg px-3 py-2 w-24"
            />
          </div>

          <button onClick={()=>{setPage(1); fetchData();}}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Refresh
          </button>

          <button
            onClick={()=>window.open(
              `http://127.0.0.1:8000/analisa/outlier-nkk-prov-export?min_orang=${minOrang}`,
              "_blank"
            )}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Export Summary CSV
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-4 border-b text-sm text-slate-600">
            Total NKK outlier provinsi: <b>{fmt(total)}</b>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border px-3 py-2">NKK</th>
                    <th className="border px-3 py-2 text-center">Jumlah NIK</th>
                    <th className="border px-3 py-2 text-center">Jumlah Kab/Kota</th>
                    <th className="border px-3 py-2">Daftar Kab/Kota</th>
                    <th className="border px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="border px-3 py-2 font-mono text-xs">{r.NKK}</td>
                      <td className="border px-3 py-2 text-center font-bold text-red-600">{r.jumlah_nik}</td>
                      <td className="border px-3 py-2 text-center font-bold">{r.jumlah_kabkota}</td>
                      <td className="border px-3 py-2">{r.daftar_kabkota}</td>
                      <td className="border px-3 py-2 text-center">
                        <button
                          onClick={()=>openDetail(r.NKK)}
                          className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length===0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500">Tidak ada data.</td></tr>
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

        {/* MODAL DETAIL */}
        {detailOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-6xl max-h-[85vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Detail Outlier NKK</h3>
                  <p className="text-sm text-slate-600">NKK: <b>{selectedNKK}</b></p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={()=>window.open(
                      `http://127.0.0.1:8000/analisa/outlier-nkk-prov-export-detail?nkk=${selectedNKK}`,
                      "_blank"
                    )}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Export Detail CSV
                  </button>
                  <button onClick={()=>setDetailOpen(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm">
                    Tutup
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border px-3 py-2">Kab/Kota</th>
                      <th className="border px-3 py-2">NIK</th>
                      <th className="border px-3 py-2">Nama</th>
                      <th className="border px-3 py-2">Tgl Lahir</th>
                      <th className="border px-3 py-2">JK</th>
                      <th className="border px-3 py-2">Kecamatan</th>
                      <th className="border px-3 py-2">Kelurahan</th>
                      <th className="border px-3 py-2">TPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.map((d,idx)=>(
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border px-3 py-2">{d.kabkota}</td>
                        <td className="border px-3 py-2 font-mono text-xs">{d["NIK"]}</td>
                        <td className="border px-3 py-2">{d["NAMA"]}</td>
                        <td className="border px-3 py-2">{d["TANGGAL LAHIR"]}</td>
                        <td className="border px-3 py-2 text-center">{d["KELAMIN"]}</td>
                        <td className="border px-3 py-2">{d["KECAMATAN"]}</td>
                        <td className="border px-3 py-2">{d["KELURAHAN"]}</td>
                        <td className="border px-3 py-2 text-center">{d["TPS"]}</td>
                      </tr>
                    ))}
                    {detailData.length===0 && (
                      <tr><td colSpan={8} className="p-6 text-center text-slate-500">Tidak ada detail.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
