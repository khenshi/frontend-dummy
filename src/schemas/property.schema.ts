import { z } from 'zod'

const requiredNumber = (label: string) =>
  z.string().trim().min(1, `${label} is required`).refine(Number.isFinite.bind(null), `${label} must be a number`)

export const propertySchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  availableDate: z.string().min(1, 'Available date is required').refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date'),
  inspectionAt: z.string().refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Enter a valid date and time'),
  isAvailable: z.boolean(),
  latitude: requiredNumber('Latitude').refine((value) => Number(value) >= -90 && Number(value) <= 90, 'Latitude must be between -90 and 90'),
  longitude: requiredNumber('Longitude').refine((value) => Number(value) >= -180 && Number(value) <= 180, 'Longitude must be between -180 and 180'),
  price: requiredNumber('Price').refine((value) => Number(value) >= 0, 'Price cannot be negative'),
  numberOfRooms: requiredNumber('Rooms').refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, 'Rooms must be a positive whole number'),
  image: z.instanceof(File).nullable().refine((file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Use a JPEG, PNG, or WebP image').refine((file) => !file || file.size <= 5 * 1024 * 1024, 'Image must be 5 MB or smaller'),
})

export type PropertyFieldErrors = Partial<Record<keyof z.infer<typeof propertySchema>, string>>
