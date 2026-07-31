// Deterministic seed data for the demo store — a realistic slice of the
// Department of Computer Applications (BCA). All dates are relative to "today"
// so the demo always looks alive.

// ---- deterministic PRNG ----
function rng(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const DAY = 86400000
const d = (offsetDays, hour = 9, minute = 0) =>
  new Date(new Date().setHours(hour, minute, 0, 0) + offsetDays * DAY).toISOString()
const workingDaysAgo = (n) => {
  const t = new Date()
  let skipped = 0
  while (skipped < n) {
    t.setDate(t.getDate() - 1)
    const day = t.getDay()
    if (day !== 0 && day !== 6) skipped++
  }
  t.setHours(9, 0, 0, 0)
  return t.toISOString()
}

// ---- Department ----
export const DEPARTMENTS = [
  { id: 'dept_ca', name: 'Department of Computer Applications', code: 'CA', program: 'BCA', semesters: 6 },
]

// ---- Faculty ----
const FACULTY_RAW = [
  { id: 'fac_01', name: 'Dr. Priya Sharma', empId: 'CA001', designation: 'Professor & Head', qualification: 'Ph.D. in Computer Science', experience: 15, specialization: 'Data Mining' },
  { id: 'fac_02', name: 'Mr. Arjun Nair', empId: 'CA002', designation: 'Assistant Professor', qualification: 'M.Tech (CSE)', experience: 8, specialization: 'Databases' },
  { id: 'fac_03', name: 'Ms. Kavya Iyer', empId: 'CA003', designation: 'Assistant Professor', qualification: 'M.Sc. Computer Science', experience: 6, specialization: 'Programming Languages' },
  { id: 'fac_04', name: 'Dr. Rohit Menon', empId: 'CA004', designation: 'Associate Professor', qualification: 'Ph.D. in Networking', experience: 12, specialization: 'Computer Networks' },
  { id: 'fac_05', name: 'Mr. Vimal Kumar', empId: 'CA005', designation: 'Assistant Professor', qualification: 'M.Tech (IT)', experience: 5, specialization: 'Web Technologies' },
  { id: 'fac_06', name: 'Ms. Anjali Reddy', empId: 'CA006', designation: 'Assistant Professor', qualification: 'M.Sc. Mathematics', experience: 4, specialization: 'Discrete Mathematics' },
]

export const FACULTY = FACULTY_RAW.map((f) => ({
  ...f,
  email: f.id.replace('fac_', '') + '@unicore.dev',
  phone: '98' + Math.floor(10000000 + Math.random() * 90000000),
  departmentId: 'dept_ca',
  subjects: [],
  createdAt: d(-90),
}))

// ---- Subjects (2 per subject entry) ----
const SUBJECT_PLAN = [
  // semester, code, name, credits, facultyIndex, color
  [1, 'BCA101', 'Programming in C', 4, 2],
  [1, 'BCA102', 'Discrete Mathematics', 4, 5],
  [1, 'BCA103', 'Computer Fundamentals', 3, 1],
  [1, 'BCA104', 'Digital Logic', 3, 4],
  [2, 'BCA201', 'Data Structures', 4, 3],
  [2, 'BCA202', 'Object Oriented Programming', 4, 2],
  [2, 'BCA203', 'Microprocessors', 3, 4],
  [2, 'BCA204', 'Mathematics II', 3, 5],
  [3, 'BCA301', 'Database Management Systems', 4, 1],
  [3, 'BCA302', 'Java Programming', 4, 3],
  [3, 'BCA303', 'Operating Systems', 4, 4],
  [3, 'BCA304', 'Statistics & Probability', 3, 5],
  [4, 'BCA401', 'Web Technologies', 4, 4],
  [4, 'BCA402', 'Software Engineering', 3, 1],
  [4, 'BCA403', 'Computer Networks', 4, 3],
  [4, 'BCA404', 'Python Programming', 4, 2],
  [5, 'BCA501', 'Advanced Java / .NET', 4, 2],
  [5, 'BCA502', 'Mobile App Development', 4, 3],
  [5, 'BCA503', 'Data Mining & Analytics', 4, 0],
  [5, 'BCA504', 'Cloud Computing', 3, 4],
  [6, 'BCA601', 'Project Work', 6, 0],
  [6, 'BCA602', 'Machine Learning Fundamentals', 4, 3],
  [6, 'BCA603', 'Cyber Security', 3, 4],
  [6, 'BCA604', 'Management Information Systems', 3, 1],
]

export const SUBJECTS = SUBJECT_PLAN.map(([sem, code, name, credits, fi], i) => {
  const f = FACULTY[fi]
  f.subjects.push(code)
  return {
    id: `sub_${i + 1}`,
    code, name, credits, semester: sem,
    departmentId: 'dept_ca',
    facultyId: f.id,
    facultyName: f.name,
    createdAt: d(-80),
  }
})

// ---- Students ----
const FIRST = ['Aarav', 'Aditi', 'Aisha', 'Amit', 'Ananya', 'Arjun', 'Aryan', 'Avni', 'Deepak', 'Divya', 'Farhan', 'Gauri', 'Harsh', 'Ishaan', 'Jaya', 'Kabir', 'Kavya', 'Lakshmi', 'Manav', 'Meera', 'Nikhil', 'Nisha', 'Omkar', 'Pooja', 'Pranav', 'Riya', 'Rohan', 'Sakshi', 'Shivam', 'Sneha', 'Tanvi', 'Tarun', 'Uma', 'Varun', 'Vedant', 'Yash', 'Zara', 'Ishan', 'Maya', 'Reyansh', 'Saanvi', 'Advait', 'Diya', 'Karan', 'Ira']
const LAST = ['Sharma', 'Verma', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Das', 'Bose', 'Chowdhury', 'Rao', 'Joshi', 'Mehta', 'Kapoor', 'Malhotra', 'Desai', 'Narayan', 'Shah', 'Bhat', 'Kulkarni', 'Saxena']

const rand = rng(20260731)

export const STUDENTS = []
let si = 0
for (let sem = 1; sem <= 6; sem++) {
  const count = 8
  for (let j = 0; j < count; j++) {
    si++
    const first = FIRST[(si * 3 + j) % FIRST.length]
    const last = LAST[(si * 5 + j) % LAST.length]
    const year = 2027 - sem
    const rollNo = `BCA${String(year).slice(2)}${String(si).padStart(2, '0')}`
    STUDENTS.push({
      id: `stu_${String(si).padStart(2, '0')}`,
      name: `${first} ${last}`,
      rollNo,
      email: `${String(si).padStart(2, '0')}${last.toLowerCase()}@student.unicore.dev`,
      phone: '9' + Math.floor(100000000 + rand() * 900000000),
      departmentId: 'dept_ca',
      program: 'BCA',
      semester: sem,
      section: j % 2 === 0 ? 'A' : 'B',
      admissionYear: year,
      dob: d(-7300, 12),
      gender: j % 3 === 0 ? 'Female' : 'Male',
      parentName: `${last} ${j % 2 === 0 ? 'R' : 'S'} ${first[0]}.`,
      parentPhone: '9' + Math.floor(100000000 + rand() * 900000000),
      address: `${12 + si} MG Road, Kochi`,
      photoUrl: '',
      status: 'active',
      createdAt: d(-120),
    })
  }
}

// ---- Attendance (last 8 working days, one session per semester) ----
export const ATTENDANCE = []
FACULTY.forEach((f, fi) => {
  SUBJECTS.filter((s) => s.facultyId === f.id).forEach((subj) => {
    for (let i = 0; i < 6; i++) {
      const date = workingDaysAgo(i + 1)
      const classStudents = STUDENTS.filter((s) => s.semester === subj.semester)
      const records = {}
      classStudents.forEach((s) => {
        const r = rand()
        records[s.id] = r < 0.84 ? 'present' : r < 0.94 ? 'late' : 'absent'
      })
      ATTENDANCE.push({
        id: `att_${subj.id}_${i}`,
        date,
        subjectId: subj.id,
        subjectName: subj.name,
        semester: subj.semester,
        period: i % 4 + 1,
        takenBy: f.id,
        records,
        createdAt: date,
      })
    }
  })
})

// ---- Marks (internal exams 1 & 2 for each subject/student) ----
export const MARKS = []
STUDENTS.forEach((s) => {
  SUBJECTS.filter((subj) => subj.semester === s.semester).forEach((subj, k) => {
    ;[1, 2].forEach((exam) => {
      const obtained = Math.round(rand() * 28)
      MARKS.push({
        id: `mk_${s.id}_${subj.id}_${exam}`,
        studentId: s.id,
        subjectId: subj.id,
        subjectName: subj.name,
        examType: `Internal ${exam}`,
        marksObtained: obtained,
        maxMarks: 30,
        semester: s.semester,
        updatedBy: subj.facultyId,
        updatedAt: d(-40 + k * 10),
      })
    })
  })
})

// ---- Timetable (Mon–Fri, 6 slots, per semester) ----
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const SLOTS = [
  ['09:00', '09:50'], ['09:50', '10:40'], ['11:00', '11:50'],
  ['11:50', '12:40'], ['14:00', '14:50'], ['14:50', '15:40'],
]
export const TIMETABLE = []
DAYS.forEach((day, di) => {
  for (let sem = 1; sem <= 6; sem++) {
    const semSubjects = SUBJECTS.filter((s) => s.semester === sem)
    semSubjects.forEach((subj, pi) => {
      TIMETABLE.push({
        id: `tt_${di}_${sem}_${pi}`,
        day, semester: sem,
        period: pi + 1,
        time: `${SLOTS[pi][0]} – ${SLOTS[pi][1]}`,
        subjectId: subj.id,
        subjectName: subj.name,
        facultyId: subj.facultyId,
        facultyName: subj.facultyName,
        classroom: pi % 2 === 0 ? `Room 2${sem}${di + 1}` : `Lab ${(pi % 3) + 1}`,
      })
    })
  }
})

// ---- Notices ----
export const NOTICES = [
  { id: 'n_01', title: 'Mid-Semester Internal Examination Schedule Released', category: 'Examination', audience: 'all', body: 'Internal examinations for all semesters will be conducted from next Monday. Detailed schedule is available with the class representatives. Students must carry valid ID cards.', date: d(-3), authorId: 'fac_01', pinned: true },
  { id: 'n_02', title: 'Holiday Notice — Independence Day', category: 'Holiday', audience: 'all', body: 'The college will remain closed on account of Independence Day. Classes resume the next day as per regular timetable.', date: d(-2), authorId: 'fac_01', pinned: false },
  { id: 'n_03', title: 'Fees Reminder — Even Semester', category: 'Circular', audience: 'student', body: 'Final installment of semester fees must be paid before the 10th of this month. Late payment attracts a fine as per college rules. Pay through the student portal.', date: d(-5), authorId: 'fac_01', pinned: true },
  { id: 'n_04', title: 'Hackathon Registration Open — InnovateCA 2026', category: 'Event', audience: 'student', body: 'Annual departmental hackathon is back! Teams of 2–4. Registrations close this Friday. Winners receive cash prizes and internship referrals.', date: d(-1), authorId: 'fac_05', pinned: false },
  { id: 'n_05', title: 'Placement Drive — TCS Campus Recruitment', category: 'Placement', audience: 'final', body: 'TCS is visiting campus for the National Qualifier Test. Eligibility: 60% aggregate, no active backlogs. Register through the placement portal before the deadline.', date: d(-4), authorId: 'fac_01', pinned: true },
  { id: 'n_06', title: 'Library Timings Extended During Examination', category: 'Circular', audience: 'all', body: 'The department library will remain open from 8 AM to 8 PM during the examination period. Quiet hours: 11 AM – 2 PM.', date: d(-6), authorId: 'fac_02', pinned: false },
  { id: 'n_07', title: 'Seminar: Career Pathways in Cloud Computing', category: 'Seminar', audience: 'student', body: 'An expert session by industry practitioners on AWS, Azure and DevOps. Venue: Seminar Hall, 3 PM.', date: d(2), authorId: 'fac_04', pinned: false },
]

// ---- Events ----
export const EVENTS = [
  { id: 'e_01', title: 'AI & Machine Learning Workshop', category: 'Workshop', date: d(6, 10), venue: 'Lab 3', description: 'Hands-on introduction to ML with Python. Bring your laptops.', imageUrl: '' },
  { id: 'e_02', title: 'InnovateCA Hackathon', category: 'Hackathon', date: d(14, 9), venue: 'Seminar Hall', description: '24-hour build-a-thon focused on campus solutions.', imageUrl: '' },
  { id: 'e_03', title: 'Guest Lecture — Entrepreneurship', category: 'Guest Lecture', date: d(9, 14), venue: 'Main Auditorium', description: 'Session by the founder of a YC-backed startup.', imageUrl: '' },
  { id: 'e_04', title: 'Tech Fest: CodeSprint 2026', category: 'Seminar', date: d(21, 10), venue: 'College Grounds', description: 'Annual technical festival with coding contests, gaming and project expo.', imageUrl: '' },
  { id: 'e_05', title: 'Industry Visit — Infosys Campus', category: 'Workshop', date: d(28, 8), venue: 'Infosys, Trivandrum', description: 'Full-day exposure to a large IT services organisation.', imageUrl: '' },
]

// ---- Placements ----
export const PLACEMENTS = [
  { id: 'pl_01', company: 'TCS', role: 'System Engineer', package: '4.2 LPA', driveDate: d(12), eligibility: '60% aggregate, no active backlogs', selectedCount: 3, status: 'upcoming' },
  { id: 'pl_02', company: 'Infosys', role: 'Systems Engineer', package: '4.5 LPA', driveDate: d(19), eligibility: '65% aggregate', selectedCount: 0, status: 'upcoming' },
  { id: 'pl_03', company: 'Wipro', role: 'Project Engineer', package: '3.5 LPA', driveDate: d(26), eligibility: 'All students', selectedCount: 0, status: 'upcoming' },
  { id: 'pl_04', company: 'Cognizant', role: 'Programmer Analyst', package: '4.0 LPA', driveDate: d(-20), eligibility: '60% aggregate', selectedCount: 5, status: 'completed' },
  { id: 'pl_05', company: 'Accenture', role: 'Associate Software Engineer', package: '4.8 LPA', driveDate: d(-8), eligibility: '70% aggregate, communication test', selectedCount: 4, status: 'completed' },
  { id: 'pl_06', company: 'Capgemini', role: 'Analyst', package: '4.2 LPA', driveDate: d(-30), eligibility: '60% aggregate', selectedCount: 2, status: 'completed' },
]

// ---- Assignments ----
export const ASSIGNMENTS = [
  { id: 'as_01', title: 'Banking System in C', subjectId: 'sub_1', subjectName: 'Programming in C', facultyId: 'fac_03', description: 'Implement a console-based banking system using structures, file handling and functions.', deadline: d(4, 23, 59), maxMarks: 10 },
  { id: 'as_02', title: 'Normalisation Exercise', subjectId: 'sub_9', subjectName: 'Database Management Systems', facultyId: 'fac_01', description: 'Normalise the given case study up to 3NF and justify every step.', deadline: d(5, 23, 59), maxMarks: 10 },
  { id: 'as_03', title: 'Web Page Portfolio', subjectId: 'sub_13', subjectName: 'Web Technologies', facultyId: 'fac_04', description: 'Build a responsive personal portfolio using semantic HTML and modern CSS.', deadline: d(7, 23, 59), maxMarks: 15 },
  { id: 'as_04', title: 'Data Structures Lab Record', subjectId: 'sub_5', subjectName: 'Data Structures', facultyId: 'fac_03', description: 'Complete the sorting and searching experiments in the lab record.', deadline: d(3, 23, 59), maxMarks: 10 },
  { id: 'as_05', title: 'Mini Data Mining Report', subjectId: 'sub_19', subjectName: 'Data Mining & Analytics', facultyId: 'fac_01', description: 'Summarise a published case study of market basket analysis.', deadline: d(9, 23, 59), maxMarks: 10 },
]

export const ASSIGNMENT_SUBMISSIONS = [
  { id: 'subm_01', assignmentId: 'as_01', studentId: 'stu_01', fileName: 'banking_system.c', submittedAt: d(-1, 20), status: 'submitted', marks: null, comment: '' },
  { id: 'subm_02', assignmentId: 'as_01', studentId: 'stu_02', fileName: 'bank_system_final.c', submittedAt: d(-2, 18), status: 'submitted', marks: 9, comment: 'Well structured. Watch boundary cases.' },
]

// ---- Projects ----
export const PROJECTS = [
  { id: 'pj_01', title: 'Smart Attendance using Face Recognition', students: ['stu_01', 'stu_02'], guide: 'Dr. Rohit Menon', year: 2026, githubLink: 'https://github.com/demo/facetrack', demoLink: '', reportUrl: '', status: 'in-progress' },
  { id: 'pj_02', title: 'Campus Placement Dashboard', students: ['stu_03'], guide: 'Mr. Arjun Nair', year: 2026, githubLink: 'https://github.com/demo/placeboard', demoLink: '', reportUrl: '', status: 'in-progress' },
  { id: 'pj_03', title: 'E-commerce with Inventory Prediction', students: ['stu_04', 'stu_05'], guide: 'Dr. Priya Sharma', year: 2026, githubLink: 'https://github.com/demo/shopai', demoLink: '', reportUrl: '', status: 'completed' },
]

// ---- Fees ----
export const FEES = []
STUDENTS.forEach((s) => {
  const r = rand()
  FEES.push({
    id: `fee_${s.id}`,
    studentId: s.id,
    studentName: s.name,
    rollNo: s.rollNo,
    semester: s.semester,
    head: 'Semester Tuition + Lab',
    amount: 45000,
    paid: r < 0.78 ? 45000 : Math.round(r * 45000),
    dueDate: d(8),
    paidOn: r < 0.78 ? d(-20) : '',
    createdAt: d(-90),
  })
})

// ---- Feedback ----
export const FEEDBACK = [
  { id: 'fb_01', studentId: 'stu_01', type: 'Faculty Feedback', subject: 'DBMS', rating: 4, anonymous: true, text: 'Explanations are clear and relatable.', createdAt: d(-6) },
  { id: 'fb_02', studentId: 'stu_04', type: 'Course Feedback', subject: 'Python Programming', rating: 5, anonymous: false, text: 'Loved the project-based evaluation.', createdAt: d(-4) },
  { id: 'fb_03', studentId: 'stu_10', type: 'Suggestion', subject: '', rating: 3, anonymous: true, text: 'Can we have practice sessions before internal exams?', createdAt: d(-2) },
]

// ---- Users (demo auth) ----
export const USERS = [
  { id: 'usr_admin', name: 'Super Administrator', email: 'admin@unicore.dev', password: 'admin123', role: 'superadmin', profileId: null },
  { id: 'usr_hod', name: 'Dr. Priya Sharma', email: 'hod@unicore.dev', password: 'hod123', role: 'hod', profileId: 'fac_01' },
  { id: 'usr_faculty', name: 'Mr. Arjun Nair', email: 'faculty@unicore.dev', password: 'faculty123', role: 'faculty', profileId: 'fac_02' },
  { id: 'usr_student', name: 'Aarav Verma', email: 'student@unicore.dev', password: 'student123', role: 'student', profileId: 'stu_01' },
  ...FACULTY.map((f, i) => ({ id: `usr_${f.id}`, name: f.name, email: f.email, password: `fac${i + 1}23`, role: 'faculty', profileId: f.id })),
  ...STUDENTS.slice(0, 10).map((s, i) => ({ id: `usr_${s.id}`, name: s.name, email: s.email, password: `stu${i + 1}23`, role: 'student', profileId: s.id })),
]

export function buildSeed() {
  return {
    users: USERS,
    departments: DEPARTMENTS,
    faculty: FACULTY,
    subjects: SUBJECTS,
    students: STUDENTS,
    attendance: ATTENDANCE,
    marks: MARKS,
    timetable: TIMETABLE,
    notices: NOTICES,
    events: EVENTS,
    placements: PLACEMENTS,
    assignments: ASSIGNMENTS,
    assignmentSubmissions: ASSIGNMENT_SUBMISSIONS,
    projects: PROJECTS,
    fees: FEES,
    feedback: FEEDBACK,
    internships: [],
    alumni: [],
    certificates: [],
  }
}
