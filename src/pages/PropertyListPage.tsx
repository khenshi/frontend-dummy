import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProperty, getProperties, type PropertyFilters } from '../api/properties.api'
import { getApiError } from '../api/client'
import DeletePropertyDialog from '../components/properties/DeletePropertyDialog'
import type { Property } from '../types/property'

interface FilterFormValues {
  search: string
  isAvailable: '' | 'true' | 'false'
  minPrice: string
  maxPrice: string
  minRooms: string
}

const emptyFilters: FilterFormValues = {
  search: '',
  isAvailable: '',
  minPrice: '',
  maxPrice: '',
  minRooms: '',
}

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const labelType = (type: Property['propertyType']) => type.charAt(0) + type.slice(1).toLowerCase()

export default function PropertyListPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filterForm, setFilterForm] = useState<FilterFormValues>(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilters>({})
  const [filterError, setFilterError] = useState('')

  const load = async (filters: PropertyFilters) => {
    setLoading(true)
    setError('')
    try {
      setProperties(await getProperties(filters))
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    void load(appliedFilters)
  }, [appliedFilters])

  const setFilter = (field: keyof FilterFormValues, value: string) => {
    setFilterForm((current) => ({ ...current, [field]: value }))
    setFilterError('')
  }

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    const search = filterForm.search.trim()
    const minPrice = filterForm.minPrice ? Number(filterForm.minPrice) : undefined
    const maxPrice = filterForm.maxPrice ? Number(filterForm.maxPrice) : undefined
    const minRooms = filterForm.minRooms ? Number(filterForm.minRooms) : undefined

    if (search.length > 100) {
      setFilterError('Search must be 100 characters or fewer.')
      return
    }
    if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) {
      setFilterError('Minimum price must be zero or greater.')
      return
    }
    if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
      setFilterError('Maximum price must be zero or greater.')
      return
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      setFilterError('Minimum price cannot be greater than maximum price.')
      return
    }
    if (minRooms !== undefined && (!Number.isInteger(minRooms) || minRooms < 1)) {
      setFilterError('Minimum rooms must be a positive whole number.')
      return
    }

    setAppliedFilters({
      search: search || undefined,
      isAvailable: filterForm.isAvailable === '' ? undefined : filterForm.isAvailable === 'true',
      minPrice,
      maxPrice,
      minRooms,
    })
  }

  const clearFilters = () => {
    setFilterForm(emptyFilters)
    setFilterError('')
    setAppliedFilters({})
  }

  const hasAppliedFilters = Object.values(appliedFilters).some((value) => value !== undefined)
  const confirmDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      await deleteProperty(selected.id)
      setProperties((items) => items.filter((item) => item.id !== selected.id))
      setSelected(null)
    } catch (err) {
      setError(getApiError(err))
      setSelected(null)
    } finally {
      setDeleting(false)
    }
  }
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Properties</h1>
        </div>
        <Link to="/properties/new" className="btn-primary">
          + Add property
        </Link>
      </div>
      <form
        onSubmit={applyFilters}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))_auto] lg:items-end">
          <label className="form-label md:col-span-2 lg:col-span-1">
            Search
            <input
              type="search"
              className="form-input"
              value={filterForm.search}
              maxLength={100}
              onChange={(event) => setFilter('search', event.target.value)}
              placeholder="Search title or description"
            />
          </label>
          <fieldset>
            <legend className="form-label">Availability</legend>
            <div className="mt-2 flex h-[42px] rounded-lg border border-slate-300 bg-slate-50 p-1 shadow-sm">
              {[
                { label: 'All', value: '' },
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`grid flex-1 cursor-pointer place-items-center rounded-md px-2 text-xs font-semibold transition ${
                    filterForm.isAvailable === option.value
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={filterForm.isAvailable === option.value}
                    onChange={(event) => setFilter('isAvailable', event.target.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="form-label">
            Minimum price
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              value={filterForm.minPrice}
              onChange={(event) => setFilter('minPrice', event.target.value)}
              placeholder="Any"
            />
          </label>
          <label className="form-label">
            Maximum price
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              value={filterForm.maxPrice}
              onChange={(event) => setFilter('maxPrice', event.target.value)}
              placeholder="Any"
            />
          </label>
          <label className="form-label">
            Minimum rooms
            <input
              type="number"
              min="1"
              step="1"
              className="form-input"
              value={filterForm.minRooms}
              onChange={(event) => setFilter('minRooms', event.target.value)}
              placeholder="Any"
            />
          </label>
          <div className="flex gap-2 md:col-span-2 lg:col-span-1">
            <button type="button" className="btn-secondary" onClick={clearFilters}>
              Clear
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Loading…' : 'Apply filters'}
            </button>
          </div>
        </div>
        {filterError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {filterError}
          </p>
        )}
      </form>
      {error && (
        <div
          className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button className="font-semibold underline" onClick={() => void load(appliedFilters)}>
            Try again
          </button>
        </div>
      )}
      {loading ? (
        <div
          className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white"
          aria-label="Loading properties"
        >
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-5 border-b border-slate-100 p-5 last:border-0">
              <div className="h-12 w-1/4 animate-pulse rounded bg-slate-200" />
              <div className="h-12 flex-1 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-xl">
            ⌂
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {hasAppliedFilters ? 'No matching properties' : 'No properties yet'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {hasAppliedFilters
              ? 'Try changing or clearing your search filters.'
              : 'Add your first property to start building your portfolio.'}
          </p>
          {hasAppliedFilters ? (
            <button type="button" className="btn-secondary mt-6" onClick={clearFilters}>
              Clear filters
            </button>
          ) : (
            <Link to="/properties/new" className="btn-primary mt-6">
              Add your first property
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm font-medium text-slate-500">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Property</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Rooms</th>
                  <th className="px-5 py-4 font-semibold">Available date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((property) => (
                  <tr key={property.id} className="transition hover:bg-slate-50/70">
                    <td className="max-w-xs px-5 py-4">
                      <Link
                        to={`/properties/${property.id}`}
                        className="font-semibold text-slate-900 hover:text-teal-800"
                      >
                        {property.title}
                      </Link>
                      <p className="mt-1 truncate text-xs text-slate-500">{property.description}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{labelType(property.propertyType)}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                      {money.format(property.price)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{property.numberOfRooms}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {new Date(property.availableDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={property.isAvailable ? 'badge-available' : 'badge-unavailable'}
                      >
                        {property.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/properties/${property.id}`} className="card-action">
                          View
                        </Link>
                        <Link to={`/properties/${property.id}/edit`} className="card-action">
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="card-action text-red-700 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                          onClick={() => setSelected(property)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {selected && (
        <DeletePropertyDialog
          title={selected.title}
          isDeleting={deleting}
          onCancel={() => setSelected(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  )
}
