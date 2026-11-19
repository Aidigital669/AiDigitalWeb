# 🚀 BizzMaker — Digital Marketing Platform & Admin CMS

**BizzMaker** is a high-performance Next.js digital marketing agency platform featuring dynamic portfolio showcases, pricing plans, automated lead capture, and an administrative CMS suite.

---

## 🌟 Key Features

### 1. Core BizzMaker Digital Marketing Website
- Full responsive marketing website with interactive showcases, services, client portfolios, transparent pricing, and blogs.
- Lead capture via contact forms, WhatsApp integration, and career job applications.
- Direct payment integration with Razorpay.

### 2. Administrative CMS Portal (`/admin`)
- **Live Visitor Traffic & Geo Analytics**: Track live visitors, bounce rates, and referrer campaigns.
- **Page & Section Visibility Controls**: Toggle individual sections and pages on/off dynamically.
- **Industry Plans & Pricing Manager**: Manage service tiers, pricing, and custom package configurations.
- **Portfolio Showcase Manager**: Curate and publish portfolio projects and client case studies.
- **Blog & Article Editor**: Publish and manage SEO-optimized agency articles.
- **WhatsApp Automation Alerts**: Manage client notification logs and sales alerts.
- **Onboarding & Lead Submissions**: Review client onboarding inquiries and contact leads.
- **Career Job Applications**: Review candidate resumes and application data.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Database**: MySQL (`mysql2/promise`) with graceful JSON fallbacks
- **Payments**: Razorpay
- **Styling**: Tailwind CSS / Vanilla CSS

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Ensure your `.env` contains:
```env
ADMIN_EMAIL=admin@aidigital.com
ADMIN_PASSWORD=Ai_Digital@0701
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ai_digital
DB_USER=root
DB_PASSWORD=
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
