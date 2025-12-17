# Product Requirements Document (PRD)

| Project Name | **Version** | **Status** | **Author** | **Last Updated** |
| :--- | :--- | :--- | :--- | :--- |
| Arkive | 1.0 (MVP) | 🟢 Active Development | Arkive Team | December 17, 2025 |

---

## 1. Problem Statement
**The "Why":** Individuals and small teams struggle with file organization across scattered storage solutions. They need secure, fast access to files but existing solutions are either too complex, too expensive, or lack intuitive organization features like starred items and smart search.

**The Solution:** A modern cloud storage platform that combines secure file management with intuitive organization features (folders, starring, trash), real-time search, and a beautiful responsive UI with dark/light mode support. Users can upload files/folders, organize them hierarchically, and access them from anywhere with visual storage analytics.

---

## 2. User Personas
| Persona | Role | Pain Point | Goal |
| :--- | :--- | :--- | :--- |
| **Alex (Freelancer)** | Content Creator | Files scattered across Google Drive, Dropbox, and local storage; wastes time searching for assets. | Wants one centralized place with fast search and visual organization. |
| **Maya (Small Business Owner)** | Team Lead | Needs to share files with team but current solution is too expensive; no visibility into storage usage. | Needs affordable storage with clear usage metrics and easy file sharing. |
| **Jordan (Student)** | University Student | Loses important files; no way to quickly access recent documents or mark favorites. | Wants starred files, recent access history, and simple upload/download. |

---

## 3. User Stories (Functional Requirements)
*These define the scope of the MVP.*

### **Epic 1: Authentication & User Management**
- [x] As a user, I want to sign up with email/username/password so I can create my account.
- [x] As a user, I want to verify my email via OTP code for security.
- [x] As a user, I want to sign in with either email or username for flexibility.
- [x] As a user, I want to upload a profile image during sign-up to personalize my account.
- [x] As a user, I want to view and edit my profile (name, profile image) in a dedicated profile page.

### **Epic 2: File & Folder Management**
- [x] As a user, I want to upload individual files to store my documents securely.
- [x] As a user, I want to upload entire folders with nested structure preserved.
- [x] As a user, I want to create new folders to organize my files hierarchically.
- [x] As a user, I want to navigate through folder breadcrumbs to understand my location.
- [x] As a user, I want to move files/folders between locations to reorganize my storage.
- [x] As a user, I want to rename files and folders to keep my storage organized.

### **Epic 3: Organization & Quick Access**
- [x] As a user, I want to star important files/folders so I can quickly access them later.
- [x] As a user, I want a dedicated "Starred" view showing all my starred items.
- [x] As a user, I want to see recent files on my dashboard for quick access.
- [x] As a user, I want to search files and folders by name across my entire storage.
- [x] As a user, I want to view my storage usage breakdown by file type (documents, images, videos).

### **Epic 4: Trash & Recovery**
- [x] As a user, I want to move files/folders to trash instead of immediate deletion for safety.
- [x] As a user, I want to restore items from trash if I deleted them by mistake.
- [x] As a user, I want to permanently delete items from trash to free up space.
- [x] As a user, I want to empty trash in bulk to quickly clean up deleted items.

### **Epic 5: UI/UX & Theming**
- [x] As a user, I want dark/light mode toggle to match my preference and reduce eye strain.
- [x] As a user, I want a responsive sidebar with navigation to access different sections.
- [x] As a user, I want visual indicators (file type icons, colors) to quickly identify content.
- [x] As a user, I want toast notifications for all actions to get immediate feedback.

---

## 4. UI/UX Wireframes
*Key interface components implemented.*

### **Landing Page**
- Hero section with gradient background and animated floating elements
- Features showcase with icons and descriptions
- Call-to-action buttons (Get Started, Sign In)
- Dark/light mode toggle in navbar

### **Dashboard Layout**
```
┌─────────────────────────────────────────────────┐
│  Header: Search | ThemeToggle | New | SignOut   │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main Content Area                   │
│          │  ┌──────────────┐ ┌──────────────┐  │
│ My Files │  │ Storage Card │ │ Recent Files │  │
│ Starred  │  │  (Overview)  │ │   (List)     │  │
│ Trash    │  └──────────────┘ └──────────────┘  │
│ Profile  │                                      │
│          │  File/Folder Grid View               │
└──────────┴──────────────────────────────────────┘
```

### **File/Folder Actions**
- Grid layout with visual cards showing file type icons
- Dropdown menu (3-dot) for: Star, Trash, Move
- Breadcrumb navigation for folder hierarchy

---

## 5. Non-Functional Requirements
*Technical constraints and performance goals.*

1. **Performance:** 
   - Dashboard must load and display storage overview in under **2 seconds**.
   - Search results must appear within **500ms** of typing.
   - File uploads must support batch operations with progress feedback.

2. **Scalability:** 
   - Database must efficiently query files/folders for users with **10,000+ items**.
   - Support concurrent file uploads (up to 10 files at once).
   - ImageKit CDN handles media delivery with optimized bandwidth.

3. **Security:**
   - All authentication handled via Clerk with secure session management.
   - Files stored on ImageKit with signed URLs for secure access.
   - Database uses PostgreSQL with proper indexing on userId, folderId, starred, trashed fields.
   - User data isolated by ownerId to prevent cross-user access.

4. **Reliability:**
   - Soft-delete (trash) protects against accidental data loss.
   - Real-time event system (`files:updated`) keeps UI in sync across tabs.
   - Error handling with user-friendly toast messages for all operations.

5. **Accessibility:**
   - Dark/light mode with OKLCH color scheme for proper contrast.
   - Keyboard navigation support for all actions.
   - Screen reader labels (`sr-only` spans) for icon-only buttons.

---

## 6. Database Schema (High Level)
*See `ARCHITECTURE.md` for full details.*

### **Core Tables**

**Users** (Managed by Clerk)
- id, email, username, firstName, lastName, profileImage

**Folders**
- id, name, ownerId, parentId (nullable, for nested folders)
- starred (boolean), trashed (boolean)
- createdAt, updatedAt

**Files**
- id, name, url, thumbnailUrl, size, mimetype
- ownerId, folderId (nullable, for root-level files)
- starred (boolean), trashed (boolean)
- createdAt, updatedAt

### **Indexes**
- `folders(ownerId, parentId, trashed)` - Fast folder listing
- `files(ownerId, folderId, trashed)` - Fast file retrieval
- `files(ownerId, starred)` - Starred items query
- `files(ownerId, createdAt DESC)` - Recent files query

---

## 7. API Endpoints
*REST API structure.*

### **Authentication** (Handled by Clerk)
- `POST /api/sign-up` - User registration
- `POST /api/sign-in` - User login
- `POST /api/sign-out` - User logout

### **Files**
- `GET /api/files` - List files (query params: ownerId, folderId, starred, trashed)
- `POST /api/files/upload` - Upload single file
- `GET /api/files/recent` - Get recent files
- `PATCH /api/files/[fileId]/star` - Toggle star status
- `PATCH /api/files/[fileId]/trash` - Toggle trash status
- `PATCH /api/files/[fileId]/update` - Update file (move, rename)
- `DELETE /api/files/[fileId]/delete` - Permanently delete

### **Folders**
- `GET /api/folders` - List folders (query params: ownerId, parentId, starred, trashed)
- `POST /api/folders/create` - Create folder
- `POST /api/folders/upload` - Upload folder structure
- `PATCH /api/folders/[folderId]/star` - Toggle star status
- `PATCH /api/folders/[folderId]/trash` - Toggle trash status
- `PATCH /api/folders/[folderId]/update` - Update folder (move, rename)
- `DELETE /api/folders/[folderId]/delete` - Permanently delete

### **Storage & Search**
- `GET /api/storage` - Get storage analytics (usage, breakdown by type)
- `GET /api/search` - Search files/folders by name
- `DELETE /api/empty-trash` - Empty all trash items

---

## 8. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | Server-side rendering, routing |
| **UI Library** | shadcn/ui + Tailwind CSS | Pre-built components, styling |
| **State Management** | React Hooks (useState, useCallback) | Client-side state |
| **Authentication** | Clerk | User management, OAuth, sessions |
| **Database** | PostgreSQL (Neon) | Relational data storage |
| **ORM** | Drizzle | Type-safe database queries |
| **File Storage** | ImageKit | CDN, image optimization, uploads |
| **Validation** | Zod | Schema validation |
| **Icons** | Lucide React | Consistent icon system |
| **Theming** | next-themes | Dark/light mode persistence |
| **Notifications** | Sonner | Toast messages |

---

## 9. Future Roadmap (Post-MVP)
*Features we are NOT building yet, but planning for later.*

- [ ] **File Sharing:** Generate public/private links for files/folders with expiration dates.
- [ ] **Collaboration:** Invite team members to shared workspaces with role-based permissions.
- [ ] **File Preview:** In-browser preview for PDFs, images, videos without downloading.
- [ ] **Version History:** Track file versions and allow rollback to previous versions.
- [ ] **Advanced Search:** Search by file type, date range, size, and content (OCR/text extraction).
- [ ] **Bulk Operations:** Select multiple files/folders for batch actions (move, delete, download).
- [ ] **Mobile App:** Native iOS/Android apps with offline sync.
- [ ] **Integrations:** Connect to Dropbox, Google Drive, OneDrive for import/export.
- [ ] **AI Features:** Auto-tagging, duplicate detection, smart folders.
- [ ] **Storage Plans:** Tiered pricing with storage quotas (5GB free, 100GB premium, 1TB business).

---

## 10. Success Metrics
*How do we know we succeeded?*

### **User Activation**
1. **Onboarding:** User can sign up, verify email, and upload first file within **3 minutes**.
2. **Retention:** 70% of users return within 7 days to upload additional files.

### **Performance**
1. **Load Time:** Dashboard loads storage overview in under **2 seconds** on 3G connection.
2. **Search Speed:** Search results appear within **500ms** for databases with 10,000+ items.

### **Reliability**
1. **Uptime:** 99.5% uptime for core features (upload, download, search).
2. **Data Safety:** Zero accidental permanent deletions (trash system works 100% of the time).

### **User Satisfaction**
1. **Task Completion:** 95% of users successfully complete core tasks (upload, organize, search).
2. **Feature Usage:** 60% of users use at least one organization feature (star, folder, search) within first week.

---

## 11. Constraints & Assumptions

### **Constraints**
- **ImageKit Limits:** Free tier supports 20GB bandwidth/month; may need upgrade for >100 users.
- **Clerk Limits:** Free tier supports 10,000 MAU (Monthly Active Users).
- **Database:** Neon free tier has 0.5GB storage; need to monitor and upgrade as user base grows.

### **Assumptions**
- Users primarily access via desktop web browser (mobile-first design for future).
- Average user uploads <50 files per week.
- Most files are documents/images (<10MB each); large video files are edge cases.
- Users understand folder hierarchy concept from other file managers.

---

## 12. Open Questions & Decisions Needed
*Issues to resolve before next milestone.*

- [ ] **File Size Limits:** Should we enforce a per-file size limit (e.g., 100MB)?
- [ ] **Storage Quotas:** When do we implement per-user storage limits?
- [ ] **Pricing Model:** Freemium vs. subscription vs. one-time payment?
- [ ] **File Retention:** How long do we keep trashed files before auto-deletion (30 days, 60 days)?
- [ ] **Public Beta:** When do we open registration to external users?

---

## Appendix: Related Documents
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and technical design
- [API.md](./API.md) - Detailed API reference with request/response examples
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Setup instructions and deployment guide
- [README.md](../README.md) - Project overview and quick start
