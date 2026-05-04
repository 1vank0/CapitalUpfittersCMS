'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['new', 'contacted', 'quoted', 'scheduled', 'won', 'lost'] as const
const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

export default function LeadStatusForm({
  leadId,
  currentStatus,
  currentPriority,
}: {
  leadId: string
  currentStatus: string
  currentPriority: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus || 'new')
  const [priority, setPriority] = useState(currentPriority || 'normal')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setMsg(null)
    try {
      const update: Record<string, unknown> = { status, priority }
      if (note.trim()) {
        // Append to notes array via Payload's REST API
        const current = await fetch(`/api/leads/${leadId}?depth=0`, {
          credentials: 'include',
        }).then((r) => r.json())
        const existing = Array.isArray(current.notes) ? current.notes : []
        update.notes = [
          ...existing,
          { note: note.trim(), createdAt: new Date().toISOString() },
        ]
      }
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(update),
      })
      if (!res.ok) throw new Error('Save failed')
      setNote('')
      setMsg('Saved')
      router.refresh()
      setTimeout(() => setMsg(null), 1500)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs uppercase tracking-wider text-[#6b7280] font-semibold mb-1.5">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#203055]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-[#6b7280] font-semibold mb-1.5">
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#203055]"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-[#6b7280] font-semibold mb-1.5">
          Add note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Quick follow-up note…"
          className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#203055]"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-[#203055] hover:bg-[#162240] text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {msg && (
        <div className="text-xs text-center text-[#16a34a]">{msg}</div>
      )}
    </div>
  )
}
