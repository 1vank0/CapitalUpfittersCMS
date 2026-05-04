const output = document.getElementById('output')

async function run(args) {
  const res = await window.botApi.run(args)
  output.textContent = `${res.ok ? 'OK' : 'ERROR'}\n\n${res.stdout || ''}${res.stderr || ''}`
}

document.getElementById('initBtn').addEventListener('click', () => run(['init']))
document.getElementById('listBtn').addEventListener('click', () => run(['listings']))

document.getElementById('addBtn').addEventListener('click', () => {
  run([
    'add-listing',
    '--title', document.getElementById('title').value,
    '--price', document.getElementById('price').value,
    '--description', document.getElementById('description').value,
    '--location', document.getElementById('location').value,
  ])
})

document.getElementById('addFromUrlBtn').addEventListener('click', () => {
  run(['add-from-url', document.getElementById('url').value, '--price', document.getElementById('price').value || '0', '--location', document.getElementById('location').value])
})

document.querySelectorAll('button[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => run([btn.dataset.action, document.getElementById('listingId').value]))
})
