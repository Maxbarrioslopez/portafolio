import { FC, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Github } from "lucide-react"

// Types
import type { Project } from "../lib/apiClient"

// API
import { getFeaturedProjects } from "../lib/apiClient"
import { trackClick } from "../lib/analytics"

const Home: FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeaturedProjects()
  }, [])

  const loadFeaturedProjects = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await getFeaturedProjects()
      setProjects(data.slice(0, 3))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error loading projects"
      console.error("Error loading featured projects:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceClick = (serviceName: string): void => {
    trackClick("/", "service_cta", serviceName)
  }

  const services: Array<{ title: string; description: string; price: string }> = [
    {
      title: "Landing + Analítica",
      description: "Página profesional con analytics integrado",
      price: "desde $500",
    },
    {
      title: "Web + Dashboard",
      description: "Sitio web + panel de control full-stack",
      price: "desde $2000",
    },
    {
      title: "Sistema a Medida",
      description: "Arquitectura escalable para tus necesidades",
      price: "consultar",
    },
  ]

  const steps: Array<{ number: string; title: string; desc: string }> = [
    { number: "1", title: "Discovery", desc: "Entendemos tu negocio" },
    { number: "2", title: "Build", desc: "Construimos la solución" },
    { number: "3", title: "Deploy", desc: "Lanzamos en producción" },
    { number: "4", title: "Support", desc: "Soporte continuo" },
  ]

  const technologies: string[] = [
    "Django",
    "React",
    "PostgreSQL",
    "Kubernetes",
    "TypeScript",
    "DevOps",
    "AWS",
    "IA/ML",
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Full-Stack Developer</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Especialista en arquitectura de sistemas escalables. Django + React + DevOps.
              Transformo ideas en productos robustos y mantenibles.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/projects"
                onClick={() => trackClick("/", "cta_projects")}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
              >
                Ver Proyectos
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/lab"
                onClick={() => trackClick("/", "cta_lab")}
                className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Explorar Lab
              </Link>
              <Link
                to="/quote"
                onClick={() => trackClick("/", "cta_quote")}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cotizar
              </Link>
            </div>
          </div>

          {/* Trust Bar */}
          <div className="bg-white rounded-lg p-6 mt-12 shadow-sm border border-gray-100">
            <p className="text-center text-sm text-gray-600 mb-4 font-medium">Especialidades</p>
            <div className="flex flex-wrap justify-center gap-4">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Proyectos Destacados</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              Error: {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando proyectos...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron proyectos destacados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  onClick={() => trackClick("/", "featured_project", project.slug)}
                  className="card p-6 group hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.stack.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.stack.length > 3 && (
                      <span className="text-xs text-gray-500">+{project.stack.length - 3}</span>
                    )}
                  </div>
                  <div className="text-purple-600 font-medium flex items-center gap-1">
                    Ver detalles
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/projects"
              onClick={() => trackClick("/", "view_all_projects")}
              className="text-purple-600 font-medium flex items-center gap-2 justify-center hover:text-purple-700 transition-colors"
            >
              Ver todos los proyectos
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.title} className="card p-8 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <p className="text-2xl font-bold text-purple-600 mb-6">{service.price}</p>
                <Link
                  to="/quote"
                  onClick={() => handleServiceClick(service.title)}
                  className="text-purple-600 font-medium hover:text-purple-700 transition-colors flex items-center gap-1"
                >
                  Cotizar
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12">Cómo Trabajo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-4 mx-auto">
                  {step.number}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Necesitas un proyecto?</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/1234567890"
              onClick={() => trackClick("/", "whatsapp_cta")}
              className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:hello@example.com"
              onClick={() => trackClick("/", "email_cta")}
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 font-medium transition-colors"
            >
              Email
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick("/", "github_cta")}
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 font-medium transition-colors"
            >
              <Github className="inline mr-2" size={20} />
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
