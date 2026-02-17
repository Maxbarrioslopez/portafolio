import { Link } from 'react-router-dom'
import { Github, Mail, Linkedin, Twitter } from 'lucide-react'
import { trackClick } from '../lib/analytics'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Portfolio</h3>
            <p className="text-gray-400">Full-Stack Developer • Especialista en arquitectura escalable</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/projects" className="hover:text-white">Proyectos</Link></li>
              <li><Link to="/case-studies" className="hover:text-white">Case Studies</Link></li>
              <li><Link to="/services" className="hover:text-white">Servicios</Link></li>
              <li><Link to="/lab" className="hover:text-white">Lab</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#privacy" className="hover:text-white">Privacidad</a></li>
              <li><a href="#terms" className="hover:text-white">Términos</a></li>
              <li><a href="#cookies" className="hover:text-white">Cookies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Sígueme</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('/footer', 'github')}
                className="hover:text-purple-400"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('/footer', 'twitter')}
                className="hover:text-purple-400"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('/footer', 'linkedin')}
                className="hover:text-purple-400"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:hello@example.com"
                onClick={() => trackClick('/footer', 'email')}
                className="hover:text-purple-400"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400">
            © 2024 Portfolio. Construido con Django, React y ❤️
          </p>
        </div>
      </div>
    </footer>
  )
}
