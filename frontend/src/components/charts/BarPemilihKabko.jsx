import ReactECharts from "echarts-for-react";

export default function BarPemilihKabko({ labels = [], values = [] }) {
  const option = {
    title: { text: "Jumlah Pemilih Aktif per Kabupaten/Kota", left: "center" },
    tooltip: { trigger: "axis" },
    grid: { left: 60, right: 30, bottom: 70, top: 60 },

    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: "value" },

    series: [
      {
        type: "bar",
        data: values,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        

        // ✅ tampilkan nilai
        label: {
          show: true,
          position: "top",
          formatter: (params) => new Intl.NumberFormat("id-ID").format(params.value),
          fontSize: 12,
          color: "#111827",
          hideOverlap: true
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320, width: "100%" }} />;
}
