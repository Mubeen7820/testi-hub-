# 🌟 TestimonialHub — AI-Powered Testimonial Automation Tool

> Transform raw chat screenshots into stunning, brand-ready testimonials in seconds.

TestimonialHub is a full-stack, privacy-first automation platform that extracts testimonials from WhatsApp, Messenger, and other chat screenshots using local AI/OCR — no external APIs, no data leaks.

---

## 🚀 Live Demo

> Hosted at: `http://localhost:3002` (run locally — see setup below)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Extraction** | Automatically detects chat bubbles, timestamps, and names via Tesseract.js OCR |
| 📦 **Batch Processing** | Upload multiple screenshots and generate a full "Wall of Love" in one click |
| 🎨 **Premium Templates** | 10+ layouts: Minimal, Instagram, WhatsApp, Dark Premium, Glassmorphism, Geometric, Happy Bubble, Deep Burgundy, Classic Parchment, Corporate Grid, Azure Bubble |
| 🛠️ **Instant Customization** | Change fonts, colors, and layouts without any design skills |
| 🕒 **History Management** | Review, edit, or delete all past testimonials |
| 🏆 **Wall of Love** | Showcase approved testimonials in a curated, embeddable gallery |
| 🔒 **Privacy-First** | All OCR runs locally in your browser — images never leave your device |
| 📊 **Settings & Profile** | Full user profile management with preferences saved to the database |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Shadcn UI**
- **Zustand** (state management)
- **Tesseract.js** (local browser OCR)
- **Lucide React** (icons)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **SQLite** (development)
- **JWT** authentication
- **Bcrypt** password hashing
- **Multer** (file uploads)

---

## 📁 Project Structure

```
testimonial-automation-tool/
├── frontend/                  # React + Vite client
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level pages
│   │   ├── store/             # Zustand state stores
│   │   ├── lib/               # Axios config, utilities
│   │   └── types/             # TypeScript types
│   └── vite.config.ts
├── backend/                   # Express API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Auth & validation middleware
│   │   └── index.ts           # Server entry point
│   └── prisma/
│       └── schema.prisma      # Database schema
├── package.json               # Root scripts (runs both services)
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Sahithi1346/MXC.git
cd MXC
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=5000
```

### 4. Initialize the Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 5. Start the Application

```bash
# From the project root — starts both frontend and backend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3002 |
| Backend API | http://localhost:5000 |

---

## 📖 Usage Guide

1. **Register / Sign In** — Create an account or sign in via the Auth page.
2. **Create Testimonial** — Upload a WhatsApp / Messenger screenshot and click **"Extract with AI"**.
3. **Review & Edit** — Fine-tune the extracted name, role, and message.
4. **Choose Template** — Pick from 10+ premium layouts and adjust font/color.
5. **Export** — Download as a high-quality PNG.
6. **Batch Process** — Use the Batch tab to handle multiple screenshots at once.
7. **Wall of Love** — Approve testimonials to display them in the public gallery.
8. **History** — Manage, edit, or delete all past testimonials from the History page.

---

## 🗺️ API Endpoints (Backend)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/testimonials` | Get all testimonials for user |
| `POST` | `/api/testimonials` | Create a new testimonial |
| `PUT` | `/api/testimonials/:id` | Update a testimonial |
| `DELETE` | `/api/testimonials/:id` | Delete a testimonial |
| `GET` | `/api/users/profile` | Get current user profile |
| `PUT` | `/api/users/profile` | Update user profile |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by **Sahithi** — MXC Internship Project
