import React, { useEffect } from 'react'
import { trackPageView } from '../lib/analytics'

export default function Lab() {
  const [endpoints, setEndpoints] = React.useState<any[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = React.useState<any>(null)

  useEffect(() => {
    trackPageView('/lab')
  }, [])

  const testEndpoint = async (endpoint: string) => {
    const start = performance.now()
    try {
      const response = await fetch(`/api${endpoint}`)
      const end = performance.now()
      const data = await response.json()
      
      setSelectedEndpoint({
        endpoint,
        status: response.status,
        time: Math.round(end - start),
        data,
      })
    } catch (error) {
      setSelectedEndpoint({
        endpoint,
        error: true,
        message: (error as any).message,
      })
    }
  }

  const apiEndpoints = [
    { method: 'GET', path: '/projects/', desc: 'Listar proyectos' },
    { method: 'GET', path: '/case-studies/', desc: 'Listar case studies' },
    { method: 'GET', path: '/stats/public/', desc: 'Estadísticas públicas' },
    { method: 'GET', path: '/health/', desc: 'Health check' },
  ]

  return (
    <div className="py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-4">API Explorer</h1>
        <p className="text-lg text-gray-600 mb-12">Prueba los endpoints en tiempo real</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endpoints List */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="font-bold mb-4">Endpoints Públicos</h2>
              <div className="space-y-2">
                {apiEndpoints.map((ep, i) => (
                  <button
                    key={i}
                    onClick={() => testEndpoint(ep.path)}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded border-l-2 border-transparent hover:border-purple-600"
                  >
                    <p className="text-xs font-mono text-purple-600 mb-1">{ep.method}</p>
                    <p className="text-sm font-medium">{ep.path}</p>
                    <p className="text-xs text-gray-500">{ep.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <div className="card p-6">
                <h2 className="font-bold mb-4">Respuesta</h2>
                <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
                  {selectedEndpoint.error ? (
                    <pre className="text-red-400">{selectedEndpoint.message}</pre>
                  ) : (
                    <>
                      <div className="mb-4">
                        <span className="text-green-400">Status: {selectedEndpoint.status}</span>
                        <span className="ml-4 text-blue-400">Time: {selectedEndpoint.time}ms</span>
                      </div>
                      <pre>{JSON.stringify(selectedEndpoint.data, null, 2)}</pre>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-gray-600">Selecciona un endpoint para ver la respuesta</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
