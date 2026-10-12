import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import UploadCSV from "./pages/UploadCSV";
import GandaDalamKabko from "./pages/GandaDalamKabko";
import GandaAntarKabko from "./pages/GandaAntarKabko";
import PotensialDalamKabko from "./pages/PotensialDalamKabko";

import PotensialAntarKabko from "./pages/PotensialAntarKabko";
import AnomaliUmur from "./pages/AnomaliUmur";
import AnomaliKelamin from "./pages/AnomaliKelamin";
import FuzzyMatching from "./pages/FuzzyMatching";
import FuzzyMatchingAntarKabko from "./pages/FuzzyMatchingAntarKabko";
import OutlierNKKProv from "./pages/OutlierNKKProv";
import ModelRekap from "./pages/ModelRekap";










export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
<Route path="/ganda-antar-kabko" element={<GandaAntarKabko />} />
        <Route path="/potensi-ganda" element={<Placeholder title="Potensi Ganda" />} />

<Route path="/anomali-kelamin" element={<AnomaliKelamin />} />
        <Route path="/upload-csv" element={<UploadCSV />} />
        <Route path="/ganda-kabko" element={<GandaDalamKabko />} />
        <Route path="/potensial-dalam-kabko" element={<PotensialDalamKabko />} />
        <Route path="/potensial-antar-kabko" element={<PotensialAntarKabko />} />
        <Route path="/anomali-umur" element={<AnomaliUmur />} />
        <Route path="/fuzzy-matching" element={<FuzzyMatching />} />
        <Route path="/fuzzy-antar-kabko" element={<FuzzyMatchingAntarKabko />} />
        <Route path="/outlier-nkk-prov" element={<OutlierNKKProv />} />
<Route path="/model-rekap" element={<ModelRekap />} />






      </Routes>
    </BrowserRouter>
  );
}
