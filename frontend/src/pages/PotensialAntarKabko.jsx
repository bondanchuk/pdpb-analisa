import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function fmt(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function PotensialAntarKabko() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const limit = 200;

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const url = `http://127.0.0.1:8000/analisa/potensial-antar-kabko-detail?keyword=${keyword}&page=${page}&limit=${limit}`;
    const res = await fetch(url);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  // grouping berdasarkan (nama + tgl lahir + tempat lahir)
  const grouped = data.reduce((acc, r) => {
    const key = [
      r["NAMA"],
      r["TANGGAL LAHIR"],
      r["TEMPAT LAHIR"]
    ].join("||");

    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          Potensial Ganda Antar Kab/Kota (Nama + Tgl Lahir + Tempat Lahir)
        </h2>

        {/* Filter */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari nama / nik / tempat lahir..."
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={() => {
              setPage(1);
              fetchData();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Cari
          </button>

          {/* ✅ Tombol Export (kita pasang dulu, endpoint nanti) */}
          <button
            onClick={() =>
              window.open(
                "http://127.0.0.1:8000/analisa/potensial-antar-kabko-export",
                "_blank"
              )
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Export CSV
          </button>
        </div>

        {/* Data */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-4 border-b text-sm text-slate-600">
            Total data potensial ganda antar kab/kota: <b>{fmt(total)}</b>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="p-4 space-y-8">
              {Object.keys(grouped).length === 0 && (
                <div className="text-center text-slate-500 p-6">
                  Tidak ada data potensial ganda antar kab/kota.
                </div>
              )}

              {Object.entries(grouped).map(([key, rows]) => {
                const nama = rows[0]["NAMA"];
                const tgl = rows[0]["TANGGAL LAHIR"];
                const tempat = rows[0]["TEMPAT LAHIR"];
                const kabList = [...new Set(rows.map(r => r.kabkota))].join(", ");

                return (
                  <div key={key} className="border rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="text-sm">
                        <div><b>Nama:</b> {nama}</div>
                        <div><b>Tgl Lahir:</b> {tgl} | <b>Tempat:</b> {tempat}</div>
                        <div><b>Muncul di:</b> {kabList}</div>
                      </div>
                      <div className="text-sm text-slate-700">
                        Jumlah: <b>{rows.length}</b>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white">
                          <tr>
                            <th className="border px-3 py-2">Kab/Kota</th>
                            <th className="border px-3 py-2">NIK</th>
                            <th className="border px-3 py-2">Kecamatan</th>
                            <th className="border px-3 py-2">Kelurahan</th>
                            <th className="border px-3 py-2">Alamat</th>
                            <th className="border px-3 py-2">TPS</th>
                            <th className="border px-3 py-2">Ket</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="border px-3 py-2">{r.kabkota}</td>
                              <td className="border px-3 py-2 font-mono text-xs">{r["NIK"]}</td>
                              <td className="border px-3 py-2">{r["KECAMATAN"]}</td>
                              <td className="border px-3 py-2">{r["KELURAHAN"]}</td>
                              <td className="border px-3 py-2 max-w-[360px] truncate">{r["ALAMAT"]}</td>
                              <td className="border px-3 py-2 text-center">{r["TPS"]}</td>
                              <td className="border px-3 py-2 text-center">{r["KETERANGAN"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t flex justify-between items-center">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-slate-600">
              Page {page} / {totalPages || 1}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
