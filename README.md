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

1. Push to main branch on GitHub
2. GitHub webhook sends signed payload to `/webhook` (HTTPS only)
3. Python listener verifies HMAC, triggers `deploy.sh`
4. `deploy.sh`: runs `npm ci`, `next build`, and `pm2 reload`
5. Web app is served via NGINX + PM2 behind Cloudflare with full HTTPS
6. GitHub and Cloudflare IP ranges are auto-updated via cron

---

## 🔐 Security Highlights

- ✅ Signed HMAC Webhook
- ✅ Webhook only accessible through HTTPS (not public port 9000)
- ✅ All requests proxied through Cloudflare
- ✅ Only ports 80/443 open
- ✅ IP address hidden from public DNS
- ✅ Auto-updated allowlists for GitHub webhook IPs (via GitHub API)
- ✅ Auto-updated trusted Cloudflare proxy IPs (via Cloudflare IP list)

---

## 🛠 Maintenance Automation

- GitHub webhook IPs are fetched weekly from the GitHub API and inserted into the `/webhook` NGINX block
- Cloudflare proxy IPs are pulled weekly from Cloudflare and used to update real client IP handling
- Both update scripts run via `cron` and only reload NGINX if changes are detected
- Config updates are atomic and validated before reload to ensure zero downtime

---

## TODO:
- Website updates can briefly cause the website to go down. Fix this.

---

## Personal Note:
- Steps to add subdomain: add unproxied cloudflare domain, ./add-subdomain.sh <subdomain>, proxy cloudflare.
