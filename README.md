# PVKN Govt College (A) Chittoor — College Management System

A complete web application for the **Department of Computer Applications** with
separate portals for **Super Admin, HOD, Faculty and Students**.

Built with React + Vite + Tailwind CSS on the frontend, backed by **Firebase**
(Auth + Firestore). The app is **Firebase-only** — there is no local demo store,
so configure the project first (see **Connect Firebase**).

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Log in with an
existing account, or create a student account at `/signup`.

### Accounts

| Who        | How they get an account |
| ---------- | ----------------------- |
| **Super Admin** | Provisioned manually. The account is **`vrvijayrahul@gmail.com`** (display name **VR Rahul**). Its `users/{uid}` document **must** carry `role: "superadmin"` — that is what gates the `/admin` portal. Take care not to delete it; if the account or its profile doc is ever lost, recreate the Auth user and re-write `users/{uid}` with `role: "superadmin"`. |
| **Students** | Self-register at **`/signup`** (name, roll number, program, semester, section, email, password). This creates their Auth account, a `students/{uid}` record, and a `users/{uid}` doc (`role: "student"`, `profileId` = their student id). |
| **HOD / Faculty** | Created by an admin in the **Firebase console → Authentication**, with a matching `users/{uid}` doc carrying `role: "hod"` or `"faculty"` (optionally `profileId` linking to a `faculty` record). |

The `users/{uid}` document is the source of truth for role-based access
(`superadmin` / `hod` / `faculty` / `student`).

## Connect Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add a **Web app**, copy its config, then:
   ```bash
   cp .env.example .env
   ```
   Fill in the `VITE_FIREBASE_*` values (API key, auth domain, project id, etc.).
3. In the Firebase console:
   - **Authentication → Sign-in method** → enable **Email/Password**.
   - **Firestore Database** → create a database. Start with **test mode** rules
     for development, then tighten them before going live (see below).
4. Restart `npm run dev`. The login screen now shows **"Connected to Firebase"**.
5. Log in with an existing account or create a student account at `/signup`.
   To load the deterministic demo dataset (students, faculty, marks, …) for
   development, seed it with a one-off script based on
   `src/services/seedFirestore.js` (it creates sample Auth accounts and all
   Firestore collections).

> **Security rules** — the repo ships a full role-based ruleset in
> [`firestore.rules`](./firestore.rules). Role is derived from the signed-in
> user's `users/{uid}` doc, and new **faculty** accounts are created
> `status: "pending"` — they're gated until a **Super Admin / HOD** approves
> them on the **Faculty** admin page. Deploy the rules with:
> ```bash
> firebase deploy --only firestore:rules
> ```
> (Start with test-mode rules during development, then switch to `firestore.rules`.)

## What's implemented

- **Auth & RBAC** — role-based routing with a protected-route guard per portal.
- **Super Admin** — dashboard, CRUD for Students, Faculty, Departments,
  Subjects, Notices, Events, Placements, weekly **Timetable**, Reports & data
  export (Excel/print).
- **HOD** — dashboard (student/faculty stats, attendance overview), attendance
  session log, student/faculty management, projects, circulars, reports.
- **Faculty** — dashboard (my subjects, performance), **mark attendance**
  (present/late/absent per session), **marks entry** (internal/practical/
  semester), assignments with submission tracking, leave requests.
- **Student** — self-registration at `/signup`, dashboard (attendance %,
  internal avg, fee status, drives), attendance record, marks & results, weekly
  timetable, assignments (submit), notices, fee statement, projects, placement
  updates.
- **Analytics** — Recharts dashboards (attendance trend, semester distribution,
  status donuts) using a validated colorblind-safe palette with dark mode.
- **Design** — Ethereal-glass aesthetic, double-bezel cards, fluid motion,
  full dark/light theme toggle, responsive from mobile to desktop.

## Data model

Collections: `users`, `students`, `faculty`, `departments`, `subjects`,
`attendance`, `marks`, `timetable`, `notices`, `events`, `placements`,
`assignments`, `assignmentSubmissions`, `projects`, `fees`, `feedback`,
`leaves`, `internships`, `alumni`, `certificates`, `library`.

`attendance` documents hold a `records` map of `{ studentId: 'present'|'absent'|'late' }`.

## Structure

```
src/
  components/  ui kit, layout, charts, dashboard widgets, timetable grid
  pages/       admin/ hod/ faculty/ student/ + login, signup, profile
  context/     auth, theme, toasts
  hooks/       useCollection, useMe
  services/    db (unified API), firestoreDb (adapter), seedFirestore
  config/      firebase init, navigation map
  data/        seed generator (deterministic demo data)
  utils/       formatting, Excel/print export
```

## Roadmap

QR-code attendance, Firebase Storage file uploads, parent portal, notifications
(FCM/email/SMS), certificate & ID-card generators, online examinations,
multi-language support.
