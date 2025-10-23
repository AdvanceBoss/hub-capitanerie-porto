import React from 'react'
import { FileText, Download, Upload } from 'lucide-react'

export default function GeneratoreVerbali() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generatore Verbali</h1>
          <p className="text-gray-600 dark:text-gray-400">Il software originale per la generazione di verbali</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
            <Upload className="h-5 w-5" />
            <span>Carica Database</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Download className="h-5 w-5" />
            <span>Scarica Verbale</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Generatore Verbali Integrato
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Il software originale per la generazione di processi verbali è stato integrato 
            in questo HUB. Tutti i verbali generati verranno automaticamente salvati nel 
            database nazionale per la condivisione e l'analisi.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Apri Generatore
            </button>
            <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              Documentazione
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Verbali HTML</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Genera verbali in formato HTML per visualizzazione immediata
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documenti Word</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Esporta verbali in formato .docx con logo incorporato
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Database Offline</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Carica database Excel per uso offline e sincronizzazione
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
