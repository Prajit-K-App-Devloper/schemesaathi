# SchemeSaathi

> **Multilingual Policy, Rights & Scheme Explainer**

SchemeSaathi helps people understand government notices, welfare schemes, and local laws in simple language. Users can paste a document, choose a regional language, optionally provide a personal profile, and receive an easy-to-follow explanation with eligibility guidance, rights, required documents, and next steps.

The project is designed for rural communities and people with low literacy who may otherwise struggle with dense English or legal language. It also supports voice input and read-aloud responses where the browser provides Web Speech API support.

## What it does

- Explains notices and schemes in simple, accessible language
- Supports English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, and Punjabi
- Provides a likely eligibility assessment based on the document and optional user profile
- Highlights benefits, rules, rights, documents, deadlines, and recommended next steps
- Accepts voice input through the browser microphone
- Reads generated results aloud using browser text-to-speech
- Includes a health endpoint for deployment checks
- Uses a small in-memory rate limiter for the explanation endpoint

## How it works

1. The user pastes a notice, scheme description, or law.
2. The user selects an output language and may enter details such as age, income, state, occupation, and category.
3. The server sends the document and profile to Google Gemini with a structured response format.
4. SchemeSaathi displays the explanation and eligibility result in the browser.
5. The user can listen to the result using browser text-to-speech.

The repository also includes sample scheme data in [`data/schemes.json`](./data/schemes.json) for future or client-side scheme discovery features.

## Technology

- **Runtime:** Node.js 18+
- **Backend:** Express
- **Frontend:** HTML, CSS, and vanilla JavaScript
- **AI:** Google Gemini API
- **Voice:** Browser Web Speech API
- **Production process manager:** PM2
- **Reverse proxy:** Nginx
- **Deployment target:** Ubuntu on AWS EC2, optionally fronted by Cloudflare

## Quick start

### Prerequisites

- Node.js 18 or newer
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Install and configure

From the project directory:

```bash
npm install
```

Create an environment file:

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env` and set your API key:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3000
```

### Run the application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Verify the server with [http://localhost:3000/health](http://localhost:3000/health).

The health endpoint returns whether the Gemini key is configured and which model is selected:

```json
{
  "ok": true,
  "aiConfigured": true,
  "model": "gemini-3.5-flash-lite"
}
```

## API

### `POST /api/explain`

Generates an explanation and eligibility assessment.

Example request:

```json
{
  "text": "Paste the government notice or scheme text here.",
  "language": "Hindi",
  "profile": {
    "age": "32",
    "yearlyIncomeINR": "180000",
    "state": "Telangana",
    "occupation": "farmer",
    "category": "OBC"
  }
}
```

The response contains:

- A short title and plain-language summary
- Key points
- Eligibility verdict and reasons
- Rights or protections mentioned in the document
- Documents to keep ready
- Recommended next steps
- A verification warning

The server accepts up to 12,000 characters from the submitted document and limits requests to 20 per minute per IP address.

## Deploy on AWS EC2 with Nginx

The repository includes [`deploy.sh`](./deploy.sh), which installs Node.js, Nginx, and PM2, starts the application, and configures Nginx as a reverse proxy.

1. Launch an Ubuntu 22.04 or 24.04 EC2 instance.
2. Allow SSH from your IP and HTTP/HTTPS traffic in the security group.
3. Copy or clone the project onto the instance.
4. Configure the environment:

   ```bash
   cd schemesaathi
   cp .env.example .env
   nano .env
   ```

5. Run the deployment script:

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

6. Confirm that `http://<EC2_PUBLIC_IP>/health` responds successfully.

For a custom domain, point a DNS A record to the instance (an Elastic IP is recommended). Cloudflare can then provide DNS management and HTTPS. Use a strict SSL/TLS configuration with an origin certificate for production deployments.

## Responsible use

SchemeSaathi provides informational guidance, not legal, financial, or government-approved advice. AI-generated explanations may be incomplete or incorrect. Users should confirm eligibility, deadlines, and required documents with the relevant official portal, department, Common Service Centre, bank, or local authority before taking action.

Do not submit passwords, authentication codes, financial account credentials, or other sensitive information. The current server keeps rate-limit data in memory and does not provide user accounts or persistent profile storage, but submitted documents are sent to the configured Gemini API for processing.

## Project structure

```text
.
├── data/
│   └── schemes.json       # Sample scheme catalogue
├── public/
│   ├── index.html         # Main explainer interface
│   └── notice.html        # Notice explainer interface
├── .env.example           # Environment variable template
├── deploy.sh              # Ubuntu/EC2 deployment script
├── package.json           # Scripts and dependencies
└── server.js              # Express server and Gemini integration
```

## License

No license has been specified yet. Add a `LICENSE` file before distributing or accepting external contributions.
