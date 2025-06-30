## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Backend Setup with Supabase

We use Supabase as our backend database and authentication service. To set up:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Copy your Supabase URL and API keys from the project dashboard
4. Update the `.env` file in the backend directory with your Supabase credentials
5. Install backend dependencies:

```bash
cd backend
npm install
```

6. Initialize the Supabase database:

```bash
node scripts/init-supabase.js
```

7. Start the backend server:

```bash
npm run dev
```

## Supabase Schema

Our application uses the following main tables:
- `universities` - Stores information about registered educational institutions
- `students` - Contains student records linked to universities
- `credentials` - Stores academic credentials with optional blockchain hashing
- `verification_logs` - Tracks all verification requests and results

## Manual Supabase Setup

Supabase differs from Firebase in that it requires a defined database schema. Here's how to set it up:

### Option 1: Using the Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Copy the contents of `/backend/scripts/schema.sql` 
4. Paste and run this SQL in the Supabase SQL Editor
5. This will create all necessary tables and security policies

### Option 2: Using our setup script (Development only)

The setup script requires the `service_role` key which has higher privileges:

```bash
# Make sure your .env has SUPABASE_SERVICE_ROLE_KEY set
cd backend
npm run setup-db
```

> ⚠️ Note: Unlike Firebase, Supabase doesn't allow schema creation with the anon key by default. This is for security reasons.

### Testing Your Connection

After setting up the tables, test your API connection:
```
GET http://localhost:5500/api/test-supabase
```

You should see a successful response with data from the health_check table.

🛠️ DEVELOPMENT PLAN FOR "WHO IS WHO" - EAST AFRICA FOCUS

📍 Phase 1 (MVP): Core Verification System
Timeframe: 2–3 months
 Goal: Build a working version to onboard East African private universities and reduce credential fraud.
✅ Features to Build:
University Admin Portal
- Login (with role-based access)
- Upload student credential records (CSV or form)
- Support for East African credential formats and naming conventions
- Multi-language support (English, Swahili)
- Dashboard with recent uploads and request logs
- Offline capability for regions with unstable internet

Verifier Portal (Employers / Institutions)
- Public search interface to verify credentials (by student name, ID, year, university)
- Instant result (Match / No Match)
- Mobile-friendly interface (essential for East Africa's mobile-first adoption)

Audit Logs
- Track who verified what, when, and how often
- Compliance with East African data protection regulations

Secure Record Structure
- Unique ID or QR code for every credential
- Store minimal credential hash (preparing for blockchain)

Database
- PostgreSQL for secure, structured storage
- Tables: universities, students, credentials, verifications, admins
- Option for local hosting for institutions with data sovereignty concerns

Basic Email & SMS Notifications
- Email to university admin when a verification is requested
- SMS notifications for critical alerts (more reliable than email in many EA regions)

Authentication
- Admin login via secure password (Firebase Auth or Auth0 can be used initially)
- 2FA via SMS for enhanced security

🧪 Testing:
- Pilot with 2-3 prominent private universities in Uganda, Kenya, or Tanzania
- Preload sample records and simulate real verification requests
- Test under various internet connectivity scenarios

📍 Phase 2: Transcript Sharing Between Institutions
Timeframe: 2–3 months (parallel or after MVP launch)
 Goal: Allow verified transcript transfer from one university to another (or to a foreign institution)
✅ Features to Build:
Request Transcript
- A logged-in university user can request a transcript from another institution

Approve & Send Transcript
- Sending university reviews request → approves → sends digital copy (PDF or generated report)

Transcript Viewer
- Receiving party views the transcript in a secure UI

Verification Workflow
- Each transcript includes QR code or unique ID to cross-check against stored credentials
- Add support for cross-border credential recognition within East African Community
- Compliance with inter-university transfer protocols in East Africa

📍 Phase 3: Blockchain Credential Anchoring
Timeframe: 1–2 months
 Goal: Add an optional layer of trust for permanent, tamper-proof credentials
✅ Features to Build:
Hash Transcript Data
- Hash key data (student ID, degree, year) into SHA-256

Store on Blockchain
- Use Polygon (or testnet initially) to write hash + credential ID

Verification API
- Compare new hashes with blockchain records for authenticity
- You don’t need to store the full transcript on-chain—just the hash for proof.
- Consider lower-cost blockchain solutions appropriate for developing markets
- Potential partnership with local telecom providers for infrastructure support

📍 Phase 4: Student Portal (Read-Only Access)
Timeframe: 1–2 months
 Goal: Let students access and share their verified records
✅ Features to Build:
Student Login (email + password or phone)
- View My Credentials
- View their transcript/degree and blockchain status
- Generate Shareable Link / QR Code
- Share with employers/schools (view-only access)
- USSD interface option for feature phone access (widespread in rural East Africa)
- Integration with mobile money platforms for optional premium services

📍 Phase 5: Premium & International Features
Timeframe: Ongoing
 Goal: Monetize the platform and build for global compatibility
✅ Features to Build:
Employer Account (Premium)
- Bulk verification tool
- Export reports, advanced search

Integration with Global Platforms
- API to accept requests from international institutions or credential evaluators

Analytics Dashboard (for institutions)
- View verification stats, usage metrics, fraud alerts

NCHE/UPUA-level Admin Dashboard
- Regional dashboards for associations or regulators
- East African Community (EAC) educational regulatory compliance
- Integration with regional employment platforms
- Cross-border verification for students seeking opportunities within East Africa
- Partnerships with international credential evaluators for global mobility

📦 Development Stack Overview
Layer | Recommended Tools
--- | ---
Frontend | React + Tailwind CSS (for admin & public portals) + Progressive Web App features
Backend | Node.js (Express) or Django (Python) with efficient caching for low-bandwidth areas
Database | PostgreSQL (with option for local hosting)
Auth | Firebase Auth or Auth0 with SMS-based 2FA
Blockchain | Polygon SDK (low transaction fees) or consider Cardano (growing in Africa)
Hosting | Vercel for frontend, local or regional hosting options for backend and data
Communication | SendGrid or Firebase email + Africa's SMS gateways (Africas Talking, Twilio)
QR Code | qrcode library or Google Chart API

🧭 Market-Specific Considerations
- **Data Sovereignty**: East African countries increasingly require educational data to be hosted locally
- **Connectivity Challenges**: Design for low-bandwidth and intermittent connectivity
- **Mobile First**: Prioritize mobile interfaces as smartphone penetration continues to grow
- **Regulatory Compliance**: Build with EAC educational regulatory frameworks in mind
- **Language Support**: Consider English and Swahili interfaces at minimum
- **Cost Sensitivity**: Develop pricing models appropriate for East African educational budgets
- **Trust Building**: Incorporate local educational authorities in verification processes

✅ Next Steps for You
✅ Engage with 2-3 private universities in different East African countries for initial feedback
✅ Connect with East African higher education regulatory bodies for alignment and potential endorsement
✅ Build MVP (Phase 1) with East African use cases as primary design considerations
✅ Conduct user testing with actual administrators from target institutions
✅ Develop offline-first capabilities for areas with connectivity challenges

