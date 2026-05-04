import { redirect } from 'next/navigation'

export default function RootPage() {
  // The Upfit Portal is the new front door. Legacy /admin remains available.
  redirect('/portal')
}
