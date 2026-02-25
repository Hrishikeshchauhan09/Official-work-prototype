# Siddhivinayak Realtors and Associates (SRA) Website

A comprehensive, responsive website for banking loan services and bank-sealed auction properties, complete with a full admin management system, meeting scheduling, multi-property inquiry cart, media galleries, and PDF report generation.

---

## 🌟 Features

### 🏠 Public Website
- **Hero Section** with glassmorphism effects and gradient backgrounds
- **Loan Services** — Business Loan, Home Loan, Personal Loan, Mortgage Loan
- **Bank-Sealed Auction Properties** with filtering by type, location, and price range
- **Required Documents** section with visual guides
- **About Us** — 50+ bank partnerships, customer-centric highlights
- **Contact Form** with Google Maps integration
- **Responsive Design** — mobile, tablet, desktop compatible

### 🔐 Authentication System
- User registration and login (`login.html`, `register.html`)
- Session management via `localStorage`
- Role-based access control — **Admin** / **User**
- Indian phone number validation (+91, 10-digit starting with 6–9)
- Password strength indicator
- Property details **blurred** for non-logged-in visitors

### 🖼️ Property Media Gallery (Multi-Image + Video)
- Each property supports **up to 6 images** displayed as a **Bootstrap Carousel**
- Optional **Video Tour** (YouTube embed or direct mp4 link)
- Carousel arrows overlay the image — works on all screen sizes including mobile
- Clicking any image opens a **fullscreen Lightbox Modal** with prev/next navigation
- Video slide shows a 🎬 play button — opens embedded video in lightbox
- Media count badges (e.g. `🖼 3 · ▶ Video`) on each card for quick reference
- Logged-out users still see only a single blurred image (no carousel)

### 📅 Meeting Scheduling
- Users can schedule a meeting directly from any loan service card
- Form captures: Name, Phone, Email, **Location** (area-wise dropdown), Preferred Date & Time, Loan Amount, Employment Type, Message
- **Location dropdown** grouped by city: Mumbai (25 areas), Navi Mumbai (15), Nashik (13), Pune (29), Panvel
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
  - **Multi-Image Upload** — Add up to 6 image URLs per property with dynamic add/remove rows
  - **Video URL** — Optional YouTube or direct mp4 link per property
  - Admin table shows image count badge and video indicator per property
- **Meeting Requests Table** — Shows all meetings with:
  - Client name, phone, email
  - Type (Loan Meeting or Property Inquiry with property list)
  - Location, preferred date/time, employment type
  - Status badges (Pending / Confirmed / Cancelled)
  - Cancellation reason and date for cancelled meetings
- **Confirm Meeting** — Admin picks a confirmed date/time and adds a note for the client
- **Cancel Meeting** — Admin must provide a **mandatory cancellation reason** (stored permanently for audit/security records)
- **Delete Meeting** — Permanently remove a meeting record
- **📄 PDF Report Download** — Download meeting data as a branded PDF report:
  - **This Week** / **This Month** / **This Year** / **All Records**
  - PDF includes: SRA header banner, summary stats (Total/Pending/Confirmed/Cancelled), full color-coded meeting table, page footer
  - Auto-named: `SRA_Meeting_Report_Monthly_25-02-2026.pdf`
- **Responsive sidebar** with mobile-friendly hamburger toggle

---

## 📁 Project Structure

```
Official-work-prototype/
├── index.html              # Main homepage (all sections + modals + lightbox)
├── login.html              # Login page
├── register.html           # Registration page
├── admin.html              # Admin dashboard
├── css/
│   ├── main.css            # Core styles and design system
│   ├── glassmorphism.css   # Glass effect utilities
│   └── responsive.css      # Media queries & responsiveness
├── js/
│   ├── auth.js             # Authentication (login, register, session, role)
│   ├── properties.js       # PropertyManager — CRUD, filtering, images[], videoUrl
│   ├── loan-applications.js# Loan application form logic
│   ├── meeting-schedule.js # Meeting CRUD, My Meetings page, inquiry form
│   ├── main.js             # Property cards, carousel, lightbox, inquiry cart, nav
│   └── admin.js            # Admin panel — tables, confirm/cancel/delete, PDF export
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
- Internet connection required for CDN libraries (Bootstrap, jsPDF, etc.)

### Run Locally

```powershell
# Option 1: Node.js
npx http-server

# Option 2: Python
python -m http.server 8000

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
2. **Browse Media Gallery** — Scroll through multiple images via carousel arrows; click any image to open fullscreen lightbox; click 🎬 to watch video tour
3. **Add to Inquiry Cart** — Select up to 3 properties → click "Inquire Selected" floating button → submit inquiry + meeting request
4. **Schedule Meeting** — Click "Schedule Meeting" on any loan card → fill form with preferred location, date & time
5. **My Meetings Tab** — Track all meeting/inquiry statuses in one place (Pending / Confirmed / Cancelled with reason)

### For Administrators
1. **Login** → redirected to `admin.html`
2. **Dashboard** — Quick stats overview
3. **Manage Properties** — Add/Edit/Delete with multi-image URLs and optional video
4. **Meeting Requests** — View all meetings:
   - **Confirm** → pick a date/time and add a note
   - **Cancel** → must provide a written reason (saved to data for audit)
   - **Delete** → permanently remove record
5. **Download PDF Report** → Click the red "📄 Download Report" button → choose Weekly / Monthly / Yearly / All → PDF auto-downloads

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic markup |
| CSS3 (Vanilla) | Custom design, Flexbox, Grid |
| JavaScript ES6+ | All client-side logic |
| Bootstrap 5.3 | Responsive layout & components, Carousel, Modals |
| Bootstrap Icons | Icon library |
| Google Fonts (Poppins & Inter) | Typography |
| LocalStorage API | Data persistence (no backend) |
| jsPDF 2.5.1 | Client-side PDF generation |
| jsPDF-AutoTable 3.8.2 | PDF table formatting |

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
| `sra_properties` | Property listings (with `images[]` and `videoUrl`) |
| `sra_meetings` | All meeting requests (loan + property inquiry) |

### Property Record Schema
```json
{
  "id": 1,
  "title": "Luxury Villa in Pune",
  "type": "residential",
  "location": "Koregaon Park, Pune",
  "price": 12500000,
  "area": "3500 sq ft",
  "bedrooms": 4,
  "bathrooms": 3,
  "image": "https://...",
  "images": ["https://...", "https://...", "https://..."],
  "videoUrl": "https://youtube.com/embed/...",
  "status": "available",
  "visible": true,
  "featured": true,
  "auctionDate": "2026-03-20",
  "dateAdded": "2026-01-15T00:00:00.000Z"
}
```

### Meeting Record Schema
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
  "submittedAt": "2026-02-25T07:40:54.000Z"
}
```

---

## ⚠️ Production Considerations

This is a **client-side prototype** intended for demonstrations. For production:

- Replace `localStorage` with a real database (MySQL, MongoDB, PostgreSQL)
- Implement server-side authentication (JWT / OAuth)
- Hash passwords (bcrypt / argon2)
- Add CSRF protection, rate limiting, HTTPS
- Host images/videos on cloud storage (AWS S3, Cloudinary)
- Add email/SMS notifications for meeting confirmations
- Implement server-side PDF generation for larger datasets

---

## 📄 License

Created for Siddhivinayak Realtors and Associates. Free to use and modify for business purposes.

## 👥 Contact

**Siddhivinayak Realtors and Associates**  
📧 info@sra.com · 📞 +91 98765 43210 · 📍 Pune, Maharashtra

---

*Built with ❤️ — Your trusted partner in financial solutions and real estate investments*
