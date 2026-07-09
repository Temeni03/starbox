import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set. Run with: npx tsx --env-file=.env.local scripts/migrate-i18n-content.ts')
  process.exit(1)
}

async function main() {
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false })
  const db = mongoose.connection.db!

  const products = db.collection('products')
  const productDocs = await products.find({ name: { $type: 'string' } }).toArray()
  for (const doc of productDocs) {
    const set: Record<string, unknown> = { name: { en: doc.name } }
    if (typeof doc.description === 'string' && doc.description) {
      set.description = { en: doc.description }
    }
    if (typeof doc.usageInstructions === 'string' && doc.usageInstructions) {
      set.usageInstructions = { en: doc.usageInstructions }
    }
    await products.updateOne({ _id: doc._id }, { $set: set })
  }
  console.log(`✅  Migrated ${productDocs.length} products`)

  const locations = db.collection('locations')
  const locationDocs = await locations.find({ nameFr: { $exists: true } }).toArray()
  for (const doc of locationDocs) {
    await locations.updateOne(
      { _id: doc._id },
      {
        $set: { name: { ar: doc.nameAr, fr: doc.nameFr } },
        $unset: { nameAr: '', nameFr: '' },
      }
    )
  }
  console.log(`✅  Migrated ${locationDocs.length} locations`)

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
