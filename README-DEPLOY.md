# Kirwin Bodywork Seminars — Hostinger VPS Deployment Guide

This guide takes you from a fresh Hostinger VPS to a live site served over HTTPS
by Caddy, with the Next.js app running under PM2.

> Replace every `kirwinbodyworks.com` and `<VPS_IP>` placeholder with your real
> values before running the commands below.

---

## Hosting-plan compatibility

Hostinger **Business Web Hosting** and the **AI Website Builder** plans are
**not** suitable for this site. They only run PHP / static files and do not
provide a persistent Node.js process, so a Next.js app (which needs
`npm run start` or an equivalent long-running Node server) cannot be hosted
there.

To deploy this Next.js app you need one of:

- **Hostinger VPS** (KVM 1 or larger) — the steps below assume this. You get
  full root access, can install Node.js 20, PM2, and Caddy, and can keep the
  app running 24/7.
- **Any Node-compatible host** that supports a long-running Node process,
  e.g. Vercel, Render, Railway, Fly.io, or a non-Hostinger VPS. The Caddy
  config and systemd unit in this repo are still useful, but you will not
  need them on a managed platform like Vercel.

If you are currently on Business Web Hosting / AI Builder and want to stay on
Hostinger, upgrade to a **VPS** plan in hPanel before following the rest of
this guide.

---

## 1. Server prerequisites

- **Hostinger VPS** running **Ubuntu 22.04 LTS** (or 24.04).
- A non-root sudo user (Hostinger sets this up by default).
- A domain pointed at Hostinger's nameservers so DNS is editable in hPanel.

Tested on Hostinger KVM 1 / KVM 2 plans. The 1 GB RAM plan works for the
default SQLite setup; switch to managed MySQL/Postgres if you need more.

---

## 2. Install Caddy, PM2, and Node

SSH into the VPS:

```bash
ssh your_user@<VPS_IP>
```

Update the package index and install the basics:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
```

### Node.js 20 (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # should print v20.x or newer
npm -v
```

### PM2 (process manager)

```bash
sudo npm install -g pm2
pm2 -v
```

### Caddy (web server / reverse proxy / automatic HTTPS)

Caddy's official APT repo:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/deb.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
caddy version
```

Open the firewall for HTTP, HTTPS, and SSH:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 3. Upload the code

Pick **one** of the following.

### Option A — Git clone (recommended)

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
git clone https://github.com/<your-org>/<your-repo>.git /var/www/kirwin
cd /var/www/kirwin
```

### Option B — Upload via SCP from your local machine

Run this from your laptop (not the VPS):

```bash
rsync -avz --exclude node_modules --exclude .next \
  ./ your_user@<VPS_IP>:/var/www/kirwin/
```

Make sure `/var/www/kirwin` is owned by your deploy user:

```bash
sudo chown -R $USER:$USER /var/www/kirwin
```

---

## 4. Create the production environment file

```bash
cd /var/www/kirwin
cp .env.production.example .env.production
chmod 600 .env.production
$EDITOR .env.production   # fill in real values
```

At minimum, set:

- `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to `https://kirwinbodyworks.com`
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` for the first admin
- `DATABASE_URL` (default SQLite path works out of the box)

Optionally symlink so tooling that reads `.env` (Prisma, etc.) finds it:

```bash
ln -sf .env.production .env
```

---

## 5. Database

The default setup uses SQLite. Run migrations and seed the first admin user:

```bash
cd /var/www/kirwin
npx prisma migrate deploy
npx prisma db seed
```

> If `prisma db seed` complains about missing scripts, make sure
> `prisma.seed` in `package.json` exists and that `tsx` is installed
> (`npm i -D tsx`). It is included by default in this repo.

---

## 6. Build

```bash
cd /var/www/kirwin
npm install            # or `npm ci` for reproducible installs
npm run build
```

`npm run build` produces the optimized `.next/` directory that
`npm run start` will serve.

---

## 7. Start with PM2

```bash
cd /var/www/kirwin
mkdir -p /var/log/pm2

# Start the app using the ecosystem file.
pm2 start ecosystem.config.js

# Inspect.
pm2 status
pm2 logs kirwin --lines 50

# Persist across reboots.
pm2 save
pm2 startup    # pm2 prints a `sudo env PATH=...` command — run it once
```

After running the `pm2 startup` command it prints, the `kirwin` app will
auto-start on every boot.

**Alternative: systemd** — if you'd rather skip PM2, install the unit file:

```bash
sudo useradd --system --create-home --shell /bin/bash kirwin || true
sudo chown -R kirwin:kirwin /var/www/kirwin
sudo mkdir -p /var/log/kirwin
sudo chown kirwin:kirwin /var/log/kirwin
sudo cp deployment/kirwin.service /etc/systemd/system/kirwin.service
sudo systemctl daemon-reload
sudo systemctl enable --now kirwin
sudo systemctl status kirwin
```

---

## 8. Configure Caddy

Edit the placeholder domain in `deployment/Caddyfile`:

```bash
cd /var/www/kirwin
sed -i 's/kirwinbodyworks.com/yourdomain.com/g' deployment/Caddyfile
grep yourdomain.com deployment/Caddyfile   # sanity check
```

Install the Caddyfile and reload:

```bash
sudo cp deployment/Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy will automatically request and renew a Let's Encrypt certificate the
first time it serves a request to your domain. Watch the logs:

```bash
sudo journalctl -u caddy -f
```

---

## 9. Hostinger DNS records

In **hPanel → Domains → kirwinbodyworks.com → DNS / DNS Records**, make sure
the following records exist (delete any conflicting defaults first):

| Type  | Name | Value              | TTL |
| ----- | ---- | ------------------ | --- |
| `A`   | `@`  | `<VPS_IP>`         | 300  |
| `CNAME` | `www` | `kirwinbodyworks.com` | 300  |

If your registrar is not Hostinger, add the same records there and point the
domain's nameservers to Hostinger's (`ns1.dns-parking.com`, `ns2.dns-parking.com`,
or whatever hPanel shows you).

Verify DNS has propagated before moving on:

```bash
dig +short kirwinbodyworks.com
dig +short www.kirwinbodyworks.com
```

Both should resolve to `<VPS_IP>`.

Once DNS resolves, visit `https://yourdomain.com` — Caddy will issue the
certificate on first request.

---

## 10. Updating the site later

After making changes locally, push them to git and SSH into the VPS:

```bash
git push origin main
ssh your_user@<VPS_IP>
sudo bash /var/www/kirwin/scripts/deploy.sh
```

The script is idempotent and will:

1. `git pull` the latest code.
2. `npm install` (production deps only).
3. `npx prisma generate` + `npx prisma migrate deploy`.
4. `npm run build`.
5. Reload (or start) the PM2 app, or fall back to systemd.

PM2 supports zero-downtime reloads:

```bash
pm2 reload kirwin
```

---

## 11. Troubleshooting

### App won't start

```bash
pm2 logs kirwin --lines 200
# or, with systemd:
sudo journalctl -u kirwin -n 200 --no-pager
```

Common causes:

- `.env.production` is missing a required variable.
- `NEXTAUTH_SECRET` still has the placeholder value.
- Database file path in `DATABASE_URL` is not writable by the deploy user
  (`chown -R $USER:$USER /var/www/kirwin/prisma` for SQLite).

### HTTPS certificate not issued

```bash
sudo journalctl -u caddy -n 200 --no-pager
sudo caddy validate --config /etc/caddy/Caddyfile
```

- Confirm port 80 is open: `sudo ufw status`.
- Confirm DNS resolves to the VPS: `dig +short yourdomain.com`.
- Make sure no other service (Apache, Nginx) is bound to :80.
  `sudo ss -tlnp | grep ':80 '` should only show `caddy`.

### 502 Bad Gateway from Caddy

The reverse proxy can't reach the app. Check that PM2/systemd is actually
running on port 3000:

```bash
pm2 status
curl -sI http://127.0.0.1:3000
```

### Database migrations fail

```bash
cd /var/www/kirwin
npx prisma migrate status
```

If the local SQLite file is corrupted, restore from backup and re-run
`npx prisma migrate deploy`.

### Disk space / memory

```bash
df -h
free -m
pm2 monit
```

### Useful one-liners

```bash
# Tail app + caddy logs side by side.
pm2 logs kirwin --raw & sudo journalctl -u caddy -f

# Full restart of the stack.
pm2 restart kirwin && sudo systemctl reload caddy
```

---

## Reference: file layout on the VPS

```
/var/www/kirwin/                 # application code
  .env.production                # real secrets (chmod 600)
  .env -> .env.production        # optional symlink
  ecosystem.config.js            # PM2 config
  deployment/Caddyfile           # source for Caddyfile
  scripts/deploy.sh              # update script
/etc/caddy/Caddyfile             # active Caddyfile (copied)
/var/log/pm2/kirwin*.log         # PM2 logs
/var/log/caddy/kirwin.log        # Caddy access log
```
