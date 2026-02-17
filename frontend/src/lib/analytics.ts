import { trackEvent } from './apiClient'

let sessionId = localStorage.getItem('session_id')
if (!sessionId) {
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('session_id', sessionId)
}

export const trackPageView = (page: string) => {
  trackEvent({
    event_type: 'page_view',
    page,
    data: {
      title: document.title,
      referrer: document.referrer,
    },
  }).catch(console.error)
}

export const trackClick = (page: string, link: string, label?: string) => {
  trackEvent({
    event_type: 'click',
    page,
    data: {
      link,
      label,
    },
  }).catch(console.error)
}

export const trackFormSubmit = (page: string, formType: string) => {
  trackEvent({
    event_type: 'submit',
    page,
    data: {
      form_type: formType,
    },
  }).catch(console.error)
}

export const trackLabCall = (endpoint: string, status: number, responseTime: number) => {
  trackEvent({
    event_type: 'lab_endpoint_call',
    page: '/lab',
    data: {
      endpoint,
      status,
      response_time_ms: responseTime,
    },
  }).catch(console.error)
}
