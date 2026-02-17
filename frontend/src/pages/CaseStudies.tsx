import { useEffect, useState, FC } from 'react'
import { getCaseStudies } from '../lib/apiClient'
import type { CaseStudy } from '../lib/apiClient'
import { trackPageView, trackClick } from '../lib/analytics'
import { Link } from 'react-router-dom'

const CaseStudies: FC = () => {
  const [studies, setStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackPageView('/case-studies')
    loadCaseStudies()
  }, [])

  const loadCaseStudies = async () => {
    try {
      const { data } = await getCaseStudies()
      setStudies(data)
    } catch (error) {
      console.error('Error loading case studies:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center">Cargando...</div>

  return (
    <div className="py-12">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-12">Case Studies</h1>

        <div className="space-y-8">
          {studies.map((study: any) => (
            <Link
              key={study.id}
              to={`/case-studies/${study.slug}`}
              onClick={() => trackClick('/case-studies', 'case_study', study.slug)}
              className="card p-8 group"
            >
              <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-600">{study.title}</h2>
              <p className="text-gray-600 mb-6">{study.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Problema</p>
                  <p className="font-medium line-clamp-2">{study.problem}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Solución</p>
                  <p className="font-medium line-clamp-2">{study.solution}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resultados</p>
                  <p className="font-medium line-clamp-2">{study.results}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {study.tech_stack.slice(0, 4).map((tech: string) => (
                  <span key={tech} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="text-purple-600 font-medium flex items-center">
                Leer completo
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CaseStudies
