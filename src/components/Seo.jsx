import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Lightweight per-route SEO: updates <title>, meta description / keywords,
 * canonical URL and Open Graph tags whenever the route changes.
 *
 * The static <head> in index.html covers the document on first paint / for
 * non-JS crawlers; this keeps it in sync as the SPA navigates.
 */

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://computer-applications.vercel.app'
const SITE_NAME = 'PVKN Govt College (A) Chittoor'
const DEPT_NAME = 'Dept. of Computer Applications'

const FALLBACK = {
  title: `PVKN Govt College (A) Chittoor — ${DEPT_NAME}`,
  description:
    'Official digital campus portal of the Department of Computer Applications, PVKN Govt College (A) Chittoor. Attendance, marks, results, timetable, notices, assignments, placements and fee statements.',
}

/** Path -> title + description. Portals add their name to the brand suffix. */
const ROUTE_META = [
  { prefix: '/admin', name: 'Admin Portal' },
  { prefix: '/hod', name: 'HOD Portal' },
  { prefix: '/faculty', name: 'Faculty Portal' },
  { prefix: '/student', name: 'Student Portal' },
]

function metaFor(pathname) {
  if (pathname === '/login') {
    return {
      title: `Login — PVKN Govt College (A) Chittoor | ${DEPT_NAME}`,
      description: 'Sign in to the official digital portal of the Department of Computer Applications, PVKN Govt College (A) Chittoor.',
    }
  }
  if (pathname === '/signup') {
    return {
      title: `Student / Faculty Sign-up — PVKN Govt College (A) Chittoor`,
      description: 'Create a student or faculty account on the official portal of the Department of Computer Applications, PVKN Govt College (A) Chittoor.',
    }
  }
  if (pathname === '/profile') {
    return { title: `My Profile — ${DEPT_NAME}`, description: null }
  }
  const route = ROUTE_META.find((r) => pathname.startsWith(r.prefix))
  if (route) {
    return {
      title: `${route.name} — PVKN Govt College (A) Chittoor | ${DEPT_NAME}`,
      description: `${route.name} for ${DEPT_NAME}, PVKN Govt College (A) Chittoor.`,
    }
  }
  return { title: null, description: null } // keep defaults
}

function upsertMeta(attr, name, content) {
  const existing = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (existing) existing.setAttribute('content', content)
  else {
    const el = document.createElement('meta')
    el.setAttribute(attr, name)
    el.setAttribute('content', content)
    document.head.appendChild(el)
  }
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

export default function Seo() {
  const { pathname } = useLocation()
  const meta = metaFor(pathname)

  useEffect(() => {
    if (!meta.title) {
      document.title = FALLBACK.title
    } else {
      document.title = meta.title
    }

    const desc = meta.description || FALLBACK.description
    upsertMeta('name', 'description', desc)
    upsertMeta('property', 'og:title', document.title)
    upsertMeta('property', 'og:description', desc)

    const url = `${SITE_URL}${pathname}`
    upsertMeta('property', 'og:url', url)
    setCanonical(url)
  }, [pathname, meta.title, meta.description])

  return null
}