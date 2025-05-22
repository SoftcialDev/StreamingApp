
# Admin Web Dashboard

A React + Tailwind application where admins:

- **Log in** via Cognito Hosted UI (Microsoft 365).  
- **See** a grid of live HLS streams from employee cameras.  
- **Open** a Microsoft Teams chat directly for any active publisher.  

### 📁 Structure

apps/web/
├── public/           # static index.html
├── src/
│   ├── pages/        # React Router pages (Login, Dashboard, Download)
│   ├── features/     # Cameras list, Chat launcher
│   ├── services/     # API calls (authService, streamService)
│   ├── components/   # Shared UI (Button, CameraTile)
│   ├── store/        # Zustand auth store
│   └── config/       # Runtime environment config
└── vite.config.ts

### ⚙️ Setup & Run

1. Copy `.env.example` → `.env` with:

   VITE_API_BASE_URL=https://api.yourdomain.com
   VITE_COGNITO_DOMAIN=...
   VITE_COGNITO_CLIENT_ID=...
   VITE_REDIRECT_URI=https://app.yourdomain.com/callback

2. `npm install`
3. `npm run dev` ([http://localhost:3000](http://localhost:3000))
4. `npm run build` → produces static assets in `dist/`.

