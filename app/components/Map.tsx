// @ts-nocheck  -- MapLibre expression arrays have overly strict types; all runtime values are valid
'use client'
import { useState, useCallback } from 'react'
import MapGL, { Source, Layer, Popup, NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre'
import type { FeatureCollection, DumpSiteFeature } from '@/lib/data'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const circleLayer = {
  id: 'dumpsites-circles',
  type: 'circle',
  paint: {
    'circle-color': [
      'match',
      ['coalesce', ['get', 'type'], 'Unknown'],
      'Official',   '#22c55e',
      'Unofficial', '#ef4444',
      '#6b7280',
    ] as unknown as string,
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 6] as unknown as number,
    'circle-opacity': 0.85,
    'circle-stroke-color': '#fff',
    'circle-stroke-width': 0.5,
  },
}

const heatmapLayer = {
  id: 'dumpsites-heatmap',
  type: 'heatmap',
  paint: {
    'heatmap-weight': 1,
    'heatmap-intensity': 1.5,
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0,   'rgba(0,0,0,0)',
      0.2, '#22c55e',
      0.5, '#eab308',
      0.8, '#ef4444',
      1,   '#991b1b',
    ] as unknown as string,
    'heatmap-radius': 20,
    'heatmap-opacity': 0.85,
  },
}

interface Props {
  data: FeatureCollection
  viewMode: 'dots' | 'heatmap'
}

interface PopupState {
  lon: number
  lat: number
  props: DumpSiteFeature['properties']
}

export default function DumpsiteMap({ data, viewMode }: Props) {
  const [popup, setPopup] = useState<PopupState | null>(null)

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0]
    if (!feature || feature.geometry.type !== 'Point') return
    const coords = feature.geometry.coordinates as [number, number]
    setPopup({ lon: coords[0], lat: coords[1], props: feature.properties as DumpSiteFeature['properties'] })
  }, [])

  return (
    <MapGL
      initialViewState={{ longitude: 8.0, latitude: 9.5, zoom: 5.2 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={viewMode === 'dots' ? ['dumpsites-circles'] : []}
      onClick={handleClick}
      cursor="pointer"
    >
      <NavigationControl position="top-right" />
      <ScaleControl position="bottom-right" />

      <Source id="dumpsites" type="geojson" data={data}>
        {viewMode === 'heatmap'
          ? <Layer {...heatmapLayer} />
          : <Layer {...circleLayer} />
        }
      </Source>

      {popup && (
        <Popup
          longitude={popup.lon}
          latitude={popup.lat}
          onClose={() => setPopup(null)}
          anchor="bottom"
          maxWidth="260px"
        >
          <div className="text-gray-900 text-sm p-1">
            <p className="font-semibold mb-2 text-sm">{popup.props.name ?? 'Unnamed Site'}</p>
            <table className="w-full text-xs">
              <tbody>
                {([
                  ['Type',      popup.props.type      ?? 'Unknown'],
                  ['Category',  popup.props.category  ?? 'Unknown'],
                  ['State',     popup.props.state_name ?? '—'],
                  ['LGA',       popup.props.lga_name  ?? '—'],
                  ['Ownership', popup.props.ownership ?? 'None'],
                ] as [string, string][]).map(([k, v]) => (
                  <tr key={k}>
                    <td className="text-gray-500 pr-3 py-0.5 whitespace-nowrap">{k}</td>
                    <td className="font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Popup>
      )}
    </MapGL>
  )
}
