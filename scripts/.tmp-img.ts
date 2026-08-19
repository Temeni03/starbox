import mongoose from 'mongoose'
import { Box } from '../src/models/Box'

async function main() {
  await mongoose.connect(process.argv[2]!, { bufferCommands: false })
  const boxes = await Box.find({}).select('name coverImage').lean()
  for (const b of boxes as any[]) {
    const name = b.name?.en ?? b.name?.fr ?? b.name?.ar
    console.log(`${String(name).padEnd(16)} coverImage=${b.coverImage ? b.coverImage : '(none)'}`)
  }
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
