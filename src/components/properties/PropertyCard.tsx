// import { Link } from 'react-router-dom'
// import { getImageUrl } from '../../api/properties.api'
// import type { Property } from '../../types/property'

// interface Props {
//   property: Property
//   onDelete: (property: Property) => void
// }
// const money = new Intl.NumberFormat('en-PH', {
//   style: 'currency',
//   currency: 'PHP',
//   maximumFractionDigits: 2,
// })

// export default function PropertyCard({ property, onDelete }: Props) {
//   const image = getImageUrl(property.imageUrl)
//   return (
//     <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition">
//       <Link
//         to={`/properties/${property.id}`}
//         className="block aspect-[16/10] overflow-hidden bg-slate-100"
//       >
//         {image ? (
//           <img
//             src={image}
//             alt={property.title}
//             className="h-full w-full object-cover transition duration-300"
//           />
//         ) : (
//           <div className="grid h-full place-items-center text-sm font-medium text-slate-400">
//             No image
//           </div>
//         )}
//       </Link>
//       <div className="p-5">
//         <div className="flex items-start justify-between gap-3">
//           <div>
//             <h2 className="font-semibold text-slate-900">
//               <Link to={`/properties/${property.id}`} className="hover:text-teal-700">
//                 {property.title}
//               </Link>
//             </h2>
//             <p className="mt-1 text-lg font-semibold text-slate-900">
//               {money.format(property.price)}
//             </p>
//           </div>
//           <span className={property.isAvailable ? 'badge-available' : 'badge-unavailable'}>
//             {property.isAvailable ? 'Available' : 'Unavailable'}
//           </span>
//         </div>
//         <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
//           <span>
//             {property.numberOfRooms} {property.numberOfRooms === 1 ? 'room' : 'rooms'}
//           </span>
//           <span>Available {new Date(property.availableDate).toLocaleDateString()}</span>
//         </div>
//         <div className="mt-5 grid grid-cols-3 gap-2">
//           <Link className="card-action" to={`/properties/${property.id}`}>
//             View
//           </Link>
//           <Link className="card-action" to={`/properties/${property.id}/edit`}>
//             Edit
//           </Link>
//           <button
//             className="card-action text-red-600 hover:border-red-200 hover:bg-red-50"
//             onClick={() => onDelete(property)}
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </article>
//   )
// }
