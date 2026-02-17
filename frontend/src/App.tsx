import { FC } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

// Pages
import Home from "./pages/Home"
import Projects from "./pages/Projects"
import ProjectDetail from "./pages/ProjectDetail"
import CaseStudies from "./pages/CaseStudies"
import CaseStudyDetail from "./pages/CaseStudyDetail"
import Services from "./pages/Services"
import Quote from "./pages/Quote"
import Lab from "./pages/Lab"
import DemoLogin from "./pages/DemoLogin"
import Dashboard from "./pages/Dashboard"
import Contact from "./pages/Contact"
import NotFound from "./pages/NotFound"

// Components
import Navigation from "./components/Navigation"
import Footer from "./components/Footer"

// Utils
import { trackPageView } from "./lib/analytics"

/**
 * PageTracker: useEffect hook that tracks page views when route changes
 * ✅ Uses useLocation from React Router (better than popstate event)
 * ✅ Tracks both Link clicks and direct URL navigation
 */
function PageTracker(): null {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return null
}

const App: FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Page tracking */}
        <PageTracker />

        {/* Navigation */}
        <Navigation />

        {/* Main content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/demo/login" element={<DemoLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/404" element={<NotFound />} />
            {/* Catch-all: redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  )
}

export default App
