'use client'
import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  loadData, applyFilters, getUniqueValues,
  type FeatureCollection, type Filters, EMPTY_FC,
} from '@/lib/data'
import FilterBar      from './components/FilterBar'
import StatsCards     from './components/StatsCards'
import SitesByStateChart from './components/SitesByStateChart'
import TypeBreakdown  from './components/TypeBreakdown'

const DumpsiteMap = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400 text-sm">
      Loading map...
    </div>
  ),
})

const INITIAL_FILTERS: Filters = { state: 'all', type: 'all', category: 'all' }

const LEGEND = [
  { color: '#22c55e', label: 'Official' },
  { color: '#ef4444', label: 'Unofficial' },
  { color: '#6b7280', label: 'Unknown' },
]

export default function Page() {
  const [rawData,  setRawData]  = useState<FeatureCollection>(EMPTY_FC)
  const [loading,  setLoading]  = useState(true)
  const [filters,  setFilters]  = useState<Filters>(INITIAL_FILTERS)
  const [viewMode, setViewMode] = useState<'dots' | 'heatmap'>('dots')

  useEffect(() => {
    loadData().then(d => { setRawData(d); setLoading(false) })
  }, [])

  const filtered  = useMemo(() => applyFilters(rawData, filters), [rawData, filters])
  const states    = useMemo(() => getUniqueValues(rawData, 'state_name'),  [rawData])
  const types     = useMemo(() => getUniqueValues(rawData, 'type'),        [rawData])
  const categories = useMemo(() => getUniqueValues(rawData, 'category'),   [rawData])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-3">
          <div className="text-2xl font-bold tracking-tight">Nigeria Dumpsites</div>
          <div className="flex items-center gap-2 text-gray-400 text-sm justify-center">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading 6,479 sites...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-gray-900
                         border-b border-gray-800 shrink-0">
        <div>
          <h1 className="text-base font-bold tracking-tight">Nigeria Dumpsites Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            eHealth Africa / GRID3 &middot; {rawData.features.length.toLocaleString()} sites
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(v => v === 'dots' ? 'heatmap' : 'dots')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            {viewMode === 'dots' ? 'Heatmap' : 'Dot Map'}
          </button>
          <button
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-700
                       hover:bg-gray-600 text-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* ── Filter Bar ── */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        states={states}
        types={types}
        categories={categories}
      />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map */}
        <div className="relative flex-1">
          <DumpsiteMap data={filtered} viewMode={viewMode} />

          {/* Legend (dots mode only) */}
          {viewMode === 'dots' && (
            <div className="absolute bottom-8 left-3 bg-gray-900/90 backdrop-blur-sm
                            rounded-lg px-3 py-2 border border-gray-700 text-xs space-y-1">
              {LEGEND.map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-gray-300">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col
                          overflow-y-auto shrink-0">
          <StatsCards data={filtered} total={rawData.features.length} />
          <SitesByStateChart data={filtered} />
          <TypeBreakdown data={filtered} />
        </aside>

      </div>
    </div>
  )
}
