import ReactECharts from "echarts-for-react";

export default function PieGender({ data = [] }) {
  const option = {
    title: { text: "Komposisi Pemilih Laki-laki & Perempuan", left: "center" },
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },

    series: [
      {
        type: "pie",
        radius: "65%",
        data,

        // ✅ tampilkan label angka + %
        label: {
          show: true,
          formatter: (params) => {
            const value = new Intl.NumberFormat("id-ID").format(params.value);
            return `${params.name}\n${value} (${params.percent}%)`;
          },
          fontSize: 13,
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 360, width: "100%" }} />;
}
