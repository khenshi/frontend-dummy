import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProperty, getProperties } from '../api/properties.api'
import { getApiError } from '../api/client'
import DeletePropertyDialog from '../components/properties/DeletePropertyDialog'
import PropertyCard from '../components/properties/PropertyCard'
import type { Property } from '../types/property'

export default function PropertyListPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)
  const load = async () => { setLoading(true); setError(''); try { setProperties(await getProperties()) } catch (err) { setError(getApiError(err)) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  const confirmDelete = async () => { if (!selected) return; setDeleting(true); try { await deleteProperty(selected.id); setProperties((items) => items.filter((item) => item.id !== selected.id)); setSelected(null) } catch (err) { setError(getApiError(err)); setSelected(null) } finally { setDeleting(false) } }
  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Portfolio</p><h1 className="page-title">Properties</h1><p className="page-copy">Manage property details, availability, and pricing.</p></div><Link to="/properties/new" className="btn-primary">+ Add property</Link></div>
    {error && <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><span>{error}</span><button className="font-semibold underline" onClick={() => void load()}>Try again</button></div>}
    {loading ? <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading properties">{[1,2,3].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="aspect-[16/10] animate-pulse bg-slate-200"/><div className="space-y-3 p-5"><div className="h-5 w-2/3 animate-pulse rounded bg-slate-200"/><div className="h-4 w-1/3 animate-pulse rounded bg-slate-100"/></div></div>)}</div> : properties.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-xl">⌂</div><h2 className="mt-4 text-lg font-semibold text-slate-900">No properties yet</h2><p className="mt-2 text-sm text-slate-500">Add your first property to start building your portfolio.</p><Link to="/properties/new" className="btn-primary mt-6">Add your first property</Link></div> : <><p className="mt-8 text-sm font-medium text-slate-500">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</p><div className="mt-3 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} onDelete={setSelected} />)}</div></>}
    {selected && <DeletePropertyDialog title={selected.title} isDeleting={deleting} onCancel={() => setSelected(null)} onConfirm={() => void confirmDelete()} />}
  </div>
}
