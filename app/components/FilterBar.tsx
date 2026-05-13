'use client'
import type { Filters } from '@/lib/data'

interface Props {
  filters:    Filters
  onChange:   (f: Filters) => void
  states:     string[]
  types:      string[]
  categories: string[]
  sources:    string[]
}

export default function FilterBar({ filters, onChange, states, types, categories, sources }: Props) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value })

  const fields = [
    { key: 'state'    as const, label: 'State',    options: states },
    { key: 'type'     as const, label: 'Type',     options: types },
    { key: 'category' as const, label: 'Category', options: categories },
    { key: 'source'   as const, label: 'Source',   options: sources },
  ]

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-gray-50 border-b border-gray-200 shrink-0 flex-wrap">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Filter</span>
      {fields.map(({ key, label, options }) => (
        <select
          key={key}
          value={filters[key]}
          onChange={set(key)}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md
                     px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500
                     cursor-pointer hover:border-gray-400 transition-colors"
        >
          <option value="all">All {label}s</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
    </div>
  )
}
