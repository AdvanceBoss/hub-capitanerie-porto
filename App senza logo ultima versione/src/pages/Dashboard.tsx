import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from 'react-query'
import { supabase } from '@/lib/supabase'
import { 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  MapPin,
  Calendar,
  Euro,
  Shield
} from 'lucide-react'
import { formatDate, formatCurrency, getRoleIcon } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Dashboard() {
  const { user } = useAuth()

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    async () => {
      const { data: verbali } = await supabase
        .from('verbali')
        .select('id, status, created_at, organization_id')
        .eq('organization_id', user?.organization_id)

      const { data: trasgressori } = await supabase
        .from('trasgressori')
        .select('id, created_at')

      const { data: infrazioni } = await supabase
        .from('infrazioni')
        .select('id, tipo')

      return {
        totalVerbali: verbali?.length || 0,
        verbaliConfermati: verbali?.filter(v => v.status === 'confermato').length || 0,
        verbaliBozza: verbali?.filter(v => v.status === 'bozza').length || 0,
        totalTrasgressori: trasgressori?.length || 0,
        infrazioniNazionali: infrazioni?.filter(i => i.tipo === 'nazionale').length || 0,
        infrazioniLocali: infrazioni?.filter(i => i.tipo === 'locale').length || 0,
        verbaliUltimoMese: verbali?.filter(v => 
          new Date(v.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0
      }
    },
    {
      enabled: !!user,
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  )

  // Fetch recent verbali
  const { data: recentVerbali, isLoading: verbaliLoading } = useQuery(
    'recent-verbali',
    async () => {
      const { data } = await supabase
        .from('verbali')
        .select(`
          id,
          numero_verbale,
          anno,
          status,
          data_fatto,
          created_at,
          trasgressore:trasgressori(cognome, nome),
          organization:organizations(nome)
        `)
        .eq('organization_id', user?.organization_id)
        .order('created_at', { ascending: false })
        .limit(5)

      return data
    },
    {
      enabled: !!user
    }
  )

  // Fetch hierarchy info
  const { data: hierarchy, isLoading: hierarchyLoading } = useQuery(
    'hierarchy',
    async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .order('tipo', { ascending: false })

      return data
    },
    {
      enabled: !!user
    }
  )

  if (statsLoading || verbaliLoading || hierarchyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Verbali Totali',
      value: stats?.totalVerbali || 0,
      icon: FileText,
      color: 'bg-blue-500',
      change: `+${stats?.verbaliUltimoMese || 0} questo mese`
    },
    {
      title: 'Verbali Confermati',
      value: stats?.verbaliConfermati || 0,
      icon: Shield,
      color: 'bg-green-500',
      change: `${Math.round(((stats?.verbaliConfermati || 0) / (stats?.totalVerbali || 1)) * 100)}% del totale`
    },
    {
      title: 'Trasgressori',
      value: stats?.totalTrasgressori || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: 'Anagrafica completa'
    },
    {
      title: 'Infrazioni',
      value: (stats?.infrazioniNazionali || 0) + (stats?.infrazioniLocali || 0),
      icon: AlertTriangle,
      color: 'bg-orange-500',
      change: `${stats?.infrazioniNazionali || 0} nazionali, ${stats?.infrazioniLocali || 0} locali`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-ocean-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Benvenuto, {user?.nome} {user?.cognome}
            </h1>
            <p className="text-blue-100 text-lg">
              {getRoleIcon(user?.ruolo || '')} {user?.organization?.nome}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Ultimo accesso: {formatDate(user?.last_login || new Date())}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {stats?.totalVerbali || 0}
            </div>
            <div className="text-blue-200 text-sm">
              Verbali gestiti
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Verbali */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Verbali Recenti
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Vedi tutti
            </button>
          </div>
          <div className="space-y-3">
            {recentVerbali?.map((verbale) => (
              <div key={verbale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {verbale.numero_verbale}/{verbale.anno}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {verbale.trasgressore?.cognome} {verbale.trasgressore?.nome}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    verbale.status === 'confermato' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : verbale.status === 'bozza'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {verbale.status}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(verbale.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hierarchy Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Struttura Gerarchica
            </h2>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {hierarchy?.slice(0, 5).map((org) => (
              <div key={org.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl">
                  {getRoleIcon(org.tipo)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {org.nome}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {org.codice} • {org.indirizzo}
                  </p>
                </div>
                {org.id === user?.organization_id && (
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                    Tuo
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Azioni Rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Nuovo Verbale</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Crea un nuovo processo verbale</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Anagrafica</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gestisci trasgressori</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visualizza statistiche</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
