import mongoose from 'mongoose'

/**
 * Clones one database into another on the same cluster — documents and indexes.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/clone-db.ts                      # starbox -> starbox_dev
 *   npx tsx --env-file=.env.local scripts/clone-db.ts --target my_db       # custom target
 *   npx tsx --env-file=.env.local scripts/clone-db.ts --overwrite          # replace a non-empty target
 *
 * The source is the database in MONGODB_URI and is only ever read from.
 */

const { MongoClient } = mongoose.mongo

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set. Run with: npx tsx --env-file=.env.local scripts/clone-db.ts')
  process.exit(1)
}

const args = process.argv.slice(2)
function argValue(flag: string) {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}
const OVERWRITE = args.includes('--overwrite')
const BATCH_SIZE = 1000

// Source db name lives in the URI path (mongodb+srv://user:pass@host/<db>?opts)
const sourceName = new URL(MONGODB_URI.replace(/^mongodb(\+srv)?:\/\//, 'https://')).pathname
  .slice(1)
  .split('?')[0]

if (!sourceName) {
  console.error('❌  MONGODB_URI has no database in its path — cannot tell what to clone.')
  process.exit(1)
}

const targetName = argValue('--target') ?? process.env.CLONE_TARGET_DB ?? `${sourceName}_dev`

if (targetName === sourceName) {
  console.error(`❌  Target database must differ from the source ("${sourceName}").`)
  process.exit(1)
}

/**
 * Turns a stored index spec back into arguments for createIndex. Text indexes are
 * stored as `{_fts: 'text', _ftsx: 1}` and have to be rebuilt from their weights.
 */
function indexArgs(spec: any): [Record<string, any>, Record<string, any>] {
  const { v, key, name, background, weights, ...rest } = spec
  const isText = key?._fts === 'text'
  const rebuiltKey = isText
    ? Object.fromEntries(Object.keys(weights ?? {}).map((field) => [field, 'text']))
    : key
  const options: Record<string, any> = { name, ...rest }
  if (isText && weights) options.weights = weights
  return [rebuiltKey, options]
}

async function main() {
  const client = new MongoClient(MONGODB_URI!)
  await client.connect()

  const source = client.db(sourceName)
  const target = client.db(targetName)

  console.log(`\n📦  Cloning "${sourceName}" → "${targetName}"\n`)

  const existing = await target.listCollections().toArray()
  const nonEmpty: string[] = []
  for (const col of existing) {
    if ((await target.collection(col.name).estimatedDocumentCount()) > 0) nonEmpty.push(col.name)
  }
  if (nonEmpty.length > 0 && !OVERWRITE) {
    console.error(
      `❌  "${targetName}" already holds data (${nonEmpty.join(', ')}).\n` +
        '    Re-run with --overwrite to drop and replace it.'
    )
    await client.close()
    process.exit(1)
  }
  if (existing.length > 0 && OVERWRITE) {
    for (const col of existing) await target.collection(col.name).drop()
    console.log(`🗑️   Dropped ${existing.length} existing collection(s) in "${targetName}"\n`)
  }

  const collections = (await source.listCollections().toArray())
    .filter((c) => c.type === 'collection' && !c.name.startsWith('system.'))
    .sort((a, b) => a.name.localeCompare(b.name))

  const summary: { name: string; docs: number; indexes: number }[] = []

  for (const { name } of collections) {
    const from = source.collection(name)
    const to = target.collection(name)

    let copied = 0
    let buffer: any[] = []
    const cursor = from.find({})
    for await (const doc of cursor) {
      buffer.push(doc)
      if (buffer.length >= BATCH_SIZE) {
        await to.insertMany(buffer, { ordered: false })
        copied += buffer.length
        buffer = []
      }
    }
    if (buffer.length > 0) {
      await to.insertMany(buffer, { ordered: false })
      copied += buffer.length
    }

    // Indexes go on after the data so the copy itself stays fast.
    const specs = (await from.indexes()).filter((s: any) => s.name !== '_id_')
    for (const spec of specs) {
      const [key, options] = indexArgs(spec)
      await to.createIndex(key, options)
    }

    summary.push({ name, docs: copied, indexes: specs.length + 1 })
    console.log(`   ✔ ${name.padEnd(18)} ${String(copied).padStart(6)} docs   ${specs.length + 1} indexes`)
  }

  // Verify the target matches the source before declaring success.
  console.log('\n🔍  Verifying…')
  let mismatch = false
  for (const { name } of collections) {
    const [a, b] = await Promise.all([
      source.collection(name).countDocuments(),
      target.collection(name).countDocuments(),
    ])
    if (a !== b) {
      mismatch = true
      console.error(`   ✘ ${name}: source ${a} vs target ${b}`)
    }
  }

  const totalDocs = summary.reduce((sum, s) => sum + s.docs, 0)
  if (mismatch) {
    console.error('\n❌  Document counts do not match — clone is incomplete.')
    await client.close()
    process.exit(1)
  }

  console.log(`   ✔ all ${collections.length} collections match (${totalDocs} documents)\n`)
  console.log(`✅  "${targetName}" is ready.\n`)

  await client.close()
}

main().catch(async (err) => {
  console.error('❌  Clone failed:', err)
  process.exit(1)
})
