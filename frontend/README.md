# Valorant SL Frontend

Modern React-based frontend for the Sri Lanka Valorant Leaderboard.

## 🚀 Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Fast Performance**: Built with Vite for lightning-fast builds  
- **Real-time Data**: Paginated leaderboard with live rank updates
- **Discord Integration**: Seamless OAuth2 authentication
- **User Registration**: Step-by-step PUUID registration flow
- **Responsive Design**: Works perfectly on mobile and desktop

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Development

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
VITE_API_URL=http://localhost:8000
VITE_DISCORD_INVITE=https://discord.gg/your-server-invite
```

## 🚢 Deployment

The app is containerized with Docker. Build with:

```bash
docker build -t valorantsl-frontend .
```