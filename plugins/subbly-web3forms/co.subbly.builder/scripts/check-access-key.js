// Reports whether the Web3Forms access key reached the project, without printing it.
// Usage: node check-access-key.js [--wait]
//   --wait  keep checking for up to 60 seconds while the install value syncs.
// Exit 0: configured. Exit 1: missing. Exit 2: present but not a valid key format.
// Output never contains the key, only variable names (which are public).
const EXPECTED = 'PLUGIN_SUBBLY_WEB3FORMS__WEB3FORMS_ACCESS_KEY'
// The builder prefixes the field with the plugin slug. Accept any slug, so a
// plugin installed under a different slug (for example from a zip upload) still works.
const ANY_PREFIX = /^(NEXT_PUBLIC_)?PLUGIN_[A-Z0-9_]+__WEB3FORMS_ACCESS_KEY$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const WAIT_MS = process.argv.includes('--wait') ? 60_000 : 0
const STEP_MS = 5_000

const fs = require('node:fs')
const path = require('node:path')
const ENV_FILES = ['.env', '.env.local', '.env.development', '.env.development.local', '.env.production']

// A running process never sees later env changes, so also read the project's
// .env files fresh on each check: synced values may land there first.
function readEnv() {
  const env = {}
  for (const file of ENV_FILES) {
    let text
    try {
      text = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
    } catch {
      continue
    }
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m) env[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return { ...env, ...process.env }
}

function find() {
  const env = readEnv()
  const names = [EXPECTED, ...Object.keys(env).filter((n) => n !== EXPECTED && ANY_PREFIX.test(n))]
  for (const name of names) {
    const value = (env[name] ?? '').trim()
    if (value) return { name, value }
  }
  return null
}

async function main() {
  const deadline = Date.now() + WAIT_MS
  let found = find()
  while (!found && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, STEP_MS))
    found = find()
  }

  if (!found) {
    const related = Object.keys(readEnv()).filter((n) => /WEB3FORMS|^PLUGIN_/i.test(n))
    console.log(`missing: no non-empty ${EXPECTED} in the environment`)
    console.log(`related variable names seen: ${related.length ? related.join(', ') : 'none'}`)
    process.exit(1)
  }

  if (!UUID.test(found.value)) {
    console.log(`malformed: ${found.name} is set but is not a Web3Forms access key (expected a UUID)`)
    process.exit(2)
  }

  console.log(`configured: ${found.name}`)
}

main()
