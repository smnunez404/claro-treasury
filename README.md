# CLARO Protocol — Transparent Treasury for Latin American Organizations

**Built at Aleph Hackathon 2026 · Santa Cruz de la Sierra, Bolivia · Powered by Avalanche**

- **Live demo:** [https://claro.yaislab.org](https://claro.yaislab.org)
- **Network:** Avalanche Fuji Testnet (Chain ID: 43113)
- **GitHub:** [https://github.com/smnunez404/yais-treasury-cd48c953](https://github.com/smnunez404/yais-treasury-cd48c953)

---

## The Problem

Bolivia is going through a severe dollar shortage crisis. Banks won't open USD accounts unless you deposit a minimum of $10,000. International transfers get blocked or arrive with 15% already lost to conversion fees and volatility. Over the past year, the boliviano-dollar exchange rate fluctuated so dramatically that organizations receiving international grants had no idea how much they would actually receive.

For organizations without legal entity status — no formal incorporation, no juridical personality — the situation is even worse. They are completely locked out of international funding, regardless of the quality of their work.

**YAIS Lab** (Young Artificial Intelligence Society), a real nonprofit AI research organization in Santa Cruz de la Sierra, Bolivia, faces all of these problems. We have no legal entity. We cannot open a USD bank account. We have won competitions and are actively researching AI solutions to real social problems — but we cannot receive the international funding that would let us scale that work.

This is not just YAIS's problem. There are thousands of organizations across Latin America doing real work — rebuilding forests, preventing disease outbreaks, educating communities — with no transparent, accessible way to receive international support.

**Four critical barriers block them all:**

- **Currency loss** — 5–15% lost converting international grants to local currency
- **Zero transparency** — donors cannot verify where their money went
- **No access to global funding** — organizations without legal status locked out entirely
- **Technical barriers** — setting up a crypto treasury requires developer expertise

**CLARO Protocol was built to solve YAIS's own challenges — and open-sourced so every organization in LATAM can benefit.**

---

## The Solution

CLARO Protocol is **transparent treasury infrastructure** for Latin American organizations. Any NGO, research lab, or social initiative — with or without legal status — can receive international funding, pay their team on-chain, and prove to every donor exactly where every dollar went.

**From $1 to any amount. No bank account required. No legal entity required. No crypto knowledge required.**

Any organization in LATAM can:

- **Deploy their own smart contract treasury** in one click — no technical knowledge required
- **Receive grants transparently** on-chain from donors worldwide
- **Pay their team** with verifiable on-chain payroll
- **Participate in Quadratic Funding** rounds
- **Certify real-world impact** with Hypercerts on Base Sepolia
- **Generate AI-powered transparency reports** with Gemini 2.0 Flash
- **Withdraw funds** to their local bank account via Onramper

Users never see "AVAX" or "gas". Everything is presented in USD.

---

## Live Demo

**[https://treasury.yaislab.org](https://treasury.yaislab.org)**

### Registered Organizations (Fuji Testnet)

| Organization         | Type           | Contract      | Status      |
| -------------------- | -------------- | ------------- | ----------- |
| YAIS Lab             | AI Research    | `0xc3Cd64...` | Verified ✅ |
| Pata Segura          | Animal Welfare | `0x13a38c...` | Verified ✅ |
| Guardianes del Chaco | Environment    | Deployed      | Pending     |

### Real Activity on Testnet

- **4 donations processed** — $5.90 total raised
- **2 unique donors** (Carol via MetaMask, Eduardo via Privy email)
- **On-chain payroll executed**
- **Hypercerts minted** on Base Sepolia for "AI for Education Bolivia"
- **AI transparency reports** generated via Gemini 2.0 Flash
- **Quadratic Funding round** active with 3 projects

---

## How It Works

```
Organization registers with email (no MetaMask required)
    ↓
CLAROFactory deploys their own YAISTreasury contract automatically
    ↓
Donors worldwide donate in USD with a credit card (Onramper)
    ↓
Every fund movement is publicly verifiable on Avalanche
    ↓
AI generates transparency reports automatically (Gemini 2.0 Flash)
    ↓
Impact certified on Base Sepolia (Hypercerts)
    ↓
Organization withdraws funds to their local bank account
```

---

## Smart Contracts

### Deployed on Avalanche Fuji Testnet

| Contract                   | Address                                      | Explorer                                                                                     |
| -------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| CLAROFactory               | `0xc591877C9d3310EdDb83065f5d9C86A9ed69324c` | [Snowtrace](https://testnet.snowtrace.io/address/0xc591877C9d3310EdDb83065f5d9C86A9ed69324c) |
| CLAROMatching (QF)         | `0x32A6dCCb5aA832Cc37be8bdDAAf614F6ae3AFb52` | [Snowtrace](https://testnet.snowtrace.io/address/0x32A6dCCb5aA832Cc37be8bdDAAf614F6ae3AFb52) |
| YAISTreasury (YAIS Lab)    | `0xc3Cd64C2E72F7C122388a452590a659Dc098960a` | [Snowtrace](https://testnet.snowtrace.io/address/0xc3Cd64C2E72F7C122388a452590a659Dc098960a) |
| YAISTreasury (Pata Segura) | `0x13a38ce79e440a54c02b2066bf57b916054e0a1a` | [Snowtrace](https://testnet.snowtrace.io/address/0x13a38ce79e440a54c02b2066bf57b916054e0a1a) |

### Deployed on Base Sepolia

| Contract   | Address                                      | Explorer                                                                                    |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hypercerts | `0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07` | [Basescan](https://sepolia.basescan.org/address/0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07) |

### Verified Hypercerts

| Project                  | Transaction             |
| ------------------------ | ----------------------- |
| AI for Education Bolivia | `0x4fc9f578...`         |
| Buzzbusters              | Minted during hackathon |

### Contract Architecture

```
CLAROFactory
├── registerOrganization()  → deploys YAISTreasury, registers owner
├── verifyOrganization()    → only protocolOwner
├── getOrganizationByOwner() → lookup by wallet address
└── getAllOrganizations()   → full list for sync

YAISTreasury (one per organization — fully owned by the org)
├── addEmployee() / removeEmployee()
├── executePayroll()        → on-chain salary payment
├── createGrant()           → creates grant vault with projectId
├── depositToGrant()        → anyone can donate to specific grant
├── disburseGrant()         → owner sends funds to recipient
└── withdrawAll()           → owner withdraws all funds

CLAROMatching (Quadratic Funding — global)
├── createRound()           → new QF round with project list
├── contribute()            → donor votes with funds
├── calculateMatching()     → quadratic formula projection
├── distributeMatching()    → final distribution after round ends
└── getTimeRemaining()      → countdown for active round
```

---

## Quadratic Funding Formula

```
matching_i = (Σ√contribution_j)² / Σ_all(Σ√contribution_j)² × matching_pool
```

A project with 10 donors of $0.18 beats a project with 1 donor of $5.00.
Community support matters more than whale donations — **democratic, not plutocratic.**

---

## Tech Stack

| Layer              | Technology                               |
| ------------------ | ---------------------------------------- |
| Smart Contracts    | Solidity 0.8.20 — Avalanche C-Chain      |
| Quadratic Funding  | CLAROMatching — Avalanche C-Chain        |
| Impact Certs       | Hypercerts — Base Sepolia                |
| Frontend           | React + TypeScript + Vite                |
| Wallet / Auth      | Privy (email + Google + MetaMask)        |
| Blockchain reads   | ethers.js v6                             |
| Backend            | Supabase Edge Functions (Deno)           |
| Database           | Supabase PostgreSQL (15 tables, 2 views) |
| AI Reports         | Gemini 2.0 Flash                         |
| Off-ramp / On-ramp | Onramper (30+ providers)                 |
| RPC                | Alchemy / Avalanche public RPC           |
| Deploy             | Lovable → treasury.yaislab.org           |

---

## Features

### 1. Self-Service Organization Registration

Any wallet deploys their own YAISTreasury via CLAROFactory in a single transaction. The protocol deploys the contract, registers the organization, and the owner has full control immediately.

```
/register → fill form → CLAROFactory.registerOrganization() → treasury live
```

No developer needed. No intermediary. Full ownership.

### 2. On-Chain Payroll

Employees are registered on-chain with their wallet address and salary in cents. Every payment is a verifiable blockchain transaction.

```solidity
addEmployee(wallet, name, salaryCents)
executePayroll(wallet, amount)  ← signed by org owner via Privy
```

The most transparent payroll system possible — every cent tracked on Snowtrace.

### 3. Grant Vaults

Organizations create named grant vaults linked to specific projects. Anyone in the world can donate to a specific grant. Only the org owner can disburse funds.

```solidity
createGrant("ai-education-2026", "AI for Education Bolivia")
depositToGrant("ai-education-2026")  ← anyone, payable
disburseGrant("ai-education-2026", recipient, amount)  ← owner only
```

### 4. Quadratic Funding

Active rounds where unique donors matter more than donation size. Real-time matching projections visible to all donors. Democratic allocation mechanism.

**Active Round 2 data:**

- Matching pool: 0.03 AVAX
- 3 projects: AI for Education Bolivia, Buzzbusters, Forest Fire Prevention AI
- All with unique donors

### 5. Hypercerts Impact Certification

Organizations certify real-world impact on Base Sepolia. The certification mints a permanent, verifiable certificate with project metadata.

```solidity
mintClaim(account, units, metadataUri, restrictions)
```

Switches from Avalanche Fuji to Base Sepolia automatically via Privy's `switchChain()`. Switches back after minting. The TX hash is stored in Supabase and displayed publicly with a badge on the project card.

### 6. AI Transparency Reports

One click generates a professional donor report powered by **Gemini 2.0 Flash**. Combines on-chain transaction data, project milestones, impact metrics, and organizational context. Every report includes a Snowtrace verification link.

> Edge Function: `generate-report` (Supabase Deno)

### 7. Wallet Abstraction

Sign in with email, Google, or existing wallet. No MetaMask required. Privy creates an embedded wallet automatically for email/Google users. Donors never see crypto jargon — they see "Support" and "Donate $5.00", not "0.277 AVAX".

### 8. Off-Ramp / On-Ramp to Bank

Convert AVAX to local currency via Onramper (30+ providers including Stripe and Revolut). Auto-detects local currency by IP. Works in Bolivia and all LATAM countries. Available from the Dashboard.

### 9. Transparency Score

Every organization has a public 0–100 score:

| Criterion                 | Points |
| ------------------------- | ------ |
| Has description           | 10     |
| Verified by protocol      | 20     |
| Has active projects       | 15     |
| Has on-chain transactions | 20     |
| Milestones with evidence  | 15     |
| Public documents          | 10     |
| Impact metrics            | 10     |

Currently: YAIS Lab and Pata Segura at 50/100 (description + verified + transactions).
Score increases as organizations add projects, milestones, and evidence.

### 10. Protocol Admin Panel

The Protocol Admin (protocolOwner of CLAROFactory) can:

- View all registered organizations
- Verify organizations on-chain (`verifyOrganization()`)
- View protocol-wide stats (total raised, donors, transactions)
- Force sync from blockchain to Supabase

---

## Database Architecture

**Supabase project:** claro-protocol
**URL:** `https://yduchjgncwwlbvrcklzy.supabase.co`

### Tables (15 tables + 2 views)

| Table                          | Purpose                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| `claro_organizations`          | Organization metadata (complements blockchain)                             |
| `claro_projects`               | Projects per organization (includes onchain_project_id, hypercert_tx_hash) |
| `claro_project_updates`        | Impact updates per project                                                 |
| `claro_transactions`           | On-chain transaction registry                                              |
| `claro_donations`              | Donation records with donor metadata                                       |
| `claro_reports`                | AI-generated transparency reports                                          |
| `claro_milestones`             | Project milestones with evidence links                                     |
| `claro_documents`              | Public documents and evidence                                              |
| `claro_impact_metrics`         | Verifiable impact metrics                                                  |
| `claro_team_members`           | Public team per organization                                               |
| `claro_testimonials`           | Verified testimonials                                                      |
| `claro_payment_justifications` | Justification per payment                                                  |
| `claro_audit_log`              | Immutable audit trail of all actions                                       |
| `claro_sync_log`               | External sync logs                                                         |
| `v_org_transparency`           | Full public view per org (with CTE-based aggregation)                      |
| `v_transparency_score`         | Transparency score 0–100 per org                                           |

### Security Model

- **RLS enabled** on all 15 tables
- **Public SELECT** on transparency data
- **All writes** via Edge Functions with `service_role` + ownership verification
- `claro_audit_log`: **no UPDATE or DELETE policies** — immutable by design
- `claro_transactions`: `WITH CHECK (false)` — only writable via Edge Functions

### Edge Functions (Deno)

| Function             | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `generate-report`    | Gemini 2.0 Flash transparency report                            |
| `sync-organizations` | Sync orgs from CLAROFactory to Supabase                         |
| `update-org-profile` | Update org metadata with ownership verification                 |
| `org-write`          | Centralized write handler (projects, milestones, metrics, team) |
| `log-donation`       | Log on-chain donations to Supabase with service_role            |
| `log-payroll`        | Log on-chain payroll to Supabase with service_role              |
| `log-grant-action`   | Log grant creation, disbursement, certification                 |

---

## Frontend Architecture

Built with React + TypeScript + Vite, deployed via Lovable to [treasury.yaislab.org](https://treasury.yaislab.org).

### Routes

| Route                   | Access         | Description                        |
| ----------------------- | -------------- | ---------------------------------- |
| `/`                     | All            | Smart redirect by role             |
| `/explore`              | All            | Public org directory               |
| `/register`             | All            | New org registration               |
| `/org/:contractAddress` | All            | Public org profile                 |
| `/dashboard`            | Org Owner      | Treasury overview                  |
| `/organization`         | Org Owner      | Profile, projects, impact, team    |
| `/payroll`              | Org Owner      | Employee management                |
| `/grants`               | Org Owner      | Grants, QF, Hypercerts, AI reports |
| `/admin`                | Protocol Admin | Org management and verification    |

### Role Detection (no hardcoded addresses)

```typescript
// 1. factory.protocolOwner() === connected wallet → Protocol Admin
// 2. factory.getOrganizationByOwner(address) !== zero → Org Owner
// 3. Otherwise → Donor
```

Role is always read from the blockchain — never from hardcoded addresses.

### Key Hooks

| Hook              | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `useOrganization` | Role detection from CLAROFactory                |
| `useTreasury`     | All blockchain reads for Dashboard              |
| `useGrants`       | Grants + QF round + reports from blockchain     |
| `usePayroll`      | Employee reads + write transactions             |
| `useAdmin`        | Admin panel data + verifyOrganization           |
| `useRegister`     | Full registration flow                          |
| `useDonation`     | Donation flow with Privy signing                |
| `useOrgWrite`     | All Supabase writes via org-write Edge Function |

---

## Running Locally

### Prerequisites

- Node.js 18+
- Privy App ID ([privy.io](https://privy.io))
- Supabase project (or connect to existing: `yduchjgncwwlbvrcklzy`)

### Environment Variables

```env
# Lovable → Project Settings → Environment Variables
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_SUPABASE_URL=https://yduchjgncwwlbvrcklzy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_ONRAMPER_API_KEY=pk_test_01KM8NG3R3S6EYJBJW7YT81FY9

# Public (can be in .env)
VITE_CLARO_FACTORY_ADDRESS=0xc591877C9d3310EdDb83065f5d9C86A9ed69324c
VITE_CLARO_MATCHING_ADDRESS=0x32A6dCCb5aA832Cc37be8bdDAAf614F6ae3AFb52
VITE_CONTRACT_ADDRESS=0x692e5bC1FCf2ae951E2Bae7e963147c8Db7A4c86
VITE_HYPERCERTS_CONTRACT=0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07
VITE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/WTv7U_04AH1U0eetYO1_E
VITE_CHAIN_ID=43113
VITE_SNOWTRACE_URL=https://testnet.snowtrace.io
VITE_AVAX_TO_USD=18
```

### Install and Run

```bash
npm install
npm run dev
```

---

## Roles and Test Wallets

| Person   | Wallet                                       | Role              |
| -------- | -------------------------------------------- | ----------------- |
| Sergio   | `0xF70870E9B4B28A5E3c9c90Bc04b8b65571Ca7A6`  | Protocol Admin    |
| Mauricio | `0x35B74424357490E29b1c04571B4798326CAf034f` | YAIS Lab Owner    |
| Mariela  | `0xe1896E64ee6B3385Ed9d4fCbA2cDAd1C5615Be8F` | Pata Segura Owner |
| Carol    | `0x8bE3b2B3A2841892510846db55B7b669bd9BcA58` | Donor             |

> Role detection is always read from CLAROFactory on-chain — never from hardcoded addresses.

---

## Roadmap

### Phase 1 — Testnet ✅ (current)

- [x] CLAROFactory — self-service organization registration
- [x] YAISTreasury — on-chain payroll + grant vaults
- [x] CLAROMatching — Quadratic Funding rounds
- [x] Hypercerts — impact certification on Base Sepolia
- [x] AI transparency reports (Gemini 2.0 Flash)
- [x] Off-ramp/on-ramp via Onramper (30+ providers)
- [x] Wallet abstraction via Privy (email + Google + MetaMask)
- [x] Public transparency score (0–100)
- [x] Protocol Admin panel with on-chain verification
- [x] Full 9-sprint frontend at treasury.yaislab.org
- [x] 3 organizations registered
- [x] Multi-chain: Avalanche Fuji + Base Sepolia

### Phase 2 — Mainnet

- [ ] Security audit
- [ ] Deploy on Avalanche mainnet
- [ ] USDC stablecoin payroll (no conversion loss)
- [ ] YAIS legal registration funded by CLARO grants
- [ ] Auto-conversion to local currency at withdrawal

### Phase 3 — Scale

- [ ] 10 LATAM organizations onboarded
- [ ] Gitcoin integration for QF rounds
- [ ] Mobile app for field workers
- [ ] Multi-language (Spanish, Portuguese, Quechua)
- [ ] Full Hypercerts mint flow with IPFS metadata

---

## The Organization

**YAIS Lab — Young Artificial Intelligence Society**
Santa Cruz de la Sierra, Bolivia
[https://yaislab.org](https://yaislab.org)

YAIS Lab is a nonprofit AI research organization building open-source tools for social impact in Latin America. We run hackathons, tech talks, AI meetups, and mini-hackathons where participants develop both technical and soft skills. We are not formally incorporated yet — no legal entity, no juridical personality — which is precisely why we needed CLARO Protocol.

### Our Active Research Projects

- **Buzzbusters** — AI-powered prevention of Aedes aegypti mosquito proliferation. Addresses the spread of dengue and chikungunya in tropical and subtropical regions of Latin America. This project has won competitions and is now in active research phase.

- **Forest Fire Prevention AI** — Agent-based early warning and notification system for forest fire detection. Built for Bolivia's Chiquitanía region, which suffers devastating fires every dry season.

- **AI for Education Bolivia** — Hackathons, workshops, and educational programs teaching AI tools and building technical capacity in underserved communities across Bolivia.

### Why We Need Funding

Every research project requires real resources: hardware, software licenses, materials, and travel. Our next priorities are:

- **Legal incorporation** in Bolivia as a foundation or civil association (requires legal fees and administrative costs)
- **Potential 501(c)** nonprofit registration in the United States for international credibility
- **Equipment and infrastructure** for ongoing research
- **Funding for our next AI hackathon** and community events

CLARO Protocol is the tool we built to make this possible — transparently, verifiably, and without requiring a bank account or legal entity to get started.

> YAIS Lab was the first organization to adopt CLARO. CLARO and YAIS are separate entities.

---

## Tracks

- **Avalanche** — Aleph Hackathon 2026 (primary)
- **Best Projects by PL_Genesis**
- **Crypto track** — PL_Genesis
- **Hypercerts track** — PL_Genesis

---

## Why We Built This

CLARO Protocol was not built as an interesting technical exercise. It was built because YAIS Lab needed it — right now, today — to keep our research alive.

We have projects that have won competitions. We have a community. We have researchers. What we don't have is a legal entity, a USD bank account, or a way to receive the international support that our work deserves.

Bolivia's dollar crisis made the traditional path impossible. So we built a new one.

**The goal for the funds raised through CLARO Protocol:**

- **Legal incorporation in Bolivia** — register YAIS as a foundation or civil association
- **Equipment and infrastructure** — hardware, licenses, and materials for active research projects
- **501(c) registration in the United States** — for international credibility and access to global grant programs
- **Community programs** — fund our next hackathon, workshops, and AI education events

Every boliviano raised is traceable on Snowtrace. Every disbursement requires a justification. Every project outcome is certifiable on Base Sepolia. That is the standard we hold ourselves to — and the standard we are building for everyone else.

---

## Team

**Sergio Mauricio Nuñez**
Founder, YAIS Lab — Santa Cruz de la Sierra, Bolivia
Solo builder — smart contracts, frontend, AI integration, backend, product

---

## Built at

**Aleph Hackathon 2026** | March 20–22, 2026 | Santa Cruz de la Sierra, Bolivia

> CLARO Protocol runs on Avalanche Fuji Testnet. Mainnet launch pending security audit.

| Contract                  | Address                                      |
| ------------------------- | -------------------------------------------- |
| CLAROFactory              | `0xc591877C9d3310EdDb83065f5d9C86A9ed69324c` |
| CLAROMatching             | `0x32A6dCCb5aA832Cc37be8bdDAAf614F6ae3AFb52` |
| YAISTreasury (YAIS Lab)   | `0xc3Cd64C2E72F7C122388a452590a659Dc098960a` |
| Hypercerts (Base Sepolia) | `0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07` |
