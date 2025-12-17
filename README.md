# Arkive 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18%2B-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

> **One-liner pitch:** Secure, fast, and collaborative cloud storage with Clerk auth, ImageKit uploads, and streamlined file organization.

---

![App Screenshot](./public/Arkive.png)


---

## 🧐 About The Project

**Arkive** is a modern cloud storage web app that lets teams and individuals upload, organize, search, and manage files securely. It solves the pain of scattered storage by combining folders, starring, trash, and search into one streamlined workspace with dark/light themes and responsive UI.

**Key Features:**
* ✅ **Secure Auth:** Clerk-powered sign-up/sign-in with username support and profile images.
* ✅ **File & Folder Ops:** Upload files/folders, move, rename, star, trash, and restore.
* ✅ **Search & Recent:** Fast search endpoint plus recent files view for quick access.
* ✅ **Trash & Empty Trash:** Soft-delete with bulk empty and restore flows.
* ✅ **Dark/Light Mode:** next-themes toggle with persisted preference.
* ✅ **Responsive UI:** shadcn/ui + Tailwind for a polished, adaptive experience.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| **Auth** | Clerk (Hosted) |
| **Storage & Media** | ImageKit (uploads/URL signing), Next.js API routes |
| **Database** | PostgreSQL (Neon) with Drizzle ORM |
| **Theming & UX** | next-themes, lucide-react icons, sonner toasts |
| **Tooling** | ESLint, Prettier, npm/pnpm scripts |

---

## 📚 Engineering Docs

Docs folder is coming soon. For now, key entry points:
* **API routes:** `src/app/api/*` (files, folders, search, upload, trash, star, delete)
* **Schemas:** `src/lib/schema.ts` and Zod schemas in `src/schemas/*`
* **UI:** Components in `src/components/*` (Header, Sidebar, Modals, ThemeToggle)
* **Types:** Centralized in `src/types/*`

---

## ⚡ Quick Start

**1) Clone the repo**
```bash
git clone https://github.com/yourusername/arkive.git
cd arkive
```

**2) Install dependencies**
```bash
npm install
# or
pnpm install
```

**3) Set up environment variables**
```bash
cp .env.sample .env
# then fill in your Clerk, ImageKit, and DATABASE_URL values
```

**4) Run the development server**
```bash
npm run dev
```
Visit http://localhost:3000

**Optional checks**
```bash
npm run lint
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you’d like to change.
1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing`
5. Open a Pull Request

---

## 👤 Author

Leonardo Fernandes
- GitHub: [@Leonardo1903](https://github.com/Leonardo1903)
- LinkedIn: [leonardofernandes1903](https://www.linkedin.com/in/leonardofernandes1903/)

---

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.
