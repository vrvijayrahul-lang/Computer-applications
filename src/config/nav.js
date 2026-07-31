import {
  Gauge, GraduationCap, ChalkboardTeacher, Buildings,
  BookOpen, Clock, Megaphone, CalendarStar, Briefcase, ChartLineUp,
  ClipboardText, PaperPlaneTilt, Exam, Wallet, Rocket, Users, SignOut,
} from '@phosphor-icons/react'

export const ROLE_HOME = {
  superadmin: '/admin',
  hod: '/hod',
  faculty: '/faculty',
  student: '/student',
}

export const NAV = {
  superadmin: [
    { section: 'Overview', items: [
      { to: '/admin', label: 'Dashboard', icon: Gauge },
    ]},
    { section: 'Academics', items: [
      { to: '/admin/students', label: 'Students', icon: GraduationCap },
      { to: '/admin/faculty', label: 'Faculty', icon: ChalkboardTeacher },
      { to: '/admin/departments', label: 'Departments', icon: Buildings },
      { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
      { to: '/admin/timetable', label: 'Timetable', icon: Clock },
    ]},
    { section: 'Operations', items: [
      { to: '/admin/notices', label: 'Notices', icon: Megaphone },
      { to: '/admin/events', label: 'Events', icon: CalendarStar },
      { to: '/admin/placements', label: 'Placements', icon: Briefcase },
      { to: '/admin/reports', label: 'Reports', icon: ChartLineUp },
    ]},
  ],
  hod: [
    { section: 'Overview', items: [
      { to: '/hod', label: 'Dashboard', icon: Gauge },
    ]},
    { section: 'Manage', items: [
      { to: '/hod/students', label: 'Students', icon: GraduationCap },
      { to: '/hod/faculty', label: 'Faculty', icon: ChalkboardTeacher },
      { to: '/hod/attendance', label: 'Attendance', icon: ClipboardText },
      { to: '/hod/subjects', label: 'Subjects', icon: BookOpen },
      { to: '/hod/timetable', label: 'Timetable', icon: Clock },
    ]},
    { section: 'Publish', items: [
      { to: '/hod/notices', label: 'Circulars', icon: Megaphone },
      { to: '/hod/projects', label: 'Projects', icon: Rocket },
      { to: '/hod/reports', label: 'Reports', icon: ChartLineUp },
    ]},
  ],
  faculty: [
    { section: 'Overview', items: [
      { to: '/faculty', label: 'Dashboard', icon: Gauge },
    ]},
    { section: 'Teaching', items: [
      { to: '/faculty/attendance', label: 'Mark Attendance', icon: ClipboardText },
      { to: '/faculty/subjects', label: 'My Subjects', icon: BookOpen },
      { to: '/faculty/assignments', label: 'Assignments', icon: PaperPlaneTilt },
      { to: '/faculty/marks', label: 'Marks Entry', icon: Exam },
    ]},
    { section: 'Personal', items: [
      { to: '/faculty/leave', label: 'Leave Requests', icon: CalendarStar },
    ]},
  ],
  student: [
    { section: 'Overview', items: [
      { to: '/student', label: 'Dashboard', icon: Gauge },
    ]},
    { section: 'Academics', items: [
      { to: '/student/attendance', label: 'Attendance', icon: ClipboardText },
      { to: '/student/marks', label: 'Marks & Results', icon: Exam },
      { to: '/student/timetable', label: 'Timetable', icon: Clock },
      { to: '/student/assignments', label: 'Assignments', icon: PaperPlaneTilt },
    ]},
    { section: 'Campus', items: [
      { to: '/student/notices', label: 'Notices', icon: Megaphone },
      { to: '/student/fees', label: 'Fee Status', icon: Wallet },
      { to: '/student/projects', label: 'Projects', icon: Rocket },
      { to: '/student/placements', label: 'Placements', icon: Briefcase },
    ]},
  ],
}

export const ROLE_LABEL = {
  superadmin: 'Super Admin',
  hod: 'Head of Department',
  faculty: 'Faculty',
  student: 'Student',
}
