import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import { Spinner } from './components/ui/primitives'
import { ROLE_HOME } from './config/nav'

import Login from './pages/Login'
import Profile from './pages/Profile'

/* Admin */
import AdminDashboard from './pages/admin/AdminDashboard'
import { StudentsPage, FacultyPage, DepartmentsPage, SubjectsPage, NoticesPage, EventsPage, PlacementsPage } from './pages/admin/crudPages'
import AdminTimetable from './pages/admin/AdminTimetable'
import AdminReports from './pages/admin/AdminReports'

/* HOD */
import HodDashboard from './pages/hod/HodDashboard'
import HodAttendance from './pages/hod/HodAttendance'
import HodProjects from './pages/hod/HodProjects'

/* Faculty */
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import MarkAttendance from './pages/faculty/MarkAttendance'
import MySubjects from './pages/faculty/MySubjects'
import Assignments from './pages/faculty/Assignments'
import MarksEntry from './pages/faculty/MarksEntry'
import Leave from './pages/faculty/Leave'

/* Student */
import StudentDashboard from './pages/student/StudentDashboard'
import StudentAttendance from './pages/student/Attendance'
import StudentMarks from './pages/student/Marks'
import StudentTimetable from './pages/student/Timetable'
import StudentAssignments from './pages/student/Assignments'
import { StudentNotices, StudentFees, StudentProjects, StudentPlacements } from './pages/student/campusPages'

function FullScreenLoader() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Spinner label="Loading workspace…" />
    </div>
  )
}

function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth()
  if (!ready) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />
  return children
}

const withLayout = (node) => <AppLayout>{node}</AppLayout>

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Super Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<AdminDashboard />)}</ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<StudentsPage />)}</ProtectedRoute>} />
      <Route path="/admin/faculty" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<FacultyPage />)}</ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<DepartmentsPage />)}</ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<SubjectsPage />)}</ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<AdminTimetable />)}</ProtectedRoute>} />
      <Route path="/admin/notices" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<NoticesPage />)}</ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<EventsPage />)}</ProtectedRoute>} />
      <Route path="/admin/placements" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<PlacementsPage />)}</ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={['superadmin']}>{withLayout(<AdminReports />)}</ProtectedRoute>} />

      {/* HOD */}
      <Route path="/hod" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<HodDashboard />)}</ProtectedRoute>} />
      <Route path="/hod/students" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<StudentsPage />)}</ProtectedRoute>} />
      <Route path="/hod/faculty" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<FacultyPage />)}</ProtectedRoute>} />
      <Route path="/hod/attendance" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<HodAttendance />)}</ProtectedRoute>} />
      <Route path="/hod/subjects" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<SubjectsPage />)}</ProtectedRoute>} />
      <Route path="/hod/timetable" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<AdminTimetable />)}</ProtectedRoute>} />
      <Route path="/hod/notices" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<NoticesPage />)}</ProtectedRoute>} />
      <Route path="/hod/projects" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<HodProjects />)}</ProtectedRoute>} />
      <Route path="/hod/reports" element={<ProtectedRoute roles={['hod', 'superadmin']}>{withLayout(<AdminReports />)}</ProtectedRoute>} />

      {/* Faculty */}
      <Route path="/faculty" element={<ProtectedRoute roles={['faculty', 'hod', 'superadmin']}>{withLayout(<FacultyDashboard />)}</ProtectedRoute>} />
      <Route path="/faculty/attendance" element={<ProtectedRoute roles={['faculty', 'hod', 'superadmin']}>{withLayout(<MarkAttendance />)}</ProtectedRoute>} />
      <Route path="/faculty/subjects" element={<ProtectedRoute roles={['faculty', 'hod', 'superadmin']}>{withLayout(<MySubjects />)}</ProtectedRoute>} />
      <Route path="/faculty/assignments" element={<ProtectedRoute roles={['faculty', 'hod', 'superadmin']}>{withLayout(<Assignments />)}</ProtectedRoute>} />
      <Route path="/faculty/marks" element={<ProtectedRoute roles={['faculty', 'hod', 'superadmin']}>{withLayout(<MarksEntry />)}</ProtectedRoute>} />
      <Route path="/faculty/leave" element={<ProtectedRoute roles={['faculty', 'hod', 'superadmin']}>{withLayout(<Leave />)}</ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentDashboard />)}</ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentAttendance />)}</ProtectedRoute>} />
      <Route path="/student/marks" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentMarks />)}</ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentTimetable />)}</ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentAssignments />)}</ProtectedRoute>} />
      <Route path="/student/notices" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentNotices />)}</ProtectedRoute>} />
      <Route path="/student/fees" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentFees />)}</ProtectedRoute>} />
      <Route path="/student/projects" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentProjects />)}</ProtectedRoute>} />
      <Route path="/student/placements" element={<ProtectedRoute roles={['student']}>{withLayout(<StudentPlacements />)}</ProtectedRoute>} />

      {/* Shared */}
      <Route path="/profile" element={<ProtectedRoute roles={null}>{withLayout(<Profile />)}</ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RootRedirect() {
  const { user, ready } = useAuth()
  if (!ready) return <FullScreenLoader />
  return <Navigate to={user ? ROLE_HOME[user.role] || '/profile' : '/login'} replace />
}
