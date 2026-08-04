import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import { CalendarDays, Crosshair, List, Map as MapIcon, MapPin, Plus, Search } from 'lucide-react'
import { api, messageOf } from './lib'
import { Alert, Badge, Button, Input } from './components/ui'

const TANZANIA_CENTER = [35.5, -6.25]
const TANZANIA_BOUNDS = [[28.5, -12.5], [41.5, -0.5]]
const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
const rasterStyle = { version: 8, sources: { osm: { type: 'raster', tiles: [tileUrl], tileSize: 256, attribution: '© OpenStreetMap contributors © CARTO' } }, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#e9ece7' } }, { id: 'osm', type: 'raster', source: 'osm' }] }
const mapStyle = import.meta.env.VITE_MAP_STYLE_URL || rasterStyle
const date = value => value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
const hasLocation = event => Number.isFinite(Number(event.latitude)) && Number.isFinite(Number(event.longitude))

function BaseMap({ events = [], selectedId, onSelect, onPick, value, draggable = false, className = '' }) {
  const container = useRef(null); const map = useRef(null); const markers = useRef([]); const picker = useRef(null); const pickHandler = useRef(onPick)
  pickHandler.current = onPick
  useEffect(() => {
    if (!container.current || map.current) return
    map.current = new maplibregl.Map({ container: container.current, style: mapStyle, center: TANZANIA_CENTER, zoom: 5.1, maxBounds: [[27, -14], [43, 1]], attributionControl: true })
    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.current.on('click', event => pickHandler.current?.({ longitude: event.lngLat.lng, latitude: event.lngLat.lat }))
    const observer = new ResizeObserver(() => map.current?.resize()); observer.observe(container.current)
    return () => { observer.disconnect(); map.current?.remove(); map.current = null }
  }, [])
  useEffect(() => {
    markers.current.forEach(marker => marker.remove()); markers.current = []
    if (!map.current) return
    events.filter(hasLocation).forEach(event => {
      const element = document.createElement('button'); element.type = 'button'; element.className = `event-map-marker${String(selectedId) === String(event.id || event._id) ? ' selected' : ''}`; element.setAttribute('aria-label', `Show ${event.name}`); element.innerHTML = '<span></span>'
      element.addEventListener('click', click => { click.stopPropagation(); onSelect?.(event) })
      markers.current.push(new maplibregl.Marker({ element }).setLngLat([Number(event.longitude), Number(event.latitude)]).addTo(map.current))
    })
  }, [events, selectedId, onSelect])
  useEffect(() => {
    if (!map.current || !selectedId) return; const event = events.find(item => String(item.id || item._id) === String(selectedId)); if (hasLocation(event)) map.current.flyTo({ center: [Number(event.longitude), Number(event.latitude)], zoom: Math.max(map.current.getZoom(), 9), essential: true })
  }, [selectedId, events])
  useEffect(() => {
    picker.current?.remove(); picker.current = null
    if (!map.current || !value || !hasLocation(value)) return
    picker.current = new maplibregl.Marker({ color: '#f58220', draggable }).setLngLat([Number(value.longitude), Number(value.latitude)]).addTo(map.current)
    if (draggable) picker.current.on('dragend', () => { const point = picker.current.getLngLat(); pickHandler.current?.({ longitude: point.lng, latitude: point.lat }) })
    map.current.flyTo({ center: [Number(value.longitude), Number(value.latitude)], zoom: Math.max(map.current.getZoom(), 10), essential: true })
  }, [value, draggable])
  const reset = () => map.current?.fitBounds(TANZANIA_BOUNDS, { padding: 35, duration: 700 })
  return <div className={`event-map-canvas ${className}`}><div ref={container}/><button className="map-reset" onClick={reset} type="button" aria-label="Show all Tanzania"><Crosshair/></button></div>
}

export function EventMapDirectory({ events, mode = 'public', loading = false, error, onManage }) {
  const [search, setSearch] = useState(''); const [selectedId, setSelectedId] = useState(null); const [mobileView, setMobileView] = useState('list'); const refs = useRef({})
  const filtered = useMemo(() => (events || []).filter(event => `${event.name} ${event.venue} ${event.address} ${event.locationLabel}`.toLowerCase().includes(search.toLowerCase())), [events, search])
  const select = event => { const id = event.id || event._id; setSelectedId(id); refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }
  const action = event => mode === 'admin' ? <div className="event-card-actions"><Button size="sm" onClick={() => onManage(event)}>Manage event</Button><Button size="sm" variant="outline" asChild><Link to={`/admin/events/${event._id}/booths`}>Manage booths</Link></Button></div> : <Button size="sm" asChild><Link to={mode === 'booking' ? `/portal/events/${event.id || event._id}` : `/events/${event.slug}`}>{mode === 'booking' ? 'Choose a booth' : 'Explore event'}</Link></Button>
  return <section className={`event-map-directory mobile-${mobileView}`}>
    <div className="event-map-list"><header><div><h1>{mode === 'admin' ? 'All Events' : mode === 'booking' ? 'Book an event' : 'Events across Tanzania'}</h1><p>{filtered.length} event{filtered.length === 1 ? '' : 's'}</p></div>{mode === 'admin' && <Button asChild><Link to="/admin/events/new"><Plus/>Add an event</Link></Button>}</header><div className="event-map-search"><Search/><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search events..." aria-label="Search events"/></div>
      <div className="event-map-scroll">{loading ? <div className="event-map-state">Loading events…</div> : error ? <Alert>{messageOf(error)}</Alert> : filtered.map(event => { const id = event.id || event._id; return <article ref={node => { refs.current[id] = node }} key={id} className={String(selectedId) === String(id) ? 'selected' : ''} onClick={() => select(event)}><div className="event-card-title"><i><CalendarDays/></i><div><h2>{event.name}</h2><p><MapPin/>{event.locationLabel || event.address || event.venue || 'Location not set'}</p></div><Badge tone={event.status === 'published' || event.status === 'active' ? 'green' : 'orange'}>{event.salesPaused ? 'Sales paused' : event.status}</Badge></div><div className="event-card-dates"><span>Starts <strong>{date(event.startsAt)}</strong></span><span>Ends <strong>{date(event.endsAt)}</strong></span></div>{!hasLocation(event) && <small className="missing-location">Location needs to be set</small>}{action(event)}</article> })}{!loading && !error && !filtered.length && <div className="event-map-state">No matching events found.</div>}</div>
    </div><BaseMap events={filtered} selectedId={selectedId} onSelect={select}/><div className="event-mobile-toggle"><button className={mobileView === 'list' ? 'active' : ''} onClick={() => setMobileView('list')}><List/>List</button><button className={mobileView === 'map' ? 'active' : ''} onClick={() => setMobileView('map')}><MapIcon/>Map</button></div>
  </section>
}

export function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState(''); const [results, setResults] = useState([]); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  useEffect(() => { if (query.trim().length < 2) { setResults([]); return }; const timer = setTimeout(async () => { setBusy(true); setError(''); try { setResults((await api.get('/admin/locations/search', { params: { q: query.trim() } })).data.data) } catch (requestError) { setError(messageOf(requestError)) } finally { setBusy(false) } }, 450); return () => clearTimeout(timer) }, [query])
  const choose = item => { onChange({ latitude: item.latitude, longitude: item.longitude, locationLabel: item.label }); setQuery(item.label); setResults([]) }
  const pick = async point => { setError(''); onChange({ ...point, locationLabel: value?.locationLabel || '' }); try { const result = (await api.get('/admin/locations/reverse', { params: point })).data.data; onChange({ latitude: result.latitude, longitude: result.longitude, locationLabel: result.label }) } catch (requestError) { setError(messageOf(requestError)) } }
  return <div className="location-picker"><div className="location-search"><Search/><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a place in Tanzania"/>{(busy || results.length > 0) && <div className="location-results">{busy ? <span>Searching…</span> : results.map(item => <button type="button" key={item.id} onClick={() => choose(item)}><MapPin/><span>{item.label}</span></button>)}</div>}</div>{error && <Alert>{error}</Alert>}<BaseMap className="location-picker-map" value={value} onPick={pick} draggable/><p>Search above, click the map, or drag the orange marker. Tanzania locations only.</p></div>
}
