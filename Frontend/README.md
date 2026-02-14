## Feild-Tech Frontend

This is the React + Vite frontend for the Feild-Tech platform. It serves the public landing experience, role-based application (Admin, Recruiter, Technician), chat/audio calls, job management, wallet/payments, and settings.

### Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: `react-router-dom`
- **State**: Redux Toolkit + `redux-persist`
- **UI**: Tailwind CSS + custom components
- **Real-time**: `socket.io-client` to the backend gateway

### Environments & URLs

- **Frontend dev**: `http://localhost:5173`
- **Socket gateway**: `http://localhost:8000` (real-time only)
- **HTTP APIs**: Direct calls to microservices on `localhost` ports, configured via:
  - `src/config/services.js`
  - `src/config/environment.js` (`API_ENDPOINTS`)

Authentication is cookie-based; the backend sets an httpOnly `token` cookie and the frontend never stores the JWT in `localStorage`.

### Key Concepts

- **Protected routes**: `src/components/shared/ProtectedRoute.jsx` checks Redux auth state and validates `/me` via the Auth service.
- **API client**: `src/lib/axios.js` – shared Axios instance with `withCredentials: true`; no JWT header injection.
- **Chat & audio calls**: `src/context/ChatContext.jsx`, `src/context/AudioCallContext.jsx`, and `src/components/shared/socket.jsx` (Socket.io).
- **Wallet & payments**: Components under `src/components/wallet/` using Stripe and the Payment/Wallet service.

### Running Locally

1. Install dependencies:

```bash
cd Frontend
npm install
```

2. Start backend microservices (from `Backend/`, e.g. `node start-all.js` or docker-compose, depending on your setup).
3. Start the frontend:

```bash
npm run dev
```

The app should be available at `http://localhost:5173`.

### Testing & Linting

- **Unit tests**: `npm test` (Vitest + Testing Library). Example: `src/components/shared/__tests__/ProtectedRoute.test.jsx`.
- **Linting**: `npm run lint`.

### Architecture Overview

See also the backend service READMEs (e.g. `Backend/services/auth-service/README.md`) and the top-level project documentation for a broader architecture view, including service responsibilities and ports.
