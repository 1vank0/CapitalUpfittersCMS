'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  icon: string
  group?: string
}

const NAV: NavItem[] = [
  { href: '/portal', label: 'Dashboard', icon: '◇' },

  { href: '/portal/leads', label: 'Leads', icon: '✉', group: 'Operations' },
  { href: '/portal/quotes', label: 'Quotes', icon: '$' },

  { href: '/portal/pages', label: 'Pages', icon: '▤', group: 'Content' },
  { href: '/portal/services', label: 'Services', icon: '◈' },
  { href: '/portal/locations', label: 'Locations', icon: '⌖' },
  { href: '/portal/gallery', label: 'Gallery', icon: '◰' },
  { href: '/portal/blocks', label: 'Content Blocks', icon: '▦' },
  { href: '/portal/testimonials', label: 'Testimonials', icon: '★' },
  { href: '/portal/faqs', label: 'FAQs', icon: '?' },

  { href: '/portal/seo', label: 'SEO Manager', icon: '↗', group: 'Growth' },
  { href: '/portal/ai-profile', label: 'AI Profile', icon: '✦' },

  { href: '/portal/users', label: 'Users', icon: '◉', group: 'System' },
  { href: '/portal/organizations', label: 'Organizations', icon: '⌂' },
  { href: '/portal/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()

  let lastGroup: string | undefined = undefined

  return (
    <aside className="w-60 bg-[#111827] text-[#f8fafc] flex-shrink-0 flex flex-col">
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/portal" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#203055] flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <span className="portal-display text-lg font-bold tracking-tight">
            Upfit Portal
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((item) => {
          const showGroup = item.group && item.group !== lastGroup
          if (item.group) lastGroup = item.group
          const active =
            pathname === item.href ||
            (item.href !== '/portal' && pathname.startsWith(item.href))
          return (
            <div key={item.href}>
              {showGroup && (
                <div className="px-5 mt-4 mb-1 text-[10px] uppercase tracking-wider text-[#9ca3af] font-semibold">
                  {item.group}
                </div>
              )}
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2 text-sm transition border-l-2 ${
                  active
                    ? 'bg-white/5 border-[#203055] text-white font-medium'
                    : 'border-transparent text-[#cbd5e1] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="w-4 text-center text-base opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            </div>
          )
        })}
      </nav>

      <div className="px-5 py-3 border-t border-white/5 text-[10px] text-[#6b7280]">
        Upfit Portal · v0.1
      </div>
    </aside>
  )
}
