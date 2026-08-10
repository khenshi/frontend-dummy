import { apiClient, API_URL } from './client'
import type { Property, PropertyFormValues } from '../types/property'

interface ApiResponse<T> {
  success: true
  data: T
}

export interface PropertyFilters {
  search?: string
  isAvailable?: boolean
  minPrice?: number
  maxPrice?: number
  minRooms?: number
}

function toFormData(values: PropertyFormValues) {
  const data = new FormData()
  data.append('title', values.title.trim())
  data.append('description', values.description.trim())
  data.append('availableDate', values.availableDate)
  data.append(
    'inspectionAt',
    values.inspectionAt ? new Date(values.inspectionAt).toISOString() : '',
  )
  data.append('isAvailable', String(values.isAvailable))
  data.append('latitude', values.latitude)
  data.append('longitude', values.longitude)
  data.append('price', values.price)
  data.append('numberOfRooms', values.numberOfRooms)
  data.append('propertyType', values.propertyType)
  if (values.image) data.append('image', values.image)
  return data
}

export async function getProperties(filters: PropertyFilters = {}) {
  return (await apiClient.get<ApiResponse<Property[]>>('/properties', { params: filters })).data
    .data
}
export async function getProperty(id: string) {
  return (await apiClient.get<ApiResponse<Property>>(`/properties/${id}`)).data.data
}
export async function createProperty(values: PropertyFormValues) {
  return (await apiClient.post<ApiResponse<Property>>('/properties', toFormData(values))).data.data
}
export async function updateProperty(id: string, values: PropertyFormValues) {
  return (await apiClient.patch<ApiResponse<Property>>(`/properties/${id}`, toFormData(values)))
    .data.data
}
export async function deleteProperty(id: string) {
  await apiClient.delete(`/properties/${id}`)
}
export function getImageUrl(path: string | null) {
  return path ? `${API_URL}${path.startsWith('/') ? '' : '/'}${path}` : null
}
