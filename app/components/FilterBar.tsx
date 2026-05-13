'use client'
import type { Filters } from '@/lib/data'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  states: string[]
  types: string[]
  categories: string[]
}

export default function FilterBar({ filters, onChange, states, types, categories }: Props) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value })

  const fields = [
    { key: 'state'    as const, label: 'State',    options: states },
    { key: 'type'     as const, label: 'Type',     options: types },
    { key: 'category' as const, label: 'Category', options: categories },
  ]

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-gray-900 border-b border-gray-800 shrink-0 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Filter</span>
      {fields.map(({ key, label, options }) => (
        <select
          key={key}
          value={filters[key]}
          onChange={set(key)}
          className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md
                     px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500
                     cursor-pointer hover:border-gray-500 transition-colors"
        >
          <option value="all">All {label}s</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
    </div>
  )
}
