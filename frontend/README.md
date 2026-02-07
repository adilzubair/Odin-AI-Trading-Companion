# 🎨 Odin AI Trading Companion - Frontend

Modern, responsive Next.js frontend for AI-powered trading analysis and portfolio management. Built with React 19, TypeScript, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript) ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

---

## Features

### Dashboard Tabs

**📊 Analysis Tab**: Watchlist management, historical analysis, AI agent decisions, risk assessment

**🤖 Auto Trade Tab**: Live positions, trading signals, trade execution, autonomous controls

**💼 Portfolio Tab**: Equity curve, performance charts, asset allocation, trade history

### UI/UX
- Modern glassmorphism design with dark theme
- Smooth Framer Motion animations
- Real-time updates every 5 seconds
- Interactive Recharts visualizations
- Responsive design (desktop, tablet, mobile)

---

## Tech Stack

**Core**: Next.js 16, React 19, TypeScript 5

**Styling**: Tailwind CSS 4, Framer Motion, Lucide React

**State & Data**: Zustand, Axios, Recharts, date-fns

**Development**: MSW (API mocking), ESLint

---

## Quick Start

### Prerequisites
- Node.js 18+, npm 9+
- Backend API on `http://localhost:8000` (optional if using mock mode)

### Installation

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run dev
```

Open http://localhost:3000

---

## Configuration

### Environment Variables (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_KEY=dev_secret_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TRADING=false
NEXT_PUBLIC_ENABLE_MOCKING=false  # true for dev without backend

# Polling Intervals (ms)
NEXT_PUBLIC_POLL_INTERVAL_ACTIVE=5000
NEXT_PUBLIC_POLL_INTERVAL_IDLE=30000
```

### Modes

**Mock Mode** (`ENABLE_MOCKING=true`): Uses MSW for fake data, no backend required

**Production Mode** (`ENABLE_MOCKING=false`): Connects to real backend API

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── tabs/              # AnalysisTab, AutoTradeTab, PortfolioTab
│   │   ├── analysis/          # Analysis features
│   │   ├── trader/            # Trading features
│   │   └── ui/                # Reusable components
│   ├── store/                 # Zustand stores
│   ├── services/api/          # API endpoints
│   ├── mocks/                 # MSW mock data
│   ├── types/                 # TypeScript types
│   └── lib/                   # Utilities
└── public/
```

---

## Development

### Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

### Adding Features
1. Create component in `src/components/`
2. Add types in `src/types/`
3. Update store in `src/store/`
4. Add mock data in `src/mocks/data/`
5. Update MSW handlers in `src/mocks/handlers.ts`

---

## API Integration

### Expected Backend Endpoints

**Market**: `GET /market/quote/{symbol}`, `GET /market/history/{symbol}`

**Portfolio**: `GET /portfolio/history`, `GET /positions`

**Watchlist**: `GET /monitor/list`, `POST /monitor/add`, `DELETE /monitor/remove`

**Analysis**: `GET /analysis/history/{ticker}`

**Trading**: `POST /trades/execute`, `GET /trades/history`

**Autonomous**: `GET /autonomous/status`, `POST /autonomous/config`

### CORS Setup (Backend)
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Other Platforms
Netlify, AWS Amplify, Railway, Render, DigitalOcean

### Production Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-api.com/api/v1
NEXT_PUBLIC_API_KEY=<secure-key>
NEXT_PUBLIC_ENABLE_MOCKING=false
NEXT_PUBLIC_ENABLE_REAL_TRADING=false
```

---

## Troubleshooting

**"Failed to fetch" errors**: Check backend is running, verify `NEXT_PUBLIC_API_URL`, check CORS

**Mock data not working**: Set `ENABLE_MOCKING=true`, clear cache, restart server

**TypeScript errors**: Run `npm install`, check `tsconfig.json`, restart TS server

**Styles not applying**: Check `tailwind.config.ts`, restart dev server

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

**Build by Odin AI Team**

**Happy Trading!** 📈
