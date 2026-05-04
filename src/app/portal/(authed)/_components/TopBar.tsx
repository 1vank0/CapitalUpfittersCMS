'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  userName?: string
  userEmail: string
  userRole?: string
  orgName?: string
}

export default function TopBar({ userName, userEmail, userRole, orgName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.replace('/portal/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-[#e5e7eb] bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="text-sm text-[#6b7280]">Organization</div>
        <div className="px-3 py-1.5 bg-[#f3f4f6] rounded-md text-sm font-medium text-[#111827]">
          {orgName || 'Capital Upfitters'}
        </div>
      </div>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-[#f3f4f6] transition"
        >
          <div className="w-8 h-8 rounded-full bg-[#203055] text-white text-xs font-bold flex items-center justify-center">
            {(userName || userEmail).charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium leading-tight">{userName || userEmail}</div>
            <div className="text-[11px] text-[#6b7280] capitalize leading-tight">
              {userRole?.replace('-', ' ') || 'Editor'}
            </div>
          </div>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#e5e7eb] rounded-lg shadow-lg overflow-hidden z-30">
            <div className="px-4 py-3 border-b border-[#e5e7eb]">
              <div className="text-sm font-medium">{userName || userEmail}</div>
              <div className="text-xs text-[#6b7280]">{userEmail}</div>
            </div>
            <a
              href="/admin"
              className="block px-4 py-2 text-sm hover:bg-[#f3f4f6]"
            >
              Open legacy admin
            </a>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[#f3f4f6] text-[#ef4444]"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
