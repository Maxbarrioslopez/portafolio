import { useEffect, useState, FC } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../lib/apiClient'
import type { Project } from '../lib/apiClient'
import { trackPageView, trackClick } from '../lib/analytics'

const Projects: FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    trackPageView('/projects')
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data } = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter)

  return (
    <div className="py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-12">Proyectos</h1>

        <div className="flex flex-wrap gap-4 mb-12">
          {['all', 'prod', 'demo'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); trackClick('/projects', 'filter', f) }}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'prod' ? 'Producción' : 'Demo'}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((project: any) => (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                onClick={() => trackClick('/projects', 'project_card', project.slug)}
                className="card p-6 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:text-purple-600 flex-1">
                    {project.title}
                  </h3>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.stack.slice(0, 4).map((tech: string) => (
                    <span key={tech} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.stack.length > 4 && (
                    <span className="text-xs text-gray-500">+{project.stack.length - 4}</span>
                  )}
                </div>
                <div className="text-purple-600 font-medium flex items-center">
                  Ver detalles
                  <ArrowRight size={16} className="ml-2" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects
