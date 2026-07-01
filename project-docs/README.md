# Project Documentation

This folder contains all the documentation an AI agent needs to implement the Delivery Management Web Application from zero to production.

## Files in This Folder

| File | Purpose | Read When |
|------|---------|-----------|
| `AGENT.md` | **Master guide** — architecture, stack, folder structure, implementation order, rules | **First. Always.** |
| `PRD.md` | Product Requirements — all features, user flows, business rules | When implementing any feature |
| `DATA_MODELS.md` | MongoDB/Mongoose schemas with exact field types and indexes | When creating models or API routes |
| `API_SPEC.md` | Every API route — method, auth, body, response shape | When building any API route |
| `AUTH.md` | Authentication setup — NextAuth config, middleware, role guards | When setting up auth or protecting routes |
| `TASKS.md` | Implementation checklist — track what's done and what's next | Start of each session to know where you left off |

## How to Use These Docs

1. **Start with `AGENT.md`** — it tells you everything about the project structure, tech stack, and implementation order.

2. **Follow the phases in `TASKS.md`** — implement Phase 1 first, then Phase 2, etc. Do not skip phases.

3. **For every feature**, cross-reference:
   - `PRD.md` → what it should do
   - `API_SPEC.md` → how the API should look
   - `DATA_MODELS.md` → what data it touches
   - `design/<screen-name>/screen.html` → what it should look like

4. **Design files are authoritative** — the HTML file in each `design/` folder is the pixel-perfect reference. Extract exact colors, spacing, and copy from it.

## Design Folder Structure

```
design/
├── auth-login/
│   ├── screen.png    ← Visual reference
│   └── screen.html   ← Authoritative design source
├── auth-register/
├── customer-home/
├── customer-product/
├── customer-cart/
├── customer-checkout/
├── customer-orders/
├── customer-order-detail/
├── customer-profile/
├── admin-dashboard/
├── admin-products/
├── admin-inventory/
├── admin-orders/
├── admin-order-detail/
├── admin-delivery-personnel/
├── delivery-dashboard/
├── delivery-detail/
└── delivery-profile/
```
