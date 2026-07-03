import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set. Run with: npx tsx --env-file=.env.local scripts/seed.ts')
  process.exit(1)
}

async function connectDB() {
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false })
}

// ── Inline schemas (avoid Next.js module resolution issues) ──────────────────

const UserSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
    address: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: [String],
    quantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
)

ProductSchema.index({ name: 'text', description: 'text' })

const AppConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    value: String,
  },
  { timestamps: true }
)

const LocationSchema = new mongoose.Schema(
  {
    nameAr: { type: String, required: true, trim: true },
    nameFr: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

LocationSchema.index({ nameAr: 'text', nameFr: 'text' })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
const AppConfig = mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema)
const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema)

// ── Seed data ────────────────────────────────────────────────────────────────

const SAMPLE_PRODUCTS = [
  {
    name: 'Organic Honey 500g',
    price: 1200,
    description: 'Pure organic honey harvested from mountain beehives. Rich in antioxidants.',
    images: [],
    quantity: 50,
  },
  {
    name: 'Argan Oil 100ml',
    price: 850,
    description: 'Cold-pressed argan oil for skin and hair care. 100% natural.',
    images: [],
    quantity: 30,
  },
  {
    name: 'Black Seed Oil 250ml',
    price: 650,
    description: 'Premium black seed oil, known for its health benefits.',
    images: [],
    quantity: 45,
  },
  {
    name: 'Rose Water 200ml',
    price: 400,
    description: 'Distilled rose water, perfect for skin toning and cooking.',
    images: [],
    quantity: 8,
  },
  {
    name: 'Dried Figs 1kg',
    price: 900,
    description: 'Sun-dried figs, naturally sweet and packed with fiber.',
    images: [],
    quantity: 25,
  },
  {
    name: 'Chia Seeds 500g',
    price: 550,
    description: 'Organic chia seeds, rich in omega-3 fatty acids.',
    images: [],
    quantity: 60,
  },
  {
    name: 'Almond Butter 350g',
    price: 1100,
    description: 'Natural almond butter with no added sugar or preservatives.',
    images: [],
    quantity: 5,
  },
  {
    name: 'Green Tea 100g',
    price: 350,
    description: 'Premium loose-leaf green tea from certified organic farms.',
    images: [],
    quantity: 40,
  },
]

const APP_CONFIGS = [
  { key: 'delivery_fee', value: '500' },
  { key: 'bank_payment_code', value: 'STORE-001' },
  { key: 'low_stock_threshold', value: '10' },
]

const SAMPLE_LOCATIONS = [
  { nameAr: 'زعطر', nameFr: 'Zaatar', price: 150 },
  { nameAr: 'تفرق زين', nameFr: 'Tefragh Zeina', price: 100 },
  { nameAr: 'الكصر', nameFr: 'Ksar', price: 100 },
  { nameAr: 'جامبور', nameFr: 'Jambour', price: 100 },
  { nameAr: 'صكوك', nameFr: 'Socogim', price: 100 },
  { nameAr: 'عرفات', nameFr: 'Arafat', price: 150 },
  { nameAr: 'تنسويلم', nameFr: 'Teyarett', price: 150 },
  { nameAr: 'الدار نعيم', nameFr: 'Dar Naim', price: 150 },
  { nameAr: 'الدار البركة', nameFr: 'Dar El Beida', price: 150 },
  { nameAr: 'المطار القديم', nameFr: 'Ancien Aéroport', price: 150 },
  { nameAr: 'بوحديد', nameFr: 'Bouhdida', price: 150 },
  { nameAr: 'رابع والعشرين', nameFr: '24ème', price: 150 },
  { nameAr: 'توجنين', nameFr: 'Toujounine', price: 150 },
  { nameAr: 'ترحيل', nameFr: 'Tarhil', price: 150 },
  { nameAr: 'ملح', nameFr: 'Mellah', price: 150 },
  { nameAr: 'كرفور', nameFr: 'Carrefour', price: 150 },
  { nameAr: 'بيكة', nameFr: 'Bika', price: 150 },
  { nameAr: 'التحادية', nameFr: 'Ittihadiya', price: 150 },
  { nameAr: 'عين طلح', nameFr: 'Ain Talh', price: 150 },
  { nameAr: 'صحراوي', nameFr: 'Sahraoui', price: 100 },
  { nameAr: 'البوادي', nameFr: 'Bouadi', price: 100 },
  { nameAr: 'سيتا بلاج', nameFr: 'Cité Plage', price: 100 },
  { nameAr: 'سانتر متير', nameFr: 'Centre Émetteur', price: 100 },
  { nameAr: 'ديار تاتا', nameFr: 'Diar Tata', price: 100 },
  { nameAr: 'كبيتال', nameFr: 'Capitale', price: 100 },
  { nameAr: 'سيزيم', nameFr: 'Sixième', price: 150 },
  { nameAr: 'سينكيم', nameFr: 'Cinquième', price: 150 },
  { nameAr: 'أگجوجت', nameFr: 'Akjoujt', price: 200 },
  { nameAr: 'أزويرات', nameFr: 'Zouerate', price: 250 },
  { nameAr: 'أطار', nameFr: 'Atar', price: 200 },
  { nameAr: 'بنشاب', nameFr: 'Benichab', price: 250 },
  { nameAr: 'العيون', nameFr: 'Aioun', price: 250 },
  { nameAr: 'طينطان', nameFr: 'Tintane', price: 250 },
  { nameAr: 'كرو', nameFr: 'Kiffa', price: 250 },
  { nameAr: 'روصو', nameFr: 'Rosso', price: 200 },
  { nameAr: 'ألاگ', nameFr: 'Aleg', price: 250 },
  { nameAr: 'تجگجة', nameFr: 'Tidjikja', price: 250 },
  { nameAr: 'نعمة', nameFr: 'Néma', price: 250 },
  { nameAr: 'كيفة', nameFr: 'Kiffa', price: 250 },
  { nameAr: 'واد ناقة', nameFr: 'Ouad Naga', price: 250 },
  { nameAr: 'نواذيبو', nameFr: 'Nouadhibou', price: 150 },
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await connectDB()
  console.log('✅  Connected to MongoDB')

  // Clear existing seed data
  await User.deleteMany({ phone: '0000000000' })
  await Product.deleteMany({})
  await AppConfig.deleteMany({})
  await Location.deleteMany({})
  console.log('🗑️   Cleared existing seed data')

  // Admin user
  const hashedPassword = await bcrypt.hash('admin1234', 12)
  const admin = await User.create({
    name: 'Admin',
    phone: '0000000000',
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  })
  console.log(`👤  Admin user created — phone: 0000000000  password: admin1234  id: ${admin._id}`)

  // Products
  const products = await Product.insertMany(SAMPLE_PRODUCTS)
  console.log(`📦  ${products.length} products created`)
  products.forEach(p => console.log(`    • ${p.name} — qty: ${(p as any).quantity}`))

  // App config
  await AppConfig.insertMany(APP_CONFIGS)
  console.log('⚙️   App config seeded (delivery_fee, bank_payment_code, low_stock_threshold)')

  // Delivery locations
  const locations = await Location.insertMany(SAMPLE_LOCATIONS)
  console.log(`📍  ${locations.length} delivery locations created`)

  await mongoose.disconnect()
  console.log('✅  Seed complete. Database disconnected.')
}

seed().catch(err => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
