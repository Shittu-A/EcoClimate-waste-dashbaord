// @ts-nocheck  -- MapLibre expression arrays have overly strict types; all runtime values are valid
'use client'
import { useState, useCallback, useRef } from 'react'
import MapGL, { Source, Layer, Popup, NavigationControl, ScaleControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre'
import type { FeatureCollection, DumpSiteFeature } from '@/lib/data'

// ── Tile styles ──────────────────────────────────────────────────────────────

const STREET_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '© Esri, Maxar, Earthstar Geographics',
      maxzoom: 17,
    },
  },
  layers: [{ id: 'esri-satellite', type: 'raster', source: 'esri' }],
}

const HYBRID_STYLE = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '© Esri',
      maxzoom: 17,
    },
    labels: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 17,
    },
  },
  layers: [
    { id: 'esri-satellite', type: 'raster', source: 'esri' },
    { id: 'esri-labels',    type: 'raster', source: 'labels' },
  ],
}

type TileMode = 'street' | 'satellite' | 'hybrid'
const TILE_OPTIONS: { id: TileMode; label: string }[] = [
  { id: 'street',    label: 'Street'    },
  { id: 'satellite', label: 'Satellite' },
  { id: 'hybrid',    label: 'Hybrid'    },
]

// ── Pin SVG generator ────────────────────────────────────────────────────────

function makePinSvg(fill: string, stroke = '#fff'): string {
  // Teardrop pin: circle body with pointed tail
  return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
    <path d="M11 0C4.925 0 0 4.925 0 11c0 6.5 11 19 11 19S22 17.5 22 11C22 4.925 17.075 0 11 0z"
          fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="11" cy="10.5" r="4" fill="${stroke}" opacity="0.85"/>
  </svg>`
}

const PIN_DEFS = [
  { id: 'pin-official',   fill: '#22c55e' },
  { id: 'pin-unofficial', fill: '#ef4444' },
  { id: 'pin-unknown',    fill: '#94a3b8' },
  { id: 'pin-osm',        fill: '#3b82f6' },   // blue for OSM-sourced sites
]

function loadPinImages(map: any, onDone?: () => void) {
  let done = 0
  for (const { id, fill } of PIN_DEFS) {
    const svg = makePinSvg(fill)
    const img = new Image(22, 30)
    img.onload = () => {
      try { if (!map.hasImage(id)) map.addImage(id, img) } catch {}
      if (++done === PIN_DEFS.length) onDone?.()
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }
}

// ── Layer definitions ────────────────────────────────────────────────────────

const PIN_LAYER = {
  id: 'dumpsites-pins',
  type: 'symbol',
  layout: {
    'icon-image': [
      'case',
      // OSM-sourced sites get blue pin
      ['==', ['get', 'source'], 'OpenStreetMap'], 'pin-osm',
      // Others colour by type
      ['match', ['coalesce', ['get', 'type'], 'Unknown'],
        'Official',   'pin-official',
        'Unofficial', 'pin-unofficial',
        'pin-unknown',
      ],
    ],
    'icon-size':             ['interpolate', ['linear'], ['zoom'], 4, 0.45, 10, 0.75],
    'icon-anchor':           'bottom',
    'icon-allow-overlap':    true,
    'icon-ignore-placement': true,
  },
}

const HEATMAP_LAYER = {
  id: 'dumpsites-heatmap',
  type: 'heatmap',
  paint: {
    'heatmap-weight':    1,
    'heatmap-intensity': 1.5,
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0,   'rgba(0,0,0,0)',
      0.2, '#22c55e',
      0.5, '#eab308',
      0.8, '#ef4444',
      1,   '#991b1b',
    ] as unknown as string,
    'heatmap-radius':  20,
    'heatmap-opacity': 0.85,
  },
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  data:     FeatureCollection
  viewMode: 'dots' | 'heatmap'
}

interface PopupState {
  lon:   number
  lat:   number
  props: DumpSiteFeature['properties']
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DumpsiteMap({ data, viewMode }: Props) {
  const [popup,       setPopup]       = useState<PopupState | null>(null)
  const [tileMode,    setTileMode]    = useState<TileMode>('street')
  const [pinsReady,   setPinsReady]   = useState(false)

  const mapStyle =
    tileMode === 'satellite' ? SATELLITE_STYLE :
    tileMode === 'hybrid'    ? HYBRID_STYLE    :
    STREET_STYLE

  // Load pin images; fires on initial load AND after every tile-style swap
  const handleMapEvent = useCallback((e: any) => {
    loadPinImages(e.target, () => setPinsReady(true))
  }, [])

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0]
    if (!feature || feature.geometry.type !== 'Point') return
    const [lon, lat] = feature.geometry.coordinates as [number, number]
    setPopup({ lon, lat, props: feature.properties as DumpSiteFeature['properties'] })
  }, [])

  return (
    <MapGL
      initialViewState={{ longitude: 8.0, latitude: 9.5, zoom: 5.2 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      interactiveLayerIds={viewMode === 'dots' ? ['dumpsites-pins'] : []}
      onClick={handleClick}
      cursor="pointer"
      onLoad={handleMapEvent}
      onStyleData={handleMapEvent}
    >
      <NavigationControl position="top-right" />
      <ScaleControl position="bottom-right" />

      {/* Tile toggle */}
      <div className="absolute top-3 left-3 flex rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white text-xs font-medium">
        {TILE_OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setPinsReady(false); setTileMode(id) }}
            className={`px-3 py-1.5 transition-colors ${
              tileMode === id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Source id="dumpsites" type="geojson" data={data}>
        {viewMode === 'heatmap' ? (
          <Layer {...HEATMAP_LAYER} />
        ) : (
          pinsReady && <Layer {...PIN_LAYER} />
        )}
      </Source>

      {popup && (
        <Popup
          longitude={popup.lon}
          latitude={popup.lat}
          onClose={() => setPopup(null)}
          anchor="bottom"
          maxWidth="280px"
        >
          <div className="text-gray-900 text-sm p-1 space-y-2">
            <p className="font-semibold text-sm leading-snug">
              {popup.props.name ?? 'Unnamed Site'}
            </p>

            <table className="w-full text-xs">
              <tbody>
                {([
                  ['Type',        popup.props.type        ?? 'Unknown'],
                  ['Category',    popup.props.category    ?? 'Unknown'],
                  ['State',       popup.props.state_name  ?? '—'],
                  ['LGA',         popup.props.lga_name    ?? '—'],
                  ['Ownership',   popup.props.ownership   ?? 'Not specified'],
                ] as [string, string][]).map(([k, v]) => (
                  <tr key={k}>
                    <td className="text-gray-400 pr-3 py-0.5 whitespace-nowrap">{k}</td>
                    <td className="font-medium text-gray-800">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {popup.props.description && (
              <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-1">
                {popup.props.description}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                popup.props.source === 'OpenStreetMap'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {popup.props.source ?? 'Unknown source'}
              </span>
              {popup.props.survey_date && (
                <span className="text-[10px] text-gray-400">
                  Recorded: {popup.props.survey_date}
                </span>
              )}
            </div>
          </div>
        </Popup>
      )}
    </MapGL>
  )
}
