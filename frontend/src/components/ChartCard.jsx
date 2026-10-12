import ReactECharts from 'echarts-for-react'

export default function ChartCard({ title, option }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-2">{title}</h2>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  )
}
