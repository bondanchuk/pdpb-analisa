import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import BarPemilihKabko from "../components/charts/BarPemilihKabko";
import BarPemulaKabko from "../components/charts/BarPemulaKabko";
import PieGender from "../components/charts/PieGender";
import { apiGet } from "../services/api";

function fmt(n) {
  if (n === null || n === undefined) return "-";
  return new Intl.NumberFormat("id-ID").format(n);
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [aktifKabko, setAktifKabko] = useState([]);
  const [pemulaKabko, setPemulaKabko] = useState([]);
  const [gender, setGender] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [s, a, p, g] = await Promise.all([
          apiGet("/dashboard/summary"),
          apiGet("/dashboard/active-per-kabkota"),
          apiGet("/dashboard/pemula-per-kabkota"),
          apiGet("/dashboard/gender-overall"),
        ]);

        if (!mounted) return;

        setSummary(s);
        setAktifKabko(a);
        setPemulaKabko(p);
        setGender(g);
      } catch (e) {
        setError(e.message || "Gagal memuat data dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  const bar = useMemo(() => {
    const labels = aktifKabko.map((x) => x.kabkota);
    const values = aktifKabko.map((x) => x.total);
    return { labels, values };
  }, [aktifKabko]);

  const pemulaBar = useMemo(() => {
  const labels = pemulaKabko.map((x) => x.kabkota);
  const values = pemulaKabko.map((x) => x.total);
  return { labels, values };
}, [pemulaKabko]);


  const pieGender = useMemo(() => {
    return gender.map((x) => ({ name: x.gender, value: x.total }));
  }, [gender]);

  return (
    <Layout>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Pemilih Aktif"
          value={loading ? "..." : fmt(summary?.total_aktif)}
          subtitle='Filter: STATUS (aktif/ubah/baru) & KETERANGAN (0,u,b,9,11)'
        />
        <SummaryCard
          title="Total Pemilih Pemula"
          value={loading ? "..." : fmt(summary?.total_pemula)}
          subtitle="Lahir 28-11-2007 s/d 31-12-2008, STS KAWIN=b"
        />
        <SummaryCard
          title="Total Laki-laki"
          value={loading ? "..." : fmt(summary?.laki)}
        />
        <SummaryCard
          title="Total Perempuan"
          value={loading ? "..." : fmt(summary?.perempuan)}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        <div className="bg-white rounded-xl shadow p-4 w-full">
          <BarPemilihKabko labels={bar.labels} values={bar.values} />
        </div>

        <div className="bg-white rounded-xl shadow p-4 w-full">
  <BarPemulaKabko labels={pemulaBar.labels} values={pemulaBar.values} />
</div>


        <div className="bg-white rounded-xl shadow p-4 w-full xl:col-span-2">
          <PieGender data={pieGender} />
        </div>
      </div>
    </Layout>
  );
}
