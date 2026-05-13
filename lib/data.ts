export interface DumpSiteProps {
  name:        string | null
  type:        string | null
  category:    string | null
  state_name:  string | null
  lga_name:    string | null
  ownership:   string | null
  source:      string | null
  survey_date: string | null
  description: string | null
}

export interface DumpSiteFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: DumpSiteProps
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: DumpSiteFeature[]
}

export interface Filters {
  state:    string
  type:     string
  category: string
  source:   string
}

export const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] }

export async function loadData(): Promise<FeatureCollection> {
  const res = await fetch('/nigeria_dumpsites.geojson')
  const raw = await res.json()
  raw.features = raw.features.filter(
    (f: DumpSiteFeature) =>
      f.geometry &&
      Array.isArray(f.geometry.coordinates) &&
      f.geometry.coordinates.length === 2 &&
      f.geometry.coordinates[0] !== null &&
      f.geometry.coordinates[1] !== null
  )
  return raw as FeatureCollection
}

export function applyFilters(fc: FeatureCollection, filters: Filters): FeatureCollection {
  const features = fc.features.filter(f => {
    const p = f.properties
    if (filters.state    !== 'all' && p.state_name !== filters.state)                         return false
    if (filters.type     !== 'all' && (p.type     ?? 'Unknown') !== filters.type)             return false
    if (filters.category !== 'all' && (p.category ?? 'Unknown') !== filters.category)         return false
    if (filters.source   !== 'all' && (p.source   ?? 'Unknown') !== filters.source)           return false
    return true
  })
  return { ...fc, features }
}

export function getUniqueValues(fc: FeatureCollection, field: keyof DumpSiteProps): string[] {
  const set = new Set<string>()
  fc.features.forEach(f => {
    const val = f.properties[field]
    if (val != null && val !== '') set.add(String(val))
  })
  return Array.from(set).sort()
}

export function countByField(
  fc: FeatureCollection,
  field: keyof DumpSiteProps,
): { name: string; count: number }[] {
  const counts: Record<string, number> = {}
  fc.features.forEach(f => {
    const val = String(f.properties[field] ?? 'Unknown')
    counts[val] = (counts[val] ?? 0) + 1
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
