🇮🇳 BharatQR Hub - Unlocking Digital India
BharatQR is an assisted-digital access platform designed to bridge the gap for India's next billion users. By transforming a simple physical QR card into a gateway for essential services, we empower elderly and illiterate citizens to access their digital identity with dignity and ease.

🌐 Live Demo
URL: https://bharatqr-hub.vercel.app

🚀 Key Features
Action-First Landing: A massive, high-contrast "Scan" button designed for zero-literacy navigation.

Intelligent Dashboard: Automatically fetches and displays Aadhaar, ABHA Health Records, and DigiLocker documents.

Proactive Bill Alerts: Integrated Bharat BillPay (BBPS) logic that highlights red "Action Required" cards for low balances or pending bills.

Regional AI Voice: (Simulated) Integration with Bhashini AI to provide real-time audio summaries in local languages.

Admin Control: A secure portal for operators to manage citizen records with real-time Firestore synchronization.

🛠️ Technology Stack
Frontend: React.js with Vite.

Styling: Tailwind CSS & shadcn/ui for a clean, "Government Portal" aesthetic.

Database: Firebase Firestore for real-time data persistence and seeding.

Deployment: Vercel with custom SPA routing configuration (vercel.json).

Icons/Assets: Lucide-react for high-visibility symbolic navigation.

💻 Local Development
If you want to run this project locally on your machine:

Clone the repo:

Bash
git clone <YOUR_GIT_URL>
cd bharatqr-hub
Install dependencies:

Bash
npm install
Set up Firebase:
Create a .env file and add your Firebase configuration keys (refer to src/lib/firebase.ts).

Start the server:

Bash
npm run dev
📦 Deployment Info
This project is optimized for Vercel. To ensure routing works for the /scan and /admin pages, the vercel.json file is configured to rewrite all requests to index.html.

Build Command: npm run build

Output Directory: dist
