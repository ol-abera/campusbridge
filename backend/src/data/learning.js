// Sample assignments and demo accounts. SAMPLE DATA for demonstration, like seed.js.
// Due dates are "N days from today" so the demo never goes stale (an open due date is kept on restart).
const inDays = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

// Public demo password. Demo accounts are only created when SEED_DEMO_ACCOUNTS=true (never in production).
export const DEMO_PASSWORD = 'Demo12345';

export const demoAccounts = [
  { role: 'student', fullName: 'Demo Student', email: 'student@demo.campusbridge.local', university: 'Mizan-Tepi University', yearOfStudy: '3rd Year', field: 'Software Engineering' },
  { role: 'instructor', fullName: 'Demo Instructor', email: 'instructor@demo.campusbridge.local', university: 'Mizan-Tepi University', yearOfStudy: '', field: 'Computer Science' },
  { role: 'coordinator', fullName: 'Demo Coordinator', email: 'coordinator@demo.campusbridge.local', university: 'Mizan-Tepi University', yearOfStudy: '', field: 'Career Services' }
];

export const assignments = [
  { courseId: 'c1', title: 'Build a personal profile page', description: 'Create a one-page personal profile using semantic HTML and CSS Flexbox. It must be responsive on a phone screen. Submit a short description of what you built and a link to your code (GitHub or CodePen).', dueDate: inDays(14), maxPoints: 100 },
  { courseId: 'c1', title: 'JavaScript to-do list', description: 'Build a to-do list that lets users add and remove tasks using the DOM. Explain how your code works and link to it.', dueDate: inDays(28), maxPoints: 100 },
  { courseId: 'c2', title: 'Implement a stack and a queue', description: 'Implement both data structures in a language of your choice and explain the time complexity of push, pop, enqueue and dequeue.', dueDate: inDays(14), maxPoints: 100 },
  { courseId: 'c2', title: 'Binary search write-up', description: 'Explain binary search in your own words and show it on a small example, then link to your implementation.', dueDate: inDays(30), maxPoints: 50 },
  { courseId: 'c3', title: 'Redesign a local business app screen', description: 'Pick a screen from an app used in your town, identify two usability problems, and propose a redesign. Link to your sketch or Figma file.', dueDate: inDays(21), maxPoints: 100 },
  { courseId: 'c4', title: 'Clean and summarise a dataset', description: 'Use Python (pandas) to clean a small CSV dataset and report three findings. Link to your notebook.', dueDate: inDays(21), maxPoints: 100 },
  { courseId: 'c5', title: 'Two-screen mobile prototype', description: 'Build a two-screen React Native app with navigation between the screens. Link to your repository.', dueDate: inDays(28), maxPoints: 100 },
  { courseId: 'c6', title: 'One-page business idea', description: 'Describe a business idea that solves a problem in your community: customer, problem, solution and how it earns money.', dueDate: inDays(14), maxPoints: 100 }
];
