import { Link, Navigate, Route, Routes } from 'react-router-dom'
import PropertyListPage from './pages/PropertyListPage'
import PropertyDetailsPage from './pages/PropertyDetailsPage'
import CreatePropertyPage from './pages/CreatePropertyPage'
import EditPropertyPage from './pages/EditPropertyPage'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/properties" replace />} />
          <Route path="/properties" element={<PropertyListPage />} />
          <Route path="/properties/new" element={<CreatePropertyPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/properties/:id/edit" element={<EditPropertyPage />} />
          <Route path="*" element={<Navigate to="/properties" replace />} />
        </Routes>
      </main>
    </div>
  )
}
