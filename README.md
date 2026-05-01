# PingWatch

Uptime monitoring service. Add URLs, get alerted when they go down.

**Live → [pingwatch-olive.vercel.app](https://pingwatch-olive.vercel.app)**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind |
| Backend | Node.js + Express |
| Worker | Node.js cron (background pinger) |
| Database | MongoDB Atlas |
| Auth | Google OAuth 2.0 + JWT |

## Architecture

```
Frontend (Vercel)
    ↓ REST API + JWT
Backend (Render)  ←──── MongoDB Atlas
    ↓ startWorker()
Worker (same process)
    ↓ pings every interval
External URLs
```

Three decoupled services — frontend, REST API, and a background worker that runs on a cron schedule. Worker uses MongoDB Change Streams to detect new monitors and ping them immediately.

## Features

- Google OAuth authentication
- Add up to 10 URLs with custom check intervals (1/5/10/30 min)
- Per-monitor uptime %, avg response time, sparkline history
- Self-healing keepAlive — prevents Render cold starts
- TTL index auto-deletes logs older than 7 days