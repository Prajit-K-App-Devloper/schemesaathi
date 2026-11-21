#!/usr/bin/env bash
# Run on a fresh Ubuntu 22.04/24.04 EC2 instance from inside the project folder.
set -e
sudo apt-get update && sudo apt-get install -y nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs
sudo npm install -g pm2
npm install --omit=dev
[ -f .env ] || { echo "Create .env first (cp .env.example .env and add your key)"; exit 1; }
pm2 start server.js --name schemesaathi && pm2 save
sudo env PATH=$PATH pm2 startup systemd -u $USER --hp $HOME | tail -1 | sudo bash
sudo tee /etc/nginx/sites-available/schemesaathi >/dev/null <<'NGINX'
server {
  listen 80 default_server;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/schemesaathi /etc/nginx/sites-enabled/schemesaathi
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
echo "Done. Open http://<EC2-public-IP>/health"
