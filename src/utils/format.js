// "YYYY-MM-DD" (a calendar date with no time zone) -> "Mar 20, 2027". Noon avoids a one-day shift.
export const formatDate = (yyyyMmDd) =>
  yyyyMmDd ? new Date(`${yyyyMmDd}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export const ROLE_HOME = { student: '/dashboard', instructor: '/instructor', coordinator: '/coordinator' };
export const ROLE_LABEL = { student: 'Student', instructor: 'Instructor', coordinator: 'Internship coordinator' };
