#!/usr/bin/env bash
# Sets up a 100% free Cloudflare Quick Tunnel on the EC2 instance
set -e

echo "=== Installing Cloudflare Tunnel (cloudflared) ==="
curl -L --output /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i /tmp/cloudflared.deb
rm -f /tmp/cloudflared.deb

echo "=== Starting Cloudflare Quick Tunnel with PM2 ==="
pm2 start "cloudflared tunnel --url http://127.0.0.1:3000" --name cloudflare-tunnel
pm2 save

echo "=== Fetching your Public HTTPS URL ==="
sleep 5
TUNNEL_URL=$(pm2 logs cloudflare-tunnel --lines 25 --nostream | grep -o 'https://[-a-z0-9.]*\.trycloudflare\.com' | head -n 1)

echo ""
echo "=========================================================="
echo " SUCCESS! Your SchemeSaathi app is live on Cloudflare:"
echo " ${TUNNEL_URL}"
echo "=========================================================="
