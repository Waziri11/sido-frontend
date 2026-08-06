import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { api, messageOf } from './lib'
import { Alert, Button, Dialog, DialogContent, DialogTitle, Field, Input } from './components/ui'
import { useApp } from './context'

const configs = {
  entrepreneurs: {
    title: ['Export entrepreneurs report', 'Pakua ripoti ya wajasiriamali'], endpoint: '/admin/reports/entrepreneurs.pdf', selection: 'columns',
    options: [['name','Entrepreneur'],['email','Email'],['phone','Phone'],['business','Business'],['type','Business type'],['location','Region / district'],['address','Address'],['tin','TIN'],['status','Status'],['verified','Verified'],['registered','Registered']],
    filters: ['search','status','region','archived','dates'],
  },
  events: {
    title: ['Export events summary', 'Pakua muhtasari wa matukio'], endpoint: '/admin/reports/events.pdf', selection: 'columns',
    options: [['name','Event'],['location','Location'],['dates','Event dates'],['booking','Booking window'],['status','Status'],['booths','Booths'],['occupied','Occupied'],['transactions','Paid sales'],['revenue','Revenue']],
    filters: ['search','eventStatus','dates'],
  },
  event: {
    title: ['Export event detail report', 'Pakua ripoti ya tukio'], endpoint: id => `/admin/reports/events/${id}.pdf`, selection: 'sections',
    options: [['overview','Event overview'],['booths','Booth occupancy'],['applications','Entrepreneur applications'],['transactions','Transactions']], filters: [],
  },
  revenue: {
    title: ['Export revenue report', 'Pakua ripoti ya mapato'], endpoint: '/admin/reports/revenue.pdf', selection: 'sections',
    options: [['summary','Revenue summary'],['monthly','Monthly revenue'],['regions','Revenue by region'],['events','Revenue by event'],['transactions','Paid transaction ledger']], filters: ['search','region','event','dates'],
  },
}

export default function AdminReportExport({ type, eventId, events = [] }) {
  const { language } = useApp(); const config = configs[type]; const [open, setOpen] = useState(false); const [selected, setSelected] = useState(config.options.map(x => x[0])); const [values, setValues] = useState({}); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [availableEvents, setAvailableEvents] = useState(events)
  useEffect(() => { if (open) { setSelected(config.options.map(x => x[0])); setValues({}); setError('') } }, [open, config])
  useEffect(() => { if (open && type === 'revenue' && !availableEvents.length) api.get('/admin/events').then(response => setAvailableEvents(response.data.data)).catch(() => {}) }, [open, type, availableEvents.length])
  const endpoint = useMemo(() => typeof config.endpoint === 'function' ? config.endpoint(eventId) : config.endpoint, [config, eventId])
  const update = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }))
  const toggle = key => setSelected(current => current.includes(key) ? current.filter(x => x !== key) : [...current, key])
  const download = async () => {
    setBusy(true); setError('')
    try {
      const params = { ...values, language, [config.selection]: selected.join(',') }; Object.keys(params).forEach(key => !params[key] && delete params[key])
      const response = await api.get(endpoint, { params, responseType: 'blob' }); const disposition = response.headers['content-disposition'] || ''; const match = disposition.match(/filename="?([^";]+)"?/i); const url = URL.createObjectURL(response.data); const anchor = document.createElement('a'); anchor.href = url; anchor.download = match?.[1] || 'SIDO-Report.pdf'; anchor.click(); URL.revokeObjectURL(url); setOpen(false)
    } catch (requestError) { setError(messageOf(requestError)) } finally { setBusy(false) }
  }
  const sw = language === 'sw'
  return <Dialog open={open} onOpenChange={setOpen}><Button variant="outline" onClick={() => setOpen(true)}><Download size={16}/>{sw ? 'Pakua PDF' : 'Export PDF'}</Button>{open && <DialogContent className="report-export-dialog"><DialogTitle>{config.title[sw ? 1 : 0]}</DialogTitle><p className="muted">{sw ? 'Chagua vichujio na taarifa zitakazojumuishwa.' : 'Choose filters and the information to include.'}</p>{error && <Alert>{error}</Alert>}<div className="report-filter-grid">{config.filters.includes('search') && <Field label="Search"><Input name="search" value={values.search || ''} onChange={update}/></Field>}{config.filters.includes('status') && <Field label="Account status"><select name="status" value={values.status || ''} onChange={update}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></Field>}{config.filters.includes('eventStatus') && <Field label="Event status"><select name="status" value={values.status || ''} onChange={update}><option value="">All statuses</option>{['draft','published','booking_closed','active','completed','cancelled'].map(x => <option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select></Field>}{config.filters.includes('region') && <Field label="Region"><Input name="region" value={values.region || ''} onChange={update}/></Field>}{config.filters.includes('archived') && <Field label="Records"><select name="archived" value={values.archived || ''} onChange={update}><option value="">Current accounts</option><option value="true">Archived accounts</option><option value="all">All accounts</option></select></Field>}{config.filters.includes('event') && <Field label="Event"><select name="event" value={values.event || ''} onChange={update}><option value="">All events</option>{availableEvents.map(event => <option key={event.id || event.eventId || event._id} value={event.id || event.eventId || event._id}>{event.name || event.eventName}</option>)}</select></Field>}{config.filters.includes('dates') && <><Field label="From"><Input type="date" name="from" value={values.from || ''} onChange={update}/></Field><Field label="To"><Input type="date" name="to" value={values.to || ''} onChange={update}/></Field></>}</div><div className="report-selector-heading"><strong>{config.selection === 'columns' ? 'Report columns' : 'Report sections'}</strong><div><button type="button" onClick={() => setSelected(config.options.map(x => x[0]))}>Select all</button><button type="button" onClick={() => setSelected([])}>Clear</button></div></div><div className="report-option-grid">{config.options.map(([key,label]) => <label key={key}><input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)}/><span>{label}</span></label>)}</div>{!selected.length && <p className="report-selection-error">Select at least one item.</p>}<div className="form-actions"><Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button><Button onClick={download} disabled={busy || !selected.length}>{busy ? <><Loader2 className="spin"/>Generating…</> : <><Download/>Download PDF</>}</Button></div></DialogContent>}</Dialog>
}
