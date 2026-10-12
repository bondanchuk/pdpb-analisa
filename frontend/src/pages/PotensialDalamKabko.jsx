import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const kabkoOptions = [
  "", "Bintan", "Karimun", "Natuna", "Lingga", "Anambas", "Batam", "Tanjungpinang"
];

function fmt(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function PotensialDalamKabko() {
  const [kabkota, setKabkota] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const limit = 200;

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchDetail() {
    setLoading(true);

    const qs = new URLSearchParams({
      keyword,
      page: String(page),
      limit: String(limit),
    });
    if (kabkota) qs.set("kabkota", kabkota);

    const url = `http://127.0.0.1:8000/analisa/potensial-dalam-kabko-detail?${qs.toString()}`;
    const res = await fetch(url);
    const json = await res.json();

    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchDetail();
  }, [kabkota, page]);

  const totalPages = Math.ceil(total / limit);

  // group key: kabkota + nama + tgl + tempat
  const grouped = data.reduce((acc, r) => {
    const key = [
      r.kabkota,
      r["NAMA"],
      r["TANGGAL LAHIR"],
      r["TEMPAT LAHIR"]
    ].join("||");

    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  function handleDownload() {
    const url = kabkota
      ? `http://127.0.0.1:8000/analisa/potensial-dalam-kabko-export?kabkota=${encodeURIComponent(kabkota)}`
      : `http://127.0.0.1:8000/analisa/potensial-dalam-kabko-export`;

    window.open(url, "_blank");
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          Potensial Ganda Dalam Kab/Kota (Nama + Tgl Lahir + Tempat Lahir)
        </h2>

        {/* Filter */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center">
          <select
            value={kabkota}
            onChange={(e) => {
              setKabkota(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2"
          >
            {kabkoOptions.map((k) => (
              <option key={k} value={k}>
                {k === "" ? "Semua Kab/Kota" : k}
              </option>
            ))}
          </select>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari nama / nik / tempat lahir..."
            className="border rounded-lg px-3 py-2 flex-1"
          />

          <button
            onClick={() => {
              setPage(1);
              fetchDetail();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Cari
          </button>

          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Download CSV
          </button>
        </div>

        {/* Data */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-4 border-b text-sm text-slate-600">
            Total baris potensi ganda ditemukan: <b>{fmt(total)}</b>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="p-4 space-y-8">
              {Object.keys(grouped).length === 0 && (
                <div className="text-center text-slate-500 p-6">
                  Tidak ada data potensi ganda.
                </div>
              )}

              {Object.entries(grouped).map(([key, rows]) => {
                const kab = rows[0]?.kabkota;
                const nama = rows[0]?.["NAMA"];
                const tgl = rows[0]?.["TANGGAL LAHIR"];
                const tempat = rows[0]?.["TEMPAT LAHIR"];

                return (
                  <div key={key} className="border rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="text-sm">
                        <div><b>Kab/Kota:</b> {kab}</div>
                        <div><b>Nama:</b> {nama}</div>
                        <div>
                          <b>Tgl Lahir:</b> {tgl} &nbsp; | &nbsp;
                          <b>Tempat:</b> {tempat}
                        </div>
                      </div>
                      <div className="text-sm text-slate-700">
                        Jumlah: <b>{rows.length}</b>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
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
                              <td className="border px-3 py-2 font-mono text-xs">
                                {r.nik || r["NIK"]}
                              </td>
                              <td className="border px-3 py-2">{r["KECAMATAN"]}</td>
                              <td className="border px-3 py-2">{r["KELURAHAN"]}</td>
                              <td className="border px-3 py-2 max-w-[360px] truncate">
                                {r["ALAMAT"]}
                              </td>
                              <td className="border px-3 py-2 text-center">
                                {r["TPS"]}
                              </td>
                              <td className="border px-3 py-2 text-center">
                                {r["KETERANGAN"]}
                              </td>
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
