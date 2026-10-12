import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function fmt(n){ return new Intl.NumberFormat("id-ID").format(n || 0); }

export default function ModelRekap(){
  const [rekapProv, setRekapProv] = useState([]);
  const [totalProv, setTotalProv] = useState(null);

  const [tahapanList, setTahapanList] = useState([]);
  const [tahapanId, setTahapanId] = useState("");
  const [rekapPerubahan, setRekapPerubahan] = useState([]);
  const [totalPerubahan, setTotalPerubahan] = useState(null);

  async function fetchProvinsi(){
    const res = await fetch("http://127.0.0.1:8000/rekap/provinsi");
    const json = await res.json();
    setRekapProv(json.data || []);
    setTotalProv(json.total || null);
  }

  async function fetchTahapanList(){
    const res = await fetch("http://127.0.0.1:8000/rekap/tahapan-list");
    const json = await res.json();
    setTahapanList(json.tahapan || []);
    if(json.tahapan?.length){
      setTahapanId(json.tahapan[0]);
    }
  }

  async function fetchPerubahan(id){
    if(!id) return;
    const res = await fetch(`http://127.0.0.1:8000/rekap/perubahan?tahapan_id=${id}`);
    const json = await res.json();
    setRekapPerubahan(json.data || []);
    setTotalPerubahan(json.total || null);
  }

  useEffect(()=>{
    fetchProvinsi();
    fetchTahapanList();
  }, []);

  useEffect(()=>{
    fetchPerubahan(tahapanId);
  }, [tahapanId]);

  return (
    <Layout>
      <div className="space-y-10">
        <h1 className="text-3xl font-bold">Model Rekap</h1>

        {/* ====================== */}
        {/* Rekap Pemilih Provinsi */}
        {/* ====================== */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Model A–Rekap Provinsi–PDPB</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border p-2">No</th>
                  <th className="border p-2">Nama Kab/Kota</th>
                  <th className="border p-2">Jumlah Kecamatan</th>
                  <th className="border p-2">Jumlah Desa/Kel</th>
                  <th className="border p-2">L</th>
                  <th className="border p-2">P</th>
                  <th className="border p-2">L+P</th>
                </tr>
              </thead>
              <tbody>
                {rekapProv.map((r,i)=>(
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border p-2 text-center">{i+1}</td>
                    <td className="border p-2">{r.kabkota}</td>
                    <td className="border p-2 text-center">{fmt(r.jumlah_kecamatan)}</td>
                    <td className="border p-2 text-center">{fmt(r.jumlah_kelurahan)}</td>
                    <td className="border p-2 text-right">{fmt(r.l)}</td>
                    <td className="border p-2 text-right">{fmt(r.p)}</td>
                    <td className="border p-2 text-right font-bold">{fmt(r.lp)}</td>
                  </tr>
                ))}

                {totalProv && (
                  <tr className="bg-slate-200 font-bold">
                    <td className="border p-2 text-center" colSpan={2}>TOTAL</td>
                    <td className="border p-2 text-center">{fmt(totalProv.jumlah_kecamatan)}</td>
                    <td className="border p-2 text-center">{fmt(totalProv.jumlah_kelurahan)}</td>
                    <td className="border p-2 text-right">{fmt(totalProv.l)}</td>
                    <td className="border p-2 text-right">{fmt(totalProv.p)}</td>
                    <td className="border p-2 text-right">{fmt(totalProv.lp)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        

      </div>
    </Layout>
  );
}
