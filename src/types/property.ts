export interface Property {
  id: string
  title: string
  description: string
  availableDate: string
  inspectionAt: string | null
  isAvailable: boolean
  latitude: number
  longitude: number
  price: number
  numberOfRooms: number
  createdAt: string
  updatedAt: string
  imageUrl: string | null
}

export interface PropertyFormValues {
  title: string
  description: string
  availableDate: string
  inspectionAt: string
  isAvailable: boolean
  latitude: string
  longitude: string
  price: string
  numberOfRooms: string
  image: File | null
}
