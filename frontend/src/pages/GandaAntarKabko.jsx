import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function fmt(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function GandaAntarKabko() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const limit = 200;

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchDetailList() {
    setLoading(true);
    const url = `http://127.0.0.1:8000/analisa/ganda-antar-kabko-detail?keyword=${keyword}&page=${page}&limit=${limit}`;

    const res = await fetch(url);
    const json = await res.json();

    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchDetailList();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  // Group berdasarkan NIK
  const grouped = data.reduce((acc, row) => {
    const nik = row.nik || row["NIK"];
    if (!acc[nik]) acc[nik] = [];
    acc[nik].push(row);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analisa Ganda Antar Kab/Kota (NIK Sama)</h2>

        {/* FILTER */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari NIK / Nama..."
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={() => { setPage(1); fetchDetailList(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Cari
          </button>
        </div>

        {/* DATA */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-4 border-b text-sm text-slate-600">
            Total baris pemilih ganda antar kab/kota ditemukan: <b>{fmt(total)}</b>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="p-4 space-y-8">
              {Object.keys(grouped).length === 0 && (
                <div className="text-center text-slate-500 p-6">
                  Tidak ada data ganda antar kab/kota.
                </div>
              )}

              {Object.entries(grouped).map(([nik, rows]) => (
                <div key={nik} className="border rounded-xl overflow-hidden">
                  <div className="bg-slate-100 p-3 flex justify-between items-center">
                    <div className="font-bold text-sm">
                      NIK: <span className="font-mono">{nik}</span>
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
                          <th className="border px-3 py-2">Kecamatan</th>
                          <th className="border px-3 py-2">Kelurahan</th>
                          <th className="border px-3 py-2">Nama</th>
                          <th className="border px-3 py-2">Tgl Lahir</th>
                          <th className="border px-3 py-2">Tempat Lahir</th>
                          <th className="border px-3 py-2">Alamat</th>
                          <th className="border px-3 py-2">TPS</th>
                          <th className="border px-3 py-2">Ket</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="border px-3 py-2">{r.kabkota}</td>
                            <td className="border px-3 py-2">{r["KECAMATAN"]}</td>
                            <td className="border px-3 py-2">{r["KELURAHAN"]}</td>
                            <td className="border px-3 py-2">{r["NAMA"]}</td>
                            <td className="border px-3 py-2">{r["TANGGAL LAHIR"]}</td>
                            <td className="border px-3 py-2">{r["TEMPAT LAHIR"]}</td>
                            <td className="border px-3 py-2 max-w-[280px] truncate">{r["ALAMAT"]}</td>
                            <td className="border px-3 py-2 text-center">{r["TPS"]}</td>
                            <td className="border px-3 py-2 text-center">{r["KETERANGAN"]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          <div className="p-4 border-t flex justify-between items-center">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-slate-600">
              Page {page} / {totalPages || 1}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
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
