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

const LocalizedTextSchema = new mongoose.Schema(
  { ar: String, fr: String, en: String },
  { _id: false }
)

const ProductSchema = new mongoose.Schema(
  {
    name: { type: LocalizedTextSchema, required: true },
    price: { type: Number, required: true },
    description: LocalizedTextSchema,
    images: [String],
    quantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
)

ProductSchema.index({
  'name.ar': 'text',
  'name.fr': 'text',
  'name.en': 'text',
  'description.ar': 'text',
  'description.fr': 'text',
  'description.en': 'text',
})

const AppConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    value: String,
  },
  { timestamps: true }
)

const LocationSchema = new mongoose.Schema(
  {
    name: { type: LocalizedTextSchema, required: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

LocationSchema.index({ 'name.ar': 'text', 'name.fr': 'text', 'name.en': 'text' })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
const AppConfig = mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema)
const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema)

// ── Seed data ────────────────────────────────────────────────────────────────

const SAMPLE_PRODUCTS = [
  {
    name: { en: 'Organic Honey 500g' },
    price: 1200,
    description: { en: 'Pure organic honey harvested from mountain beehives. Rich in antioxidants.' },
    images: [],
    quantity: 50,
  },
  {
    name: { en: 'Argan Oil 100ml' },
    price: 850,
    description: { en: 'Cold-pressed argan oil for skin and hair care. 100% natural.' },
    images: [],
    quantity: 30,
  },
  {
    name: { en: 'Black Seed Oil 250ml' },
    price: 650,
    description: { en: 'Premium black seed oil, known for its health benefits.' },
    images: [],
    quantity: 45,
  },
  {
    name: { en: 'Rose Water 200ml' },
    price: 400,
    description: { en: 'Distilled rose water, perfect for skin toning and cooking.' },
    images: [],
    quantity: 8,
  },
  {
    name: { en: 'Dried Figs 1kg' },
    price: 900,
    description: { en: 'Sun-dried figs, naturally sweet and packed with fiber.' },
    images: [],
    quantity: 25,
  },
  {
    name: { en: 'Chia Seeds 500g' },
    price: 550,
    description: { en: 'Organic chia seeds, rich in omega-3 fatty acids.' },
    images: [],
    quantity: 60,
  },
  {
    name: { en: 'Almond Butter 350g' },
    price: 1100,
    description: { en: 'Natural almond butter with no added sugar or preservatives.' },
    images: [],
    quantity: 5,
  },
  {
    name: { en: 'Green Tea 100g' },
    price: 350,
    description: { en: 'Premium loose-leaf green tea from certified organic farms.' },
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
  { name: { ar: 'زعطر', fr: 'Zaatar' }, price: 150 },
  { name: { ar: 'تفرق زين', fr: 'Tefragh Zeina' }, price: 100 },
  { name: { ar: 'الكصر', fr: 'Ksar' }, price: 100 },
  { name: { ar: 'جامبور', fr: 'Jambour' }, price: 100 },
  { name: { ar: 'صكوك', fr: 'Socogim' }, price: 100 },
  { name: { ar: 'عرفات', fr: 'Arafat' }, price: 150 },
  { name: { ar: 'تنسويلم', fr: 'Teyarett' }, price: 150 },
  { name: { ar: 'الدار نعيم', fr: 'Dar Naim' }, price: 150 },
  { name: { ar: 'الدار البركة', fr: 'Dar El Beida' }, price: 150 },
  { name: { ar: 'المطار القديم', fr: 'Ancien Aéroport' }, price: 150 },
  { name: { ar: 'بوحديد', fr: 'Bouhdida' }, price: 150 },
  { name: { ar: 'رابع والعشرين', fr: '24ème' }, price: 150 },
  { name: { ar: 'توجنين', fr: 'Toujounine' }, price: 150 },
  { name: { ar: 'ترحيل', fr: 'Tarhil' }, price: 150 },
  { name: { ar: 'ملح', fr: 'Mellah' }, price: 150 },
  { name: { ar: 'كرفور', fr: 'Carrefour' }, price: 150 },
  { name: { ar: 'بيكة', fr: 'Bika' }, price: 150 },
  { name: { ar: 'التحادية', fr: 'Ittihadiya' }, price: 150 },
  { name: { ar: 'عين طلح', fr: 'Ain Talh' }, price: 150 },
  { name: { ar: 'صحراوي', fr: 'Sahraoui' }, price: 100 },
  { name: { ar: 'البوادي', fr: 'Bouadi' }, price: 100 },
  { name: { ar: 'سيتا بلاج', fr: 'Cité Plage' }, price: 100 },
  { name: { ar: 'سانتر متير', fr: 'Centre Émetteur' }, price: 100 },
  { name: { ar: 'ديار تاتا', fr: 'Diar Tata' }, price: 100 },
  { name: { ar: 'كبيتال', fr: 'Capitale' }, price: 100 },
  { name: { ar: 'سيزيم', fr: 'Sixième' }, price: 150 },
  { name: { ar: 'سينكيم', fr: 'Cinquième' }, price: 150 },
  { name: { ar: 'أگجوجت', fr: 'Akjoujt' }, price: 200 },
  { name: { ar: 'أزويرات', fr: 'Zouerate' }, price: 250 },
  { name: { ar: 'أطار', fr: 'Atar' }, price: 200 },
  { name: { ar: 'بنشاب', fr: 'Benichab' }, price: 250 },
  { name: { ar: 'العيون', fr: 'Aioun' }, price: 250 },
  { name: { ar: 'طينطان', fr: 'Tintane' }, price: 250 },
  { name: { ar: 'كرو', fr: 'Kiffa' }, price: 250 },
  { name: { ar: 'روصو', fr: 'Rosso' }, price: 200 },
  { name: { ar: 'ألاگ', fr: 'Aleg' }, price: 250 },
  { name: { ar: 'تجگجة', fr: 'Tidjikja' }, price: 250 },
  { name: { ar: 'نعمة', fr: 'Néma' }, price: 250 },
  { name: { ar: 'كيفة', fr: 'Kiffa' }, price: 250 },
  { name: { ar: 'واد ناقة', fr: 'Ouad Naga' }, price: 250 },
  { name: { ar: 'نواذيبو', fr: 'Nouadhibou' }, price: 150 },
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
  products.forEach(p => console.log(`    • ${(p as any).name.en} — qty: ${(p as any).quantity}`))

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
