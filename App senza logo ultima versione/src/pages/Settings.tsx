import React from 'react'
import { Settings, User, Bell, Shield, Database, Globe } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
          <p className="text-gray-600 dark:text-gray-400">Configura il tuo account e le preferenze</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profilo Utente</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cognome
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cognome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@guardiacostiera.it"
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Salva Modifiche
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifiche</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ricevi notifiche via email</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notifiche push del browser</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">SMS Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alert critici via SMS</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sicurezza</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              Cambia Password
            </button>
            <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              Attiva 2FA
            </button>
            <button className="w-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200">
              Disconnetti Tutti i Dispositivi
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-6 w-6 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Sincronizzazione Auto</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sincronizza automaticamente i dati</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Backup Locale</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mantieni backup locali</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Scarica Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
