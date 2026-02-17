import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProject } from '../lib/apiClient'
import { trackPageView, trackClick } from '../lib/analytics'
import { ArrowRight, Github, ExternalLink } from 'lucide-react'

export default function ProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackPageView(`/projects/${slug}`)
    loadProject()
  }, [slug])

  const loadProject = async () => {
    try {
      const { data } = await getProject(slug || '')
      setProject(data)
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center">Cargando...</div>
  if (!project) return <div className="py-20 text-center">Proyecto no encontrado</div>

  return (
    <div className="py-12">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        
        <div className="flex flex-wrap gap-4 mb-8">
          {project.stack.map((tech: string) => (
            <span key={tech} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {tech}
            </span>
          ))}
        </div>

        <p className="text-lg text-gray-600 mb-8">{project.description}</p>

        <div className="prose prose-lg max-w-none mb-12 whitespace-pre-wrap">
          {project.long_description}
        </div>

        <div className="flex flex-wrap gap-4 mb-12">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(`/projects/${slug}`, 'demo')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              Ver Demo
              <ExternalLink size={16} />
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(`/projects/${slug}`, 'repo')}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Github size={16} />
              Repositorio
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-8 rounded-lg">
          <div>
            <p className="text-gray-600 text-sm">ESTADO</p>
            <p className="text-lg font-bold capitalize">{project.status}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">VISTAS</p>
            <p className="text-lg font-bold">{project.views}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">GITHUB STARS</p>
            <p className="text-lg font-bold">{project.github_stars}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
