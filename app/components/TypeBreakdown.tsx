'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { countByField, type FeatureCollection } from '@/lib/data'

interface Props { data: FeatureCollection }

const COLORS: Record<string, string> = {
  Official:   '#22c55e',
  Unofficial: '#ef4444',
  Unknown:    '#6b7280',
}

const TOOLTIP_STYLE = {
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 6,
  fontSize: 12,
  color: '#fff',
}

export default function TypeBreakdown({ data }: Props) {
  const chartData = countByField(data, 'type')

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        Official vs Unofficial
      </h3>
      {chartData.length === 0 ? (
        <p className="text-gray-600 text-xs">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="count"
              nameKey="name"
            >
              {chartData.map(entry => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? '#8b5cf6'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [v.toLocaleString(), 'Sites']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: '#d1d5db', fontSize: 11 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
