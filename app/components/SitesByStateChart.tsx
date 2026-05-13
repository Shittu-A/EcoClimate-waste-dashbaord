'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { countByField, type FeatureCollection } from '@/lib/data'

interface Props { data: FeatureCollection }

const TOOLTIP_STYLE = {
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 6,
  fontSize: 12,
  color: '#fff',
}

export default function SitesByStateChart({ data }: Props) {
  const chartData = countByField(data, 'state_name').slice(0, 15).reverse()

  return (
    <div className="p-4 border-b border-gray-800">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Sites by State <span className="text-gray-600 font-normal">(top 15)</span>
      </h3>
      {chartData.length === 0 ? (
        <p className="text-gray-600 text-xs">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              width={85}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              formatter={(v: number) => [v.toLocaleString(), 'Sites']}
            />
            <Bar dataKey="count" radius={[0, 3, 3, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === chartData.length - 1 ? '#3b82f6' : '#1d4ed8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
