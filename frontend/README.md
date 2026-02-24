# IIIT Dharwad Admission System - Frontend Only

A modern, responsive React + Tailwind CSS admission portal for IIIT Dharwad students.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view in your browser.

## 📋 Features

### ✅ User Authentication
- Register with email and password
- Login to existing account
- Logout and session management

### ✅ Step 1: Personal Details
Fill in 11 form fields:
- First & Last Name
- Father & Mother Name
- JEE Roll Number
- Date of Birth
- Caste & Category
- Gender
- Phone Number
- Address

### ✅ Step 2: Document Upload
Upload 5 required documents:
- JEE Admit Card
- Aadhar Card
- Seat Allotment Letter
- 10th Marksheet
- 12th Marksheet

**Formats:** PDF, JPG, PNG (Max 10MB each)

### ✅ Step 3: Payment
- Generate mock payment link
- Display amount (₹1000)
- Confirm payment completion
- Get transaction ID

### ✅ Step 4: Final Submission
- Submit complete application
- Check submission status
- View admin remarks

## 🏗️ Project Structure

```
admission/
├── src/
│   ├── App.jsx                    # Main app
│   ├── index.js                   # Entry point
│   ├── index.css                  # Tailwind imports
│   │
│   ├── context/
│   │   ├── AuthContext.jsx        # Auth (login/register)
│   │   └── AdmissionContext.jsx   # Admission data
│   │
│   ├── hooks/
│   │   └── useContext.js          # Custom hooks
│   │
│   ├── components/
│   │   ├── Navbar.jsx             # Navigation
│   │   ├── Stepper.jsx            # Step indicator
│   │   └── FormComponents.jsx     # Reusable components
│   │
│   └── pages/
│       ├── LoginRegisterPage.jsx  # Auth
│       ├── DashboardPage.jsx      # Main
│       ├── PersonalDetailsPage.jsx # Step 1
│       ├── DocumentsPage.jsx      # Step 2
│       ├── PaymentPage.jsx        # Step 3
│       └── StatusPage.jsx         # Step 4
│
├── public/
│   └── index.html
│
├── tailwind.config.js             # Tailwind config
├── postcss.config.js              # PostCSS
├── package.json                   # Dependencies
└── README.md                       # Documentation
```

## 💾 Data Storage

All data stored in **browser localStorage**:
- User credentials
- Admission form data
- Uploaded documents (base64)
- Payment info

**Clear data:**
```javascript
localStorage.clear();
```

## 🎨 Colors

- Primary: #1f3a7f (IIIT Blue)
- Secondary: #ff6b6b (Coral)
- Success: #51cf66 (Green)
- Warning: #ffd43b (Yellow)
- Danger: #ff6b6b (Red)

## 📱 Responsive

- Mobile: < 768px
- Tablet: 768-1024px
- Desktop: > 1024px

## 🔧 Scripts

```bash
npm start        # Development mode
npm run build    # Production build
npm test         # Run tests
```

## 📦 Dependencies

- **react** 18.2.0
- **tailwindcss** 3.3.5
- **postcss** 8.4.31
- **react-scripts** 5.0.1

## 🧪 Test Account

Register with any email/password combination. Example:
```
Email: test@example.com
Password: password123
```

## ⚠️ Important Notes

This is a **frontend-only** application:
- Data stored locally (not secure for production)
- No server-side validation
- Mock payment gateway
- For demo/development only

For production, integrate with a proper backend API.

## 🚀 Production Build

```bash
npm run build
serve -s build
```

## 🐛 Troubleshooting

**App won't start:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

**Styles not loading:**
- Clear browser cache
- Check `tailwind.config.js`
- Verify `src/index.css` imports

**localStorage full:**
```javascript
localStorage.clear();
```

## 📚 Component Reference

### AuthContext
- `register(email, password, confirmPassword)`
- `login(email, password)`
- `logout()`

### AdmissionContext
- `submitPersonalDetails(admissionId, details)`
- `uploadDocument(admissionId, type, file)`
- `deleteDocument(admissionId, docId)`
- `generatePaymentLink(admissionId)`
- `confirmPayment(admissionId)`
- `submitAdmission(admissionId)`

### FormComponents
- `FormGroup` - Input wrapper
- `Button` - Button variants
- `Alert` - Message alerts
- `Card` - Container
- `Loading` - Spinner
- `Stepper` - Step indicator

## 📄 License

Educational project for IIIT Dharwad.

---

**Version:** 2.0.0 (Frontend Only)
**Status:** ✅ Ready to Use
