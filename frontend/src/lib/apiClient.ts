import api from './api'

export interface Project {
  id: number
  title: string
  slug: string
  description: string
  stack: string[]
  status: 'prod' | 'demo' | 'archived'
  featured: boolean
  demo_url?: string
  repo_url?: string
  views: number
}

export interface CaseStudy {
  id: number
  title: string
  slug: string
  description: string
  problem: string
  solution: string
  results: string
  metrics: Record<string, any>
}

export interface Lead {
  first_name: string
  last_name: string
  email: string
  phone?: string
  message: string
  lead_type: 'contact' | 'quote'
}

export interface Event {
  event_type: 'page_view' | 'click' | 'submit' | 'lab_endpoint_call'
  page: string
  data?: Record<string, any>
}

// Projects
export const getProjects = () => api.get<Project[]>('/projects/')
export const getProject = (slug: string) => api.get<Project>(`/projects/${slug}/`)
export const getFeaturedProjects = () => api.get<Project[]>('/projects/featured/')

// Case Studies
export const getCaseStudies = () => api.get<CaseStudy[]>('/case-studies/')
export const getCaseStudy = (slug: string) => api.get<CaseStudy>(`/case-studies/${slug}/`)

// Leads
export const submitContact = (data: Omit<Lead, 'lead_type'>) =>
  api.post('/leads/contact/', { ...data, lead_type: 'contact' })
export const submitQuote = (data: Omit<Lead, 'lead_type'>) =>
  api.post('/leads/quote/', { ...data, lead_type: 'quote' })
export const getRecentLeads = () => api.get('/leads/recent/')

// Events
export const trackEvent = (data: Event) => api.post('/events/', data)

// Stats
export const getPublicStats = () => api.get('/stats/public/')
export const getDashboardStats = () => api.get('/stats/dashboard/')

// Health
export const getHealthStatus = () => api.get('/health/')

// Auth
export const loginAsDemo = () => api.get('/auth/demo/')
