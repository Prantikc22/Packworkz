# Packworkz — VPS / Hostinger Deployment Guide

## Prerequisites

- VPS with Ubuntu 22.04+ (Hostinger VPS or KVM2+)
- At least 1 GB RAM, 20 GB disk
- A domain pointed to your VPS IP (e.g. `packworkz.com`, `app.packworkz.com`)
- SSH access to your VPS

---

## 1. Initial Server Setup

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Update packages
apt update && apt upgrade -y

# Install Node.js 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

---

## 2. Deploy Application Files

### Option A: Git Clone (recommended)

```bash
# Create app directory
mkdir -p /var/www/packworkz
cd /var/www/packworkz

# Clone your repo (use your GitHub/GitLab URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Install dependencies
pnpm install --frozen-lockfile
```

### Option B: Upload via SCP/SFTP

```bash
# From your local machine, upload the project
scp -r ./workspace root@YOUR_VPS_IP:/var/www/packworkz
```

---

## 3. Build the Application

```bash
cd /var/www/packworkz

# Build API server
pnpm --filter @workspace/api-server run build

# Build frontend (Vite)
pnpm --filter @workspace/packwerk run build
# Output goes to artifacts/packwerk/dist/
```

---

## 4. Set Environment Variables

Create `/var/www/packworkz/artifacts/api-server/.env`:

```env
NODE_ENV=production
PORT=8080
ADMIN_KEY=PackOps-Admin@2024!
OPENROUTER_API_KEY=your_openrouter_api_key_here
RESEND_API_KEY=your_resend_api_key_here
RAZORPAY_KEY_ID=rzp_live_XXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
TEAM_WHATSAPP_PHONE=+919999999999
SHEETDB_API_KEY=your_sheetdb_api_id
```

---

## 5. Start API Server with PM2

```bash
cd /var/www/packworkz/artifacts/api-server

# Start with PM2
pm2 start dist/index.mjs --name packworkz-api --node-args="--enable-source-maps"

# Save PM2 process list (auto-restart on reboot)
pm2 save
pm2 startup
# Run the command it outputs (sudo env ...)
```

---

## 6. Configure Nginx

Create `/etc/nginx/sites-available/packworkz`:

```nginx
server {
    listen 80;
    server_name packworkz.com www.packworkz.com;

    # Serve frontend static files
    root /var/www/packworkz/artifacts/packwerk/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/packworkz /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 7. SSL Certificate (HTTPS)

```bash
certbot --nginx -d packworkz.com -d www.packworkz.com
# Follow the prompts — certbot auto-configures Nginx for HTTPS
```

---

## 8. Run SQL Migration

In your Supabase dashboard → SQL Editor, run the contents of `artifacts/api-server/sql_migration.sql`.

---

## 9. Firewall Setup

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 10. Deployment Workflow (Updates)

```bash
cd /var/www/packworkz

# Pull latest changes
git pull origin main

# Rebuild
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/packwerk run build

# Restart API server
pm2 restart packworkz-api
# Nginx auto-serves the new frontend dist
```

---

## Hostinger-Specific Notes

- Choose **KVM2** plan or higher (needs Node.js support)
- In Hostinger control panel → DNS → point A record to your VPS IP
- SSH is available via Hostinger's terminal or standard SSH on port 22
- If using Hostinger's Object Storage for assets, update the Vite build config to use the CDN URL

---

## Supabase Connection

No changes needed — the app already connects to Supabase via HTTPS REST API (supabase-js).
The `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are hardcoded in `artifacts/api-server/src/lib/supabase.ts`.
For production, move these to your `.env` file and update `supabase.ts` to read from `process.env`.

---

## Health Check

```bash
# Check API is running
curl http://localhost:8080/api/health

# Check PM2 status
pm2 status

# View API logs
pm2 logs packworkz-api --lines 50

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| 502 Bad Gateway | API server down — run `pm2 restart packworkz-api` |
| White screen on load | Check `dist/index.html` exists — rebuild frontend |
| API calls fail | Check `/api/` proxy in Nginx config, confirm port 8080 |
| SSL not working | Re-run `certbot --nginx` or check domain DNS propagation |
| PM2 not starting on reboot | Run `pm2 startup` and execute the outputted command |
