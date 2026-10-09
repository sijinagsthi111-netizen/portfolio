# Sijin Agasthi — 3D Modern Portfolio

A production-quality 3D developer and AI engineer portfolio built with **Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, Lenis**, and **@splinetool/react-spline**. Designed with a high-end monochrome aesthetic, bold typography, glassmorphism cards, and interactive 3D elements.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install --legacy-peer-deps
```

### 2. Run the Development Server
```bash
npm run dev
```
The site will run on `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🎨 Customization Guide

### (a) How to Swap Your Spline Scene URL
1. Open [`src/config.ts`](./src/config.ts).
2. Locate the `SPLINE_SCENE_URL` constant:
```typescript
export const SPLINE_SCENE_URL = "https://prod.spline.design/your-scene-id/scene.splinecode";
```
3. Export any public 3D scene or robot from [Spline Community](https://app.spline.design/community), copy the `.splinecode` export link, and paste it here.
4. If left blank or during loading/mobile viewports, the portfolio automatically displays an interactive cybernetic 3D robot fallback with mouse-cursor tracking.

### (b) How to Edit Portfolio Content
All data is centralized in [`src/data/portfolio.ts`](./src/data/portfolio.ts):
- **Profile information**: Name, role, location, email, phone, social links.
- **Taglines & Bio**: Edit `heroTagline`, `subTagline`, and `about`.
- **Education**: Degree and university details.
- **Skills**: Add or update languages, frameworks, data visualization tools, and engineering domains.
- **Experience**: Add new roles, bullet points, and tech chips.
- **Projects**: Update titles, descriptions, metrics (e.g. `81.5% detection accuracy`), and GitHub/live demo URLs.
- **Certifications**: Add new certificates, issuers, years, and notes.

### (c) How to Replace the Profile Photo
1. Add your photo to the `public/images/` folder (e.g. `public/images/profile-grayscale.jpg`).
2. Open [`src/data/portfolio.ts`](./src/data/portfolio.ts) and ensure `photo` points to your image:
```typescript
photo: "/images/profile-grayscale.jpg"
```
3. In [`src/components/About.tsx`](./src/components/About.tsx), the image will automatically receive the monochrome filter, vignette framing, and parallax zoom.

### (d) How to Deploy to Vercel
1. Push this project to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit of 3D modern portfolio"
git branch -M main
git remote add origin https://github.com/sijinagsthi111-netizen/portfolio.git
git push -u origin main
```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**. Your portfolio will be live with full SSL and global CDN caching.

---

## 🛠 Tech Stack Details
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v3 with custom glassmorphism and monochrome filters
- **Animations**: Framer Motion for section reveals, 3D tilt, and staggered preloader
- **Smooth Scroll**: Lenis (with `prefers-reduced-motion` detection)
- **3D Engine**: `@splinetool/react-spline` with responsive fallback
- **Icons**: Lucide React & React Icons
- **Fonts**: Outfit (headings 700/800) & Inter (body)
