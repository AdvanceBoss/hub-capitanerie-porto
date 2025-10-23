import React from 'react'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-ocean-900">
      <div className="text-center">
        <div className="text-9xl font-bold text-white mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Pagina Non Trovata</h1>
        <p className="text-blue-200 mb-8 max-w-md">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Home className="h-5 w-5" />
            <span>Torna alla Dashboard</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <ArrowLeft className="h-5 w-5" />
            <span>Indietro</span>
          </button>
        </div>
      </div>
    </div>
  )
}
