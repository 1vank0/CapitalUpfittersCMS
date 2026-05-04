#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const dataDir = path.resolve(process.cwd(), '.bot-data')
const profileFile = path.join(dataDir, 'cedar-planter-profile.json')
const leadsFile = path.join(dataDir, 'leads.json')
const tasksFile = path.join(dataDir, 'marketplace-tasks.json')

const DEFAULT_PROFILE = {
  sellerName: 'Rita',
  city: 'Gaithersburg',
  radiusMiles: 30,
  paymentMethods: ['Zelle'],
  deliveryWindow: 'Next-day delivery',
  pickup: 'Local pickup only',
  products: [],
  messageTemplate: 'Set your message template here.',
}

const DEFAULT_TASKS = {
  listings: [],
  automation: {
    enabled: false,
    intervalHours: 24,
    lastRunAt: null,
  },
  facebook: {
    // Save cookie/session state with Playwright to avoid repeated login challenges.
    storageStatePath: '.bot-data/facebook-storage-state.json',
  },
}

async function ensureJson(file, fallback) {
  try { await fs.access(file) } catch { await fs.writeFile(file, JSON.stringify(fallback, null, 2)) }
}
async function loadJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')) }
async function saveJson(file, data) { await fs.writeFile(file, JSON.stringify(data, null, 2)) }

async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true })
  await ensureJson(profileFile, DEFAULT_PROFILE)
  await ensureJson(leadsFile, [])
  await ensureJson(tasksFile, DEFAULT_TASKS)
}

async function scrape(url) {
  const { fetch } = await import('undici')
  const html = await (await fetch(url)).text()
  const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || 'No title').trim()
  const description = (html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 2000)
  ).trim()
  return { title, description }
}

async function addListing(input) {
  const tasks = await loadJson(tasksFile)
  const listing = { id: crypto.randomUUID(), status: 'draft', createdAt: new Date().toISOString(), ...input }
  tasks.listings.push(listing)
  await saveJson(tasksFile, tasks)
  console.log(`Added listing ${listing.id}`)
}

async function updateListing(id, patch) {
  const tasks = await loadJson(tasksFile)
  const idx = tasks.listings.findIndex((l) => l.id === id)
  if (idx < 0) throw new Error('Listing not found')
  tasks.listings[idx] = { ...tasks.listings[idx], ...patch, updatedAt: new Date().toISOString() }
  await saveJson(tasksFile, tasks)
  console.log(`Updated listing ${id}`)
}

async function runMarketplaceAction(action, id) {
  const tasks = await loadJson(tasksFile)
  const listing = tasks.listings.find((l) => l.id === id)
  if (!listing) throw new Error('Listing not found')

  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ storageState: tasks.facebook.storageStatePath })
  const page = await context.newPage()

  // NOTE: selectors can change; update if Facebook UI changes.
  await page.goto('https://www.facebook.com/marketplace/you/selling', { waitUntil: 'domcontentloaded' })

  if (action === 'post') {
    await page.goto('https://www.facebook.com/marketplace/create/item', { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Title').fill(listing.title)
    await page.getByLabel('Price').fill(String(listing.price || ''))
    await page.getByLabel('Description').fill(listing.description || '')
    if (listing.location) await page.getByLabel('Location').fill(listing.location)
    console.log(`Prepared listing post for ${id}. Complete any required category/photo fields manually if prompted.`)
  }

  if (action === 'renew') console.log(`Renew flow for ${id} needs selector mapping to your account UI.`)
  if (action === 'delete') console.log(`Delete flow for ${id} needs selector mapping to your account UI.`)
  if (action === 'mark-sold') console.log(`Mark-sold flow for ${id} needs selector mapping to your account UI.`)

  await context.storageState({ path: tasks.facebook.storageStatePath })
  await browser.close()
}

function usage() {
  console.log(`
Commands:
  init
  scrape <url>
  add-listing --title "..." --price 90 --description "..." [--location "Gaithersburg, MD"] [--link "https://..."]
  add-from-url <url> --price 90 [--location "Gaithersburg, MD"]
  listings
  update-listing <id> [--title ...] [--price ...] [--description ...]
  renew <id>
  delete <id>
  mark-sold <id>
  post <id>
  enable-daily
  run-daily
`)
}

function parseFlags(args) {
  const out = {}
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith('--')) {
      out[args[i].slice(2)] = args[i + 1]
      i += 1
    }
  }
  return out
}

async function main() {
  await ensureDataFiles()
  const [, , cmd, ...args] = process.argv
  if (!cmd) return usage()
  if (cmd === 'init') { console.log(`Initialized ${dataDir}`); return }

  if (cmd === 'scrape') return console.log(JSON.stringify(await scrape(args[0]), null, 2))
  if (cmd === 'add-from-url') {
    const url = args[0]
    const flags = parseFlags(args.slice(1))
    const scraped = await scrape(url)
    return addListing({ ...scraped, link: url, price: Number(flags.price || 0), location: flags.location || 'Gaithersburg, MD' })
  }
  if (cmd === 'add-listing') return addListing(parseFlags(args))
  if (cmd === 'listings') return console.log(JSON.stringify((await loadJson(tasksFile)).listings, null, 2))
  if (cmd === 'update-listing') return updateListing(args[0], parseFlags(args.slice(1)))
  if (cmd === 'renew') return runMarketplaceAction('renew', args[0])
  if (cmd === 'delete') return runMarketplaceAction('delete', args[0])
  if (cmd === 'mark-sold') return runMarketplaceAction('mark-sold', args[0])
  if (cmd === 'post') return runMarketplaceAction('post', args[0])
  if (cmd === 'enable-daily') {
    const tasks = await loadJson(tasksFile)
    tasks.automation.enabled = true
    await saveJson(tasksFile, tasks)
    return console.log('Daily automation enabled. Run this script with a cron job every hour/day.')
  }
  if (cmd === 'run-daily') {
    const tasks = await loadJson(tasksFile)
    if (!tasks.automation.enabled) return console.log('Automation disabled.')
    const now = Date.now()
    const last = tasks.automation.lastRunAt ? new Date(tasks.automation.lastRunAt).getTime() : 0
    if (now - last < tasks.automation.intervalHours * 3600 * 1000) return console.log('Not due yet.')
    const drafts = tasks.listings.filter((l) => l.status === 'draft')
    for (const l of drafts) await runMarketplaceAction('post', l.id)
    tasks.automation.lastRunAt = new Date().toISOString()
    await saveJson(tasksFile, tasks)
    return console.log(`Processed ${drafts.length} listing(s).`)
  }

  usage()
}

main().catch((e) => { console.error(e); process.exit(1) })
