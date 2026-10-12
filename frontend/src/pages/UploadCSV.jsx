import { useState } from "react";
import Layout from "../components/Layout";

const kabkoOptions = [
  { id: "01", name: "Bintan" },
  { id: "02", name: "Karimun" },
  { id: "03", name: "Natuna" },
  { id: "04", name: "Lingga" },
  { id: "05", name: "Anambas" },
  { id: "06", name: "Batam" },
  { id: "07", name: "Tanjungpinang" },
];

function fmt(n) {
  return new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [kabkotaId, setKabkotaId] = useState("05");
  const [kabkota, setKabkota] = useState("Anambas");

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);

  const [stagingRows, setStagingRows] = useState(0);
  const [pdpbRows, setPdpbRows] = useState(0);

  const [log, setLog] = useState([]);
  const [error, setError] = useState("");

  const addLog = (msg) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleKabkoChange = (e) => {
    const selectedId = e.target.value;
    const selected = kabkoOptions.find((x) => x.id === selectedId);
    setKabkotaId(selected.id);
    setKabkota(selected.name);
  };

  // ✅ Upload CSV ke staging
  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setStagingRows(0);
    setPdpbRows(0);
    setLog([]);

    if (!file) {
      setError("Silakan pilih file CSV terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kabkota_id", kabkotaId);
    formData.append("kabkota", kabkota);

    try {
      setLoadingUpload(true);
      addLog(`Upload dimulai: ${file.name} (${kabkota})`);

      const res = await fetch("http://127.0.0.1:8000/upload-csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload gagal");

      setStagingRows(data.staging_rows);
      addLog(`✅ Upload selesai → masuk staging: ${fmt(data.staging_rows)} baris`);

    } catch (err) {
      setError(err.message);
      addLog(`❌ Upload gagal: ${err.message}`);
    } finally {
      setLoadingUpload(false);
    }
  };

  // ✅ Proses staging → pdpb
  const handleProcess = async () => {
    setError("");
    setPdpbRows(0);

    try {
      setLoadingProcess(true);
      addLog(`Proses staging → pdpb dimulai (${kabkota})...`);

      const res = await fetch(
        `http://127.0.0.1:8000/process/staging-to-pdpb?kabkota_id=${kabkotaId}&kabkota=${kabkota}`,
        { method: "POST" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Proses gagal");

      setPdpbRows(data.pdpb_rows);
      addLog(`✅ Proses selesai → masuk pdpb: ${fmt(data.pdpb_rows)} baris`);

    } catch (err) {
      setError(err.message);
      addLog(`❌ Proses gagal: ${err.message}`);
    } finally {
      setLoadingProcess(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl space-y-6">
        <h2 className="text-2xl font-bold">Unggah CSV PDPB</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kab/Kota</label>
              <select
                value={kabkotaId}
                onChange={handleKabkoChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                {kabkoOptions.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.id} - {x.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">File CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="md:col-span-3 flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loadingUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loadingUpload ? "Uploading..." : "Upload ke Staging"}
              </button>

              {/* Tombol proses hanya muncul jika stagingRows > 0 */}
              {stagingRows > 0 && (
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={loadingProcess}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loadingProcess ? "Processing..." : "Proses ke Tabel PDPB"}
                </button>
              )}
            </div>
          </form>

          {/* SUMMARY LOG */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-xs text-slate-500">Row di Staging</div>
              <div className="text-xl font-bold">{fmt(stagingRows)}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-xs text-slate-500">Row Masuk PDPB</div>
              <div className="text-xl font-bold">{fmt(pdpbRows)}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-xs text-slate-500">Kab/Kota</div>
              <div className="text-xl font-bold">{kabkota}</div>
            </div>
          </div>
        </div>

        {/* LOG OUTPUT */}
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">Log Proses</h3>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono h-60 overflow-y-auto">
            {log.length === 0 ? (
              <div className="text-slate-400">Belum ada aktivitas...</div>
            ) : (
              log.map((l, idx) => <div key={idx}>{l}</div>)
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
