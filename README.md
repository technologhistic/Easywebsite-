# easywebsite

> **The Precision Web Code & Asset Extraction Engine**  
> Paste any website link to instantly extract its exact HTML, CSS, JavaScript, and media assets with interactive live preview and one-click Combined Build export.

---

## ✨ Features

- **Exact HTML Harvesting**: Extracts the semantic DOM structure with formatted markup, raw server responses, body-only extracts, or inlined standalone bundles.
- **Complete CSS Cascade Deconstruction**: Crawls external stylesheets and embedded `<style>` blocks, formatting them into individual sheets and a single unified stylesheet.
- **JavaScript Module Extraction**: Identifies and extracts external scripts and inline blocks with ES module recognition.
- **📦 Combined Build Download**: One-click download containing all HTML, CSS, JavaScript, and **downloaded media assets** (images, SVGs, and favicons) with automatically rewritten relative paths for 100% offline browsing.
- **Live Sandboxed Sandbox**: Interactive responsive preview with viewport toggles (Desktop 1440px, Laptop 1024px, Tablet 768px, Mobile 375px) and full-screen tab viewing.
- **Visual Media Gallery**: Discovers and indexes all images, SVGs, and favicons with dimensions, direct URL copying, and individual downloads.
- **Meta & SEO Manifest**: Inspects OpenGraph cards, Twitter cards, viewport configuration, and detected technology stacks (React, Next.js, Tailwind CSS, Bootstrap, WordPress, etc.).
- **Classic Design & Drafting Astrolabe Animation**: Multi-stage progress tracking with elapsed timing and live element counters.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/YOUR_USERNAME/easywebsite.git
cd easywebsite
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 📤 Upload & Push to GitHub

To push this codebase to your own GitHub account:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files
git add .

# 3. Create your initial commit
git commit -m "feat: complete easywebsite code extraction engine with Combined Build"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/easywebsite.git

# 6. Push to GitHub
git push -u origin main
```

---

## ☁️ Deployment

### Deploy to Vercel
This repository includes native Vercel configuration (`vercel.json`) and serverless handlers in `/api`:
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Vercel automatically detects the Vite framework and routes API calls to the serverless `/api/extract` and `/api/proxy` endpoints.
4. Click **Deploy**!

### Deploy to Render / Railway / Cloud Run
The app includes an Express + Vite fullstack server (`server.ts`):
- Build command: `npm run build`
- Start command: `npm start`
- Port: `3000` (or `$PORT` environment variable)

---

## 📁 Project Architecture

```
easywebsite/
├── api/
│   ├── _shared.ts          # Core website extraction engine (Cheerio, fetch, formatters)
│   ├── extract.ts          # Vercel serverless /api/extract handler
│   └── proxy.ts            # Vercel serverless /api/proxy handler
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Classic Top Bar with navigation
│   │   ├── HeroSearch.tsx       # Search bar, curated sample sites, and history
│   │   ├── LoadingAnimation.tsx # Classic drafting astrolabe animation
│   │   ├── CodeViewer.tsx       # Code viewer with line numbers, search, copy & wrap
│   │   ├── LivePreview.tsx      # Sandboxed iframe with responsive viewports
│   │   ├── AssetGallery.tsx     # Extracted images, SVGs, and favicon grid
│   │   ├── MetaInspector.tsx    # SEO, OpenGraph cards, and tech stack inspector
│   │   └── ProjectExport.tsx    # Combined Build & ZIP export controls
│   ├── utils/
│   │   └── zipExport.ts         # JSZip generator for Combined Build (with media)
│   ├── types.ts                 # TypeScript interfaces
│   ├── App.tsx                  # Main workspace controller
│   ├── main.tsx                 # React entrypoint
│   └── index.css                # Tailwind CSS v4 styling
├── server.ts                    # Full-stack Node/Express entrypoint
├── vercel.json                  # Vercel deployment configuration
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript compiler config
```

---

## 📄 License

MIT License. Designed and built with Google AI Studio.
