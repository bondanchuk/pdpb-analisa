import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const kabkoOptions = [
  "", "Bintan", "Karimun", "Natuna", "Lingga", "Anambas", "Batam", "Tanjungpinang"
];

function fmt(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function AnomaliKelamin() {
  const [kabkota, setKabkota] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const limit = 200;

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const url = `http://127.0.0.1:8000/anomali/kelamin?kabkota=${kabkota}&keyword=${keyword}&page=${page}&limit=${limit}`;
    const res = await fetch(url);
    const json = await res.json();

    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [kabkota, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analisa Anomali Kelamin (NIK)</h2>

        {/* FILTER */}
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
            placeholder="Cari NIK / Nama..."
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

          {/* ✅ EXPORT */}
          <button
            onClick={() =>
              window.open(
                `http://127.0.0.1:8000/anomali/kelamin-export?kabkota=${kabkota}`,
                "_blank"
              )
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Export CSV
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-4 border-b text-sm text-slate-600">
            Total data anomali kelamin: <b>{fmt(total)}</b>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border px-3 py-2">Kab/Kota</th>
                    <th className="border px-3 py-2">NIK</th>
                    <th className="border px-3 py-2">Nama</th>
                    <th className="border px-3 py-2">Tanggal Lahir</th>
                    <th className="border px-3 py-2">JK</th>
                    <th className="border px-3 py-2">Digit JK NIK</th>
                    <th className="border px-3 py-2">Kecamatan</th>
                    <th className="border px-3 py-2">Kelurahan</th>
                    <th className="border px-3 py-2">TPS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
  <td className="border px-3 py-2">{r.kabkota}</td>
  <td className="border px-3 py-2 font-mono text-xs">{r["NIK"]}</td>
  <td className="border px-3 py-2">{r["NAMA"]}</td>
  <td className="border px-3 py-2">{r["TANGGAL LAHIR"]}</td>

  <td className="border px-3 py-2 text-center font-bold text-red-600">
    {r["KELAMIN"]}
  </td>

  <td className="border px-3 py-2 text-center font-bold text-blue-700">
    {r.digit_jk}
  </td>

  <td className="border px-3 py-2">{r["KECAMATAN"]}</td>
  <td className="border px-3 py-2">{r["KELURAHAN"]}</td>
  <td className="border px-3 py-2 text-center">{r["TPS"]}</td>
</tr>

                  ))}

                  {data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500">
                        Tidak ada data anomali kelamin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
