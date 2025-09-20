# Intelluctual-Property-Rights
: Intellectual Property Registry (IPR) Platform

A full-stack platform for managing Intellectual Property (IP) assets with decentralized storage and blockchain-backed registration. This repository contains:

- `Frontend/` — A set of clean HTML-based tools for interacting with blockchain contracts and backend APIs.
- `ipr-backend-node/` — A Node.js + TypeScript backend providing REST APIs for IPFS uploads, smart contract interactions, and system health.

## Repository Structure

```
project1/
├── Frontend/                     # Lightweight HTML tools for user workflows
│   ├── Contract_Creation.html    # Upload to IPFS and register IP on-chain
│   ├── Contract_Interaction.html # Interact with deployed contracts
│   ├── Polyscan.html             # Explorer integrations / viewing
│   ├── Token_Management.html     # Manage tokens related to IP assets
│   ├── Token_Marketplace.html    # Marketplace-related flows
│   └── Voucher_Redeem.html       # Voucher redeem UX
│
└── ipr-backend-node/             # TypeScript Express backend API
    ├── src/
    │   ├── app.ts                # Express app & routes mount
    │   ├── index.ts              # Server entry
    │   ├── config/               # Env and config loader
    │   ├── controllers/          # IPFS & contract controllers
    │   ├── routes/               # /api routes (ipfs, contracts)
    │   └── ...
    ├── QUICK_START.md            # Backend quick start
    ├── .env.example              # Env reference
    └── README.md                 # Backend README (detailed)
```

## High-Level Overview

- **Decentralized Storage (IPFS)**: Frontend uploads assets via backend endpoint `POST /api/ipfs/upload`, which stores files/metadata on IPFS and returns a CID/metadata.
- **Blockchain Integration**: Frontend fetches contract data from backend endpoints under `/api/contracts/*` and connects to the user wallet (e.g., MetaMask via `ethers` UMD) to execute transactions.
- **PostgreSQL**: Backend is prepared for relational data storage and metadata persistence.

## Architecture

```mermaid
flowchart LR
  subgraph Client[Frontend (HTML Tools)]
    CC[Contract_Creation.html]
    CI[Contract_Interaction.html]
    TM[Token_Management.html]
  end

  subgraph Server[Backend (Node.js/Express)]
    API[REST API /api]
    IPFSRoute[/ipfs/]
    ContractsRoute[/contracts/]
  end

  subgraph Infra[Infrastructure]
    IPFS[(IPFS Node/Gateway)]
    DB[(PostgreSQL)]
    Chain[(EVM Chain: Ethereum/Polygon)]
  end

  CC -->|multipart/form-data| API
  CI --> API
  TM --> API
  API --> IPFSRoute
  API --> ContractsRoute
  IPFSRoute --> IPFS
  ContractsRoute --> Chain
  API --> DB

  Client -. Wallet (MetaMask/ethers) .-> Chain
```

## Getting Started

### Prerequisites

- Node.js v16+
- npm v8+
- PostgreSQL v12+
- (Optional) Local IPFS node or a public IPFS gateway
- A Web3 provider (e.g., Infura/Alchemy) and a funded wallet private key for test/main networks

### Backend Setup (ipr-backend-node)

1. Install dependencies
   ```bash
   npm install
   ```

2. Create environment file
   ```bash
   # Automated (recommended)
   npm run setup
   
   # Or manual
   copy ipr-backend-node\.env.example ipr-backend-node\.env  # Windows
   # Then edit ipr-backend-node/.env
   ```

3. Start backend in development
   ```bash
   npm run dev
   ```

Backend defaults:
- Base URL: `http://localhost:5000`
- Health: `GET /health`
- Status: `GET /status`
- API prefix: `/api`
- IPFS routes mounted at `/api/ipfs`
- Contract routes mounted at `/api/contracts`

For full details, see `ipr-backend-node/README.md` and `ipr-backend-node/QUICK_START.md`.

### Frontend Usage (Frontend)

The HTML tools can be opened directly in a browser. To ensure API calls work:

- Make sure the backend is running at `http://localhost:5000` (or update `BASE_URL` inside the HTML if different).
- Ensure your browser wallet (e.g., MetaMask) is installed and configured for the target network.

Key pages:
- `Frontend/Contract_Creation.html` — Upload file and metadata to IPFS via backend, then register on-chain.
- `Frontend/Contract_Interaction.html` — Interact with deployed contracts.
- `Frontend/Token_Management.html` — Token operations relating to IP assets.
- `Frontend/Token_Marketplace.html` — Marketplace functionality demonstrations.
- `Frontend/Polyscan.html` — Chain explorer-related view.
- `Frontend/Voucher_Redeem.html` — Redeem vouchers flow.

Tip: For a smoother dev experience, serve the `Frontend/` directory via a simple static server to avoid CORS/file URL issues.

Windows (PowerShell) — recommended:

```powershell
# From project1/Frontend/
pwsh ./serve-frontend.ps1 -Port 8080
# Then open http://localhost:8080/Contract_Creation.html
```

Cross-platform alternative (requires Node.js):

```bash
# From repository root or project1/
npx http-server Frontend -p 8080
# Then open http://localhost:8080/Contract_Creation.html
```

## Environment Configuration (Backend)

Essential variables (see full template at `ipr-backend-node/.env.example`):

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ipr_backend

# IPFS
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Web3
WEB3_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x...
IP_REGISTRY_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
MARKETPLACE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Security
JWT_SECRET=your_super_secure_jwt_secret_key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## How It Works (End-to-End)

1. **User** opens `Contract_Creation.html` and fills in asset details.
2. **Frontend** sends a `multipart/form-data` request to backend `POST /api/ipfs/upload` to store file + metadata on IPFS; receives a `metadataCid`.
3. **Frontend** requests contract ABI/address from backend `/api/contracts/ipregistry`.
4. **Frontend** connects to wallet via `ethers` and submits a transaction (e.g., `registerIP(title, type, description, metadataCid)`).
5. **Blockchain** confirms the transaction. The page displays the transaction hash/receipt.

## API Endpoints

Base URL: `http://localhost:5000`

API Prefix: `/api`

Note: Interactive API docs are currently disabled.

### Health & Status

- `GET /health`
  - Returns service health and timestamp.
- `GET /status`
  - Returns status, environment, uptime, and timestamp.

### IPFS

- `POST /api/ipfs/upload`
  - Description: Upload a file and metadata to IPFS.
  - Consumes: `multipart/form-data`
  - Form fields:
    - `file` (file) — optional but recommended; if omitted, only metadata is stored
    - `title` (string)
    - `ipType` (string) — e.g., `audio`, `artwork`, `patent`, `document`
    - `description` (string)
    - `license` (string) — e.g., `exclusive`, `non-exclusive`, `royalty-free`
    - `creator` (string)
  - Success response (200):
    ```json
    {
      "ok": true,
      "fileCid": "bafy...",     // present if file provided
      "metadataCid": "bafy..."  // JSON metadata CID
    }
    ```
  - Error response (500):
    ```json
    { "ok": false, "error": "IPFS upload failed" }
    ```

Example (curl):
```bash
curl -X POST http://localhost:5000/api/ipfs/upload \
  -F "file=@/path/to/asset.pdf" \
  -F "title=My Work" \
  -F "ipType=document" \
  -F "description=Important IP document" \
  -F "license=exclusive" \
  -F "creator=Alice"
```

### Contracts

- `GET /api/contracts/ipregistry`
  - Description: Fetch IP Registry contract address and ABI from server config.
  - Success response (200):
    ```json
    {
      "ok": true,
      "address": "0x...",
      "abi": [ /* contract ABI */ ]
    }
    ```
  - Error response (400) if env not set:
    ```json
    { "ok": false, "error": "IP_REGISTRY_CONTRACT_ADDRESS is not set in environment" }
    ```

- `POST /api/contracts/register`
  - Description: Server-side IP registration transaction (backend signs/relays).
  - Consumes: `application/json`
  - Body fields (all required):
    - `title` (string)
    - `ipType` (string)
    - `description` (string)
    - `ipfsHash` (string) — IPFS CID (e.g., `metadataCid` from the IPFS upload)
  - Success response (200):
    ```json
    {
      "ok": true,
      "tx": { /* chain receipt or tx info from web3.service */ }
    }
    ```
  - Error responses:
    - 400: `{ "ok": false, "error": "Missing required fields" }`
    - 500: `{ "ok": false, "error": "Registration failed" }`

Example (curl):
```bash
curl -X POST http://localhost:5000/api/contracts/register \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Work",
    "ipType": "document",
    "description": "Important IP document",
    "ipfsHash": "bafy..."
  }'
```

## Development and Scripts (Backend)

```bash
# From ipr-backend-node/
npm run dev          # Start dev server (ts-node-dev)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled server
npm run lint         # Type check only
npm run clean        # Remove dist/
npm run setup        # Generate .env
npm run setup:win    # Windows setup
```

## Troubleshooting

- **Backend not reachable**: Ensure `npm run dev` is running in `ipr-backend-node/` and port 5000 is free.
- **CORS issues**: Adjust `CORS_ORIGINS` in `ipr-backend-node/.env` and restart the server.
- **IPFS errors**: Verify `IPFS_API_URL` or run a local IPFS daemon (`ipfs daemon`).
- **Web3 errors**: Check provider URL, network, and wallet/private key; confirm sufficient funds for gas on test/main networks.
- **Local file loading restrictions**: Serve `Frontend/` with a static server instead of opening files via `file://`.


## Security Notes

- Do not commit `.env` files. Use `.env.example` as reference.
- Use strong, unique secrets for `JWT_SECRET` and private keys. Rotate regularly.
- Treat private keys as highly sensitive. Prefer environment variables or secure vaults.

## Roadmap

- Unified API documentation (Swagger/OpenAPI)
- End-to-end tests and CI pipeline
- Expanded multi-chain support and analytics
- Packaging of frontend as a small SPA with build tooling

## License

See `ipr-backend-node/README.md` for backend license (ISC). Apply the same license to frontend assets unless stated otherwise.

## Screenshots & Screencast

- Store screenshots under `project1/docs/screenshots/` and videos under `project1/docs/screencasts/`.
- Recommended filenames: `feature-name_step.png` and `feature-name_demo.mp4`.
- Example embedding in Markdown:
  ```markdown
  ![IP Registration Flow](docs/screenshots/ip-registration_flow.png)
  
  Screencast: [Watch demo](docs/screencasts/ip-registration_demo.mp4)
  ```
  If using a hosting service, you can link external URLs instead.
