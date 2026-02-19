# Siddhivinayak Realtors and Associates (SRA) Website

A comprehensive, responsive website for banking loan services and bank-sealed auction properties, complete with a full admin management system, meeting scheduling, and a multi-property inquiry cart.

---

## 🌟 Features

### 🏠 Public Website
- **Hero Section** with glassmorphism effects and gradient backgrounds
- **Loan Services** — Business Loan, Home Loan, Personal Loan, Mortgage Loan
- **Bank-Sealed Auction Properties** with filtering by type, location, and price range
- **Required Documents** section with visual guides
- **About Us** & **Contact Form**
- **Responsive Design** — mobile, tablet, desktop compatible

### 🔐 Authentication System
- User registration and login (`login.html`, `register.html`)
- Session management via `localStorage`
- Role-based access control — **Admin** / **User**
- Indian phone number validation (+91, 10-digit starting with 6–9)
- Password strength indicator
- Property details **blurred** for non-logged-in visitors

### 📅 Meeting Scheduling
- Users can schedule a meeting directly from any loan service card
- Form captures: Name, Phone, Email, **Location** (area-wise dropdown), Preferred Date & Time, Loan Amount, Employment Type, Message
- **Location dropdown** grouped by city: Mumbai (25 areas), Navi Mumbai (15), Nashik (13), Pune (29)
- Meetings stored in `localStorage` with status tracking

### 🏢 Multi-Property Inquiry Cart
- Logged-in users can select **up to 3 properties** for a single inquiry
- **Floating "Inquire Selected" button** appears when 1+ properties are selected
- **Property Inquiry Modal** shows selected properties + a full meeting scheduling form
- Inquiry is submitted as a special `property-inquiry` type meeting

### 🗓️ My Meetings Tab (User-Side)
- Dedicated **"My Meetings"** link in navbar — visible only for logged-in users
- Shows all meeting requests (loan meetings + property inquiries) in card format
- Status displayed clearly:
  - ⏳ **Pending** — "Under review" notice
  - ✅ **Confirmed** — Confirmed date, time, and admin note
  - ❌ **Cancelled** — Cancellation reason + date
- Clicking Home/Loans/etc restores the normal page view

### 🛠️ Admin Panel (`admin.html`)
- **Dashboard** — Total properties, featured, visible, pending meetings count
- **Property Management** — Add, Edit, Delete, toggle visibility & featured status
- **Meeting Requests Table** — Shows all meetings with:
  - Client name, phone, email
  - Type (Loan Meeting or Property Inquiry with property list)
  - Location, preferred date/time, employment type
  - Status badges (Pending / Confirmed / Cancelled)
  - Cancellation reason and date for cancelled meetings
- **Confirm Meeting** — Admin picks a confirmed date/time and adds a note for the client
- **Cancel Meeting** — Admin must provide a **mandatory cancellation reason** (stored permanently for audit/security records)
- **Delete Meeting** — Permanently remove a meeting record
- **Responsive sidebar** with mobile-friendly hamburger toggle

---

## 📁 Project Structure

```
Official-work-prototype/
├── index.html              # Main homepage (all sections + modals)
├── login.html              # Login page
├── register.html           # Registration page
├── admin.html              # Admin dashboard
├── css/
│   ├── main.css            # Core styles and design system
│   ├── glassmorphism.css   # Glass effect utilities
│   └── responsive.css      # Media queries & responsiveness
├── js/
│   ├── auth.js             # Authentication (login, register, session, role)
│   ├── properties.js       # PropertyManager — CRUD, filtering, formatting
│   ├── loan-applications.js# Loan application form logic
│   ├── meeting-schedule.js # Meeting CRUD, My Meetings page, inquiry form
│   ├── main.js             # Property cards, inquiry cart, nav logic
│   └── admin.js            # Admin panel — tables, confirm/cancel/delete
└── assets/
    └── images/             # Logo and static images
```

---

## 🔐 Default Admin Credentials

| Field    | Value          |
|----------|----------------|
| Email    | admin@sra.com  |
| Password | admin123       |

> ⚠️ **Change these credentials before any production use!**

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No backend server required — runs entirely client-side

### Run Locally

```powershell
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server

# Then open: http://localhost:8000
```

Or simply double-click `index.html`.

---

## 💻 Usage

### For Visitors (Not Logged In)
- View loan services and pricing
- Browse properties (details blurred — login required to view full details)
- Fill the Contact form

### For Logged-In Users
1. **View Properties** — Full details, auction dates, prices
2. **Add to Inquiry Cart** — Select up to 3 properties → click "Inquire Selected" floating button → submit inquiry + meeting request
3. **Schedule Meeting** — Click "Schedule Meeting" on any loan card → fill form with preferred location, date & time
4. **My Meetings Tab** — Track all meeting/inquiry statuses in one place (Pending / Confirmed / Cancelled with reason)

### For Administrators
1. **Login** → redirected to `admin.html`
2. **Dashboard** — Quick stats overview
3. **Manage Properties** — Add/Edit/Delete, toggle visibility and featured status
4. **Meeting Requests** — View all meetings:
   - **Confirm** → pick a date/time and add a note
   - **Cancel** → must provide a written reason (saved to data for audit)
   - **Delete** → permanently remove record

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic markup |
| CSS3 (Vanilla) | Custom design, Flexbox, Grid |
| JavaScript ES6+ | All client-side logic |
| Bootstrap 5.3 | Responsive layout & components |
| Bootstrap Icons | Icon library |
| Google Fonts (Poppins & Inter) | Typography |
| LocalStorage API | Data persistence (no backend) |

---

## 🎨 Design System

- **Colors**: Deep Blue `#1e3a8a` · Gold `#f59e0b` · Teal `#14b8a6`
- **Effects**: Glassmorphism — frosted glass cards with `backdrop-filter: blur`
- **Fonts**: Poppins (headings), Inter (body)
- **Animations**: Fade-in on scroll, hover lifts, smooth transitions

### Responsive Breakpoints
| Breakpoint | Range |
|---|---|
| Mobile | < 480px |
| Small Tablet | 481px – 768px |
| Tablet | 769px – 1024px |
| Desktop | 1025px – 1440px |
| Large Desktop | > 1441px |

---

## 💾 Data Storage (localStorage Keys)

| Key | Contents |
|---|---|
| `sra_users` | Registered users array |
| `sra_session` | Currently logged-in user session |
| `sra_properties` | Property listings |
| `sra_meetings` | All meeting requests (loan + property inquiry) |

Each meeting record includes:
```json
{
  "id": 1708000000000,
  "type": "loan-meeting | property-inquiry",
  "status": "pending | confirmed | cancelled",
  "name": "...", "phone": "...", "email": "...",
  "location": "Baner, Pune",
  "preferredDate": "2026-03-01",
  "preferredTime": "10:00 AM - 11:00 AM",
  "properties": [...],
  "confirmedDate": "...", "confirmedTime": "...", "adminNote": "...",
  "cancellationReason": "...", "cancelledAt": "...", "cancelledBy": "admin",
  "submittedAt": "2026-02-19T21:00:00.000Z"
}
```

---

## ⚠️ Production Considerations

This is a **client-side prototype** intended for demonstrations. For production:

- Replace `localStorage` with a real database (MySQL, MongoDB, PostgreSQL)
- Implement server-side authentication (JWT / OAuth)
- Hash passwords (bcrypt / argon2)
- Add CSRF protection, rate limiting, HTTPS
- Host images on cloud storage (AWS S3, Cloudinary)
- Add email/SMS notifications for meeting confirmations

---

## 📄 License

Created for Siddhivinayak Realtors and Associates. Free to use and modify for business purposes.

## 👥 Contact

**Siddhivinayak Realtors and Associates**  
📧 info@sra.com · 📞 +91 98765 43210 · 📍 Pune, Maharashtra

---

*Built with ❤️ — Your trusted partner in financial solutions and real estate investments*
