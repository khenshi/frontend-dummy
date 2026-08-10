import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createProperty } from '../api/properties.api'
import { getApiError } from '../api/client'
import PropertyForm from '../components/properties/PropertyForm'
import type { PropertyFormValues } from '../types/property'

export default function CreatePropertyPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submit = async (values: PropertyFormValues) => {
    setSaving(true)
    setError('')
    try {
      const property = await createProperty(values)
      navigate(`/properties/${property.id}`)
    } catch (err) {
      setError(getApiError(err))
      setSaving(false)
    }
  }
  return (
    <div>
      <Link to="/properties" className="back-link">
        ← Back to properties
      </Link>
      <div className="mt-5">
        <h1 className="page-title">Add property</h1>
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <PropertyForm
          submitLabel="Create property"
          isSubmitting={saving}
          serverError={error}
          onSubmit={submit}
        />
      </div>
    </div>
  )
}
