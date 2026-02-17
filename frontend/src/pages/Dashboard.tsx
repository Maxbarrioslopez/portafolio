import React, { useEffect, useState } from 'react'
import { getDashboardStats, getRecentLeads } from '../lib/apiClient'
import { trackPageView } from '../lib/analytics'
import { isAuthenticated } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/demo/login')
      return
    }
    
    trackPageView('/dashboard')
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center">Cargando dashboard...</div>

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Demo</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Visitas Hoy</p>
            <p className="text-3xl font-bold">{stats?.total_views_today || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Visitas 7 Días</p>
            <p className="text-3xl font-bold">{stats?.total_views_7d || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Clicks Hoy</p>
            <p className="text-3xl font-bold">{stats?.total_clicks_today || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Total de Leads</p>
            <p className="text-3xl font-bold">{stats?.total_leads || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Projects */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-xl font-bold mb-4">Proyectos Más Visitados</h2>
            <div className="space-y-4">
              {stats?.top_projects?.map((proj: any, i: number) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b">
                  <p className="font-medium">{proj.title}</p>
                  <p className="text-gray-600">{proj.views} vistas</p>
                </div>
              )) || <p>No data</p>}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Leads Recientes</h2>
            <div className="space-y-3">
              {stats?.recent_leads?.map((lead: any, i: number) => (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium text-sm">{lead.first_name}</p>
                  <p className="text-xs text-gray-500">{lead.lead_type}</p>
                </div>
              )) || <p className="text-gray-600 text-sm">No data</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
