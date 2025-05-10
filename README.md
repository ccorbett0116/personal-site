# 🌐 Personal Portfolio — Self-Hosted Next.js Deployment

This repository contains the source code for my personal portfolio, built with Next.js and deployed on a self-managed Alpine Linux server. It features a production-grade setup with HTTPS, GitHub webhook-based auto-deployments, and full Cloudflare proxying.

---

## 🧩 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/)
- **Deployment:** [Alpine Linux](https://alpinelinux.org/) + [PM2](https://pm2.keymetrics.io/)
- **Reverse Proxy & TLS:** [NGINX](https://nginx.org/) + [Let’s Encrypt](https://letsencrypt.org/)
- **CI/CD:** GitHub Webhooks + Custom Python listener
- **Security:** Full Cloudflare proxy, firewall-restricted ports, and HMAC validation

---

## 🚀 Deployment Architecture

![Deployment Diagram](https://raw.githubusercontent.com/ccorbett0116/personal-site/main/docs/deployment-diagram.png)

> _Diagram: GitHub triggers a webhook on push → NGINX proxies HTTPS → Python script runs deploy script → PM2 reloads app → served securely through Cloudflare._

---

## 🔄 Auto-Deployment Workflow

1. Push to `main` branch on GitHub
2. GitHub webhook sends signed payload to `/webhook`
3. Python server verifies HMAC + runs `deploy.sh`
4. `npm ci` + `next build` → `pm2 reload` for zero-downtime
5. Served via NGINX + PM2 behind Cloudflare with HTTPS

---

## 🔐 Security Highlights

- ✅ Signed HMAC Webhook
- ✅ Webhook only accessible through HTTPS (not public port 9000)
- ✅ All requests proxied through Cloudflare
- ✅ Only ports 80/443 open
- ✅ IP address hidden from public DNS

---

## 🛠️ Local Development
