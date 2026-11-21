# SchemeSaathi (IDEA//FORGE – Track 1, Problem 1)
Multilingual Policy, Rights & Scheme Explainer. Paste a government notice or scheme, pick a language, optionally enter your profile. Get a simple explanation, eligibility verdict, rights, documents and next steps. Voice input (mic) and read-aloud supported.

**Who faces the problem:** rural and low-literacy citizens who cannot read dense English/legal notices and miss benefits they qualify for.

**AI credit:** Google Gemini API (free tier) for explanation and eligibility reasoning; browser Web Speech API for voice.

## Run locally in VS Code
1. Install Node 18+ . Open this folder in VS Code (`code .`).
2. Terminal: `npm install`
3. `cp .env.example .env` (Windows: `copy .env.example .env`) and paste your free key from https://aistudio.google.com/apikey
4. `npm run dev` then open http://localhost:3000 (check http://localhost:3000/health shows aiConfigured true)

## Deploy on AWS Free Tier + Cloudflare
1. AWS Console > EC2 > Launch instance: Ubuntu 24.04, t3.micro (or t2.micro), create a key pair. Security group: allow SSH (22) from My IP, HTTP (80) and HTTPS (443) from anywhere.
2. Upload code: `scp -i key.pem -r schemesaathi ubuntu@<EC2_IP>:~/` (or git clone).
3. SSH in: `cd schemesaathi && cp .env.example .env && nano .env` (add key) then `./deploy.sh`
4. Test `http://<EC2_IP>/health`.
5. Cloudflare: add your domain (or buy a cheap one; free subdomains are not available on Cloudflare itself). DNS > add A record `@` (or `app`) pointing to the EC2 IP, Proxy status ON (orange cloud). SSL/TLS mode: Flexible (simplest) , then Always Use HTTPS on.
6. Open https://yourdomain in an incognito window.
Tip: attach an Elastic IP so the IP never changes. Set an AWS budget alert.
