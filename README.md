# UniCore — College Management System

A complete web application for the **Department of Computer Applications** with
separate portals for **Super Admin, HOD, Faculty and Students**.

Built with React + Vite + Tailwind CSS on the frontend, a pluggable data layer
that runs on a zero-setup **local demo store** out of the box and switches to
**Firebase** (Auth + Firestore) the moment you configure credentials.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The app auto-seeds
realistic demo data and is fully usable immediately — no accounts to create.

### Demo logins (one click on the login screen)

| Role        | Email                 | Password    |
| ----------- | --------------------- | ----------- |
| Super Admin | `admin@unicore.dev`   | `admin123`  |
| HOD         | `hod@unicore.dev`     | `hod123`    |
| Faculty     | `faculty@unicore.dev` | `faculty123`|
| Student     | `student@unicore.dev` | `student123`|

## Connect Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add a **Web app**, copy its config, then:
   ```bash
   cp .env.example .env
   ```
   Fill in the `VITE_FIREBASE_*` values.
3. In Firestore (Production mode) enable **Authentication → Email/Password**
   and create the collections from the data model below.
4. Restart `npm run dev`. The app now uses real Firebase — the login screen
   shows **"Connected to Firebase"**.

> Demo mode uses `localStorage` and is seeded on first load. Use
> **Reports → Reset demo** to start over. Data written in demo mode is local to
> the browser.

## What's implemented

- **Auth & RBAC** — role-based routing with a protected-route guard per portal.
- **Super Admin** — dashboard, CRUD for Students, Faculty, Departments,
  Subjects, Notices, Events, Placements, weekly **Timetable**, Reports & data
  export (Excel), demo backup/reset.
- **HOD** — dashboard (student/faculty stats, attendance overview), attendance
  session log, student/faculty management, projects, circulars, reports.
- **Faculty** — dashboard (my subjects, performance), **mark attendance**
  (present/late/absent per session), **marks entry** (internal/practical/
  semester), assignments with submission tracking, leave requests.
- **Student** — dashboard (attendance %, internal avg, fee status, drives),
  attendance record, marks & results, weekly timetable, assignments (submit),
  notices, fee statement, projects, placement updates.
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
  pages/       admin/ hod/ faculty/ student/ + login, profile
  context/     auth, theme, toasts
  hooks/       useCollection, useMe
  services/    db (unified API), mockDb (demo store), firestoreDb (adapter)
  config/      firebase init, navigation map
  data/        seed generator (deterministic demo data)
  utils/       formatting, Excel/print export
```

## Roadmap

QR-code attendance, Firebase Storage file uploads, parent portal, notifications
(FCM/email/SMS), certificate & ID-card generators, online examinations,
multi-language support.
