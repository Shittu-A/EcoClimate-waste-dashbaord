import type { FeatureCollection } from '@/lib/data'

interface Props {
  data: FeatureCollection
  total: number
}

export default function StatsCards({ data, total }: Props) {
  const count       = data.features.length
  const unofficial  = data.features.filter(f => f.properties.type === 'Unofficial').length
  const pct         = count > 0 ? Math.round((unofficial / count) * 100) : 0
  const stateCount  = new Set(data.features.map(f => f.properties.state_name)).size
  const lgaCount    = new Set(data.features.map(f => f.properties.lga_name)).size

  const cards = [
    { label: 'Total Sites',  value: count.toLocaleString(), sub: `of ${total.toLocaleString()}` },
    { label: 'Unofficial',   value: `${pct}%`,              sub: `${unofficial.toLocaleString()} sites` },
    { label: 'States',       value: stateCount,             sub: 'covered' },
    { label: 'LGAs',         value: lgaCount,               sub: 'covered' },
  ]

  return (
    <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-800 shrink-0">
      {cards.map(({ label, value, sub }) => (
        <div key={label} className="bg-gray-800 rounded-lg p-3">
          <div className="text-xl font-bold text-white">{value}</div>
          <div className="text-xs font-medium text-gray-300 mt-0.5">{label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
        </div>
      ))}
    </div>
  )
}
