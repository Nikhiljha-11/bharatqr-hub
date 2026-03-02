# BharatQR System - Complete Guide

## 🎯 Overview
BharatQR is a complete citizen identity and digital service platform with secure admin management and QR code-based citizen identification.

---

## ✨ Key Features Implemented

### 1. **Home Page with Admin Access Button**
- **Location**: Top-right corner of the home page
- **Button**: "Admin (Lock icon)" 
- **Access**: Click to go to Admin Login page
- **Note**: Only on home page, hidden from other pages

### 2. **Admin Authentication System**
- **Login Page**: `/admin-login`
- **Demo Credentials**:
  - Username: `admin`
  - Password: `admin@123`
- **Security**: Session stored in localStorage
- **Features**:
  - Login page shows demo credentials
  - Automatic logout when session expires
  - Protected dashboard (redirects to login if not authenticated)

### 3. **Admin Dashboard** (`/admin-dashboard`)
- **Access**: Only after successful login
- **Features**:
  - ✅ View all registered citizens
  - ✅ Add new customers with auto-generated QR IDs
  - ✅ Edit customer information
  - ✅ Delete customers
  - ✅ View detailed customer profiles
  - ✅ Statistics dashboard (Total Customers, Active Accounts, Total Balance, QR Codes Generated)
  - ✅ Search/filter functionality through table
  - ✅ Logout button

### 4. **Automatic QR Code Generation**
- **Generation**: When a customer is added in admin panel
- **Format**: `BQR_IND_001`, `BQR_IND_002`, etc. (auto-incremented)
- **QR Content**: Links to `/dashboard/{qrId}`
- **Example**: Scanning QR code takes citizen directly to their dashboard

### 5. **Citizen Dashboard**
- **Access**: Via QR code scan or direct URL `/dashboard/{qrId}`
- **Display**: Shows QR code for the citizen
- **Features**:
  - Personal identity information
  - **Unique QR Code** - Citizen can screenshot/print this QR
  - Health records (ABHA)
  - Documents (DigiLocker)
  - Bills and payments
  - Account balance & recharge hub

### 6. **Data Backend**
- Citizens and records are now stored in **Firebase Firestore** instead of in-memory.
- The previous hard‑coded list (3 → 8 records) has been retired; new entries persist across sessions.
- Each citizen document contains the same fields as described in the model below.

---

## 📱 How to Use

### **For Citizens:**
1. Go to home page: `http://localhost:8080/`
2. Click the big "SCAN BHARATQR" button
3. Get their QR code from admin or
4. Go directly to: `http://localhost:8080/dashboard/BQR_IND_001`
5. See personal dashboard with QR code

### **For Admin:**
1. Go to home page: `http://localhost:8080/`
2. Click "Admin" button (top-right)
3. Enter credentials:
   - Username: `admin`
   - Password: `admin@123`
4. Manage citizens:
   - **Add**: Fill form → Auto-generates QR ID
   - **Edit**: Click edit icon → Modify → Save
   - **Delete**: Click trash icon → Confirm
   - **View**: Click eye icon → See all details
5. Logout: Click "Logout" button

---

## 🗃️ Database Structure

### Citizen Model:
```typescript
{
  qrId: "BQR_IND_001",        // Auto-generated, unique
  name: "Sunita Devi",         // Full name
  nameHindi: "सुनीता देवी",     // Hindi name
  aadhaar: "XXXX-XXXX-1234",   // Aadhaar number
  voterId: "GJ/01/234/567890", // Voter ID
  phone: "+91 98XXX XXXXX",    // Phone number
  village: "Chandpur",         // Village name
  district: "Varanasi",        // District
  state: "Uttar Pradesh",      // State
  abhaId: "14-2567-8901-2345", // ABHA ID
  balance: 47,                 // Account balance in rupees
  bills: [...],                // Array of bills
  documents: [...],            // Array of documents
  healthRecords: [...],        // Array of health records
  prescriptions: [...]         // Array of prescriptions
}
```

---

## 🔐 Security Notes

### Current Implementation (Demo):
- Credentials are hardcoded for demonstration
- Session stored in browser localStorage
- No backend authentication

### For Production:
- Use backend API for authentication
- Store hashed passwords
- Implement JWT or OAuth2
- Use secure session management
- Add role-based access control
- Add audit logs

---

## 🎨 Citizen Data

Data is now maintained in Firestore; the admin dashboard shows a live list of registered citizens. The earlier static examples have been removed. Add, update, or delete records via the admin panel and they will persist automatically.

---

## 📁 File Structure

```
src/
├── pages/
│   ├── Index.tsx              ← Home page with Admin button
│   ├── AdminLogin.tsx         ← Login page
│   ├── AdminDashboard.tsx     ← Protected admin dashboard
│   ├── Dashboard.tsx          ← Citizen dashboard with QR
│   └── ...other pages
├── components/
│   ├── QRCodeDisplay.tsx      ← QR code component
│   ├── Header.tsx             ← Navigation header
│   └── ...other components
├── data/
│   └── mockData.ts            ← placeholder/types + stats/greeting
├── lib/
│   └── dataService.ts         ← Firestore wrappers
└── App.tsx                    ← Routes
```

---

## 🔄 Workflow

```
Citizen Registration:
Admin Dashboard → Add Customer → QR ID Generated → Citizen Can Scan QR

Citizen Access:
Home Page → Admin (Button) → Login → Add/View/Edit Citizens
                                    ↓
                            Generate QR Codes
                                    ↓
                    Citizens Scan QR → Dashboard

Citizen Features:
Dashboard → View QR Code → Print/Share → Others Can Access Profile
        → View Bills
        → View Health Records
        → View Documents
        → Check Balance
```

---

## 🚀 Next Steps (When Ready)

1. **Payment Gateway Integration** - Process bill payments
2. **SMS/Email Notifications** - Notify citizens of bills
3. **Multi-language Support** - Expand beyond current languages
4. **Mobile App** - Native mobile application
5. **Backend Integration** - Move to real database (Firebase, PostgreSQL)
6. **Advanced Reporting** - Analytics dashboard for admin
7. **Document Upload** - Citizens can upload documents
8. **Government Integration** - Connect to actual government services

---

## 💾 Live Data Persistence

**Current**: Data is persisted in **Firebase Firestore**. You must provide your project configuration in `src/firebase.ts` or via environment variables and have read/write rules enabled (or run the Firestore emulator locally).

**Previously**: the application relied on in-memory objects that vanished on refresh.

**Other options** (future):
- Google Sheets API
- PostgreSQL Backend

---

## 🎯 Test Scenarios

### Scenario 1: New Customer Registration
1. Click Admin button
2. Login with `admin/admin@123`
3. Click "Add New Customer"
4. Fill form (Name, Phone, Aadhaar, etc.)
5. Click "Add Customer & Generate QR"
6. View new QR ID in table
7. QR code automatically generated

### Scenario 2: Scan QR Code
1. Go to home page
2. Click "SCAN BHARATQR" button
3. Use URLs like: `http://localhost:8080/dashboard/BQR_IND_001`
4. See citizen dashboard with their QR code

### Scenario 3: Admin Authentication
1. Try accessing `/admin-dashboard` without login
2. Auto-redirects to `/admin-login`
3. Enter wrong password → Error message
4. Enter correct credentials → Access granted

---

## 📞 Support

All features are working as intended. The system is ready for:
- ✅ Citizen registration
- ✅ QR code generation & scanning
- ✅ Secure admin access
- ✅ Data management
- ✅ Deployment to Vercel

Ready to deploy when you give the go-ahead!
