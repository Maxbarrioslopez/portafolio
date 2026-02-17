import { Link } from 'react-router-dom'
import { Github, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold gradient-text">
            Portfolio
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-8">
            <Link to="/projects" className="hover:text-purple-600">Proyectos</Link>
            <Link to="/case-studies" className="hover:text-purple-600">Case Studies</Link>
            <Link to="/services" className="hover:text-purple-600">Servicios</Link>
            <Link to="/lab" className="hover:text-purple-600">Lab</Link>
            <Link to="/contact" className="hover:text-purple-600">Contacto</Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/projects" className="block py-2 hover:text-purple-600">Proyectos</Link>
            <Link to="/case-studies" className="block py-2 hover:text-purple-600">Case Studies</Link>
            <Link to="/services" className="block py-2 hover:text-purple-600">Servicios</Link>
            <Link to="/lab" className="block py-2 hover:text-purple-600">Lab</Link>
            <Link to="/contact" className="block py-2 hover:text-purple-600">Contacto</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
