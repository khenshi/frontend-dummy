import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getImageUrl, getProperty, updateProperty } from '../api/properties.api'
import { getApiError } from '../api/client'
import PropertyForm from '../components/properties/PropertyForm'
import type { Property, PropertyFormValues } from '../types/property'

const localInspection = (value: string | null) => {
  if (!value) return { date: '', time: '' }
  const [date, time] = new Date(value).toLocaleString('sv-SE').split(' ')
  return { date, time: time.slice(0, 5) }
}

export default function EditPropertyPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProperty(id)
      .then(setProperty)
      .catch((err) => setError(getApiError(err)))
      .finally(() => setLoading(false))
  }, [id])

  const submit = async (values: PropertyFormValues) => {
    setSaving(true)
    setError('')
    try {
      await updateProperty(id, values)
      navigate(`/properties/${id}`)
    } catch (err) {
      setError(getApiError(err))
      setSaving(false)
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />

  if (!property)
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">Property unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link className="btn-secondary mt-6" to="/properties">
          Back to properties
        </Link>
      </div>
    )

  const inspection = localInspection(property.inspectionAt)
  const values: PropertyFormValues = {
    title: property.title,
    description: property.description,
    availableDate: property.availableDate.slice(0, 10),
    inspectionDate: inspection.date,
    inspectionTime: inspection.time,
    isAvailable: property.isAvailable,
    latitude: String(property.latitude),
    longitude: String(property.longitude),
    price: String(property.price),
    numberOfRooms: String(property.numberOfRooms),
    propertyType: property.propertyType,
    image: null,
  }

  return (
    <div>
      <Link to={`/properties/${id}`} className="back-link">
        ← Back to property
      </Link>
      <div className="mt-5">
        <h1 className="page-title">Edit {property.title}</h1>
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <PropertyForm
          initialValues={values}
          existingImageUrl={getImageUrl(property.imageUrl)}
          submitLabel="Save changes"
          isSubmitting={saving}
          serverError={error}
          onSubmit={submit}
        />
      </div>
    </div>
  )
}
