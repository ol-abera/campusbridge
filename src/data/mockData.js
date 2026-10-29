export const courses = [
  {
    id: 'c1',
    title: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Chen',
    category: 'Computer Science',
    level: 'Beginner',
    duration: '8 weeks',
    students: 1240,
    rating: 4.8,
    reviews: 312,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern, responsive websites from scratch. Perfect for absolute beginners.',
    syllabus: [
      'HTML5 Semantic Markup',
      'CSS Flexbox & Grid',
      'JavaScript Fundamentals',
      'DOM Manipulation',
      'Responsive Design Principles',
      'Git & Version Control Basics'
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'Web']
  },
  {
    id: 'c2',
    title: 'Data Structures & Algorithms',
    instructor: 'Prof. Michael Okonkwo',
    category: 'Computer Science',
    level: 'Intermediate',
    duration: '12 weeks',
    students: 890,
    rating: 4.9,
    reviews: 245,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
    description: 'Master essential data structures and algorithms used in technical interviews and real-world software engineering.',
    syllabus: [
      'Arrays & Linked Lists',
      'Stacks & Queues',
      'Trees & Graphs',
      'Sorting Algorithms',
      'Searching Techniques',
      'Dynamic Programming Intro'
    ],
    tags: ['DSA', 'Algorithms', 'Interview Prep']
  },
  {
    id: 'c3',
    title: 'UI/UX Design Fundamentals',
    instructor: 'Amina Hassan',
    category: 'Design',
    level: 'Beginner',
    duration: '6 weeks',
    students: 2100,
    rating: 4.7,
    reviews: 478,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
    description: 'Discover the principles of user-centered design and create beautiful, intuitive interfaces that users love.',
    syllabus: [
      'Design Thinking Process',
      'User Research Methods',
      'Wireframing & Prototyping',
      'Visual Hierarchy',
      'Color Theory & Typography',
      'Usability Testing'
    ],
    tags: ['UI', 'UX', 'Figma', 'Design']
  },
  {
    id: 'c4',
    title: 'Python for Data Science',
    instructor: 'Dr. James Rivera',
    category: 'Data Science',
    level: 'Intermediate',
    duration: '10 weeks',
    students: 1560,
    rating: 4.8,
    reviews: 389,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop',
    description: 'Learn Python programming with a focus on data analysis, visualization, and introductory machine learning.',
    syllabus: [
      'Python Basics Refresh',
      'NumPy & Pandas',
      'Data Cleaning',
      'Matplotlib & Seaborn',
      'Intro to Scikit-learn',
      'Real-world Projects'
    ],
    tags: ['Python', 'Data Science', 'ML']
  },
  {
    id: 'c5',
    title: 'Mobile App Development with React Native',
    instructor: 'Priya Sharma',
    category: 'Mobile Development',
    level: 'Intermediate',
    duration: '10 weeks',
    students: 720,
    rating: 4.6,
    reviews: 156,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58d7edd?w=600&h=400&fit=crop',
    description: 'Build cross-platform mobile apps for iOS and Android using React Native and modern JavaScript.',
    syllabus: [
      'React Native Setup',
      'Components & Navigation',
      'State Management',
      'API Integration',
      'Native Modules',
      'App Deployment'
    ],
    tags: ['React Native', 'Mobile', 'JavaScript']
  },
  {
    id: 'c6',
    title: 'Digital Marketing Essentials',
    instructor: 'Elena Petrova',
    category: 'Business',
    level: 'Beginner',
    duration: '5 weeks',
    students: 980,
    rating: 4.5,
    reviews: 201,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    description: 'Understand the core strategies of digital marketing including SEO, content, social media, and analytics.',
    syllabus: [
      'Marketing Funnel Basics',
      'SEO Fundamentals',
      'Content Strategy',
      'Social Media Marketing',
      'Email Campaigns',
      'Analytics & Metrics'
    ],
    tags: ['Marketing', 'SEO', 'Business']
  }
];

export const opportunities = [
  {
    id: 'o1',
    title: 'Frontend Developer Intern',
    company: 'NovaTech Solutions',
    location: 'Remote',
    type: 'Internship',
    duration: '3 months',
    stipend: '$800/month',
    deadline: '2026-11-30',
    category: 'Technology',
    description: 'Join our product team to build delightful user interfaces using React and modern CSS. You will work closely with senior engineers and designers.',
    requirements: [
      'Currently enrolled in Computer Science or related field',
      'Familiarity with HTML, CSS, and JavaScript',
      'Basic knowledge of React is a plus',
      'Strong communication skills'
    ],
    tags: ['React', 'Frontend', 'Remote']
  },
  {
    id: 'o2',
    title: 'Data Analyst Intern',
    company: 'Insight Analytics',
    location: 'Addis Ababa, Ethiopia',
    type: 'Internship',
    duration: '4 months',
    stipend: 'ETB 15,000/month',
    deadline: '2026-12-15',
    category: 'Data Science',
    description: 'Help us turn raw data into actionable insights. You will clean datasets, create visualizations, and support the analytics team.',
    requirements: [
      'Background in Statistics, Math, or Computer Science',
      'Experience with Excel and basic SQL',
      'Python or R knowledge preferred',
      'Curious and detail-oriented'
    ],
    tags: ['Data', 'Python', 'Analytics']
  },
  {
    id: 'o3',
    title: 'UX Design Intern',
    company: 'Bloom Digital',
    location: 'Hybrid - Nairobi',
    type: 'Internship',
    duration: '3 months',
    stipend: '$600/month',
    deadline: '2026-11-20',
    category: 'Design',
    description: 'Support the design team in creating user flows, wireframes, and high-fidelity prototypes for web and mobile products.',
    requirements: [
      'Portfolio of design work (student projects welcome)',
      'Familiarity with Figma or Adobe XD',
      'Understanding of basic UX principles',
      'Creative problem solver'
    ],
    tags: ['UX', 'Figma', 'Design']
  },
  {
    id: 'o4',
    title: 'Software Engineering Intern',
    company: 'Safaricom Innovation Hub',
    location: 'Nairobi, Kenya',
    type: 'Internship',
    duration: '6 months',
    stipend: 'KES 40,000/month',
    deadline: '2026-12-01',
    category: 'Technology',
    description: 'Work on real production systems that serve millions of users. Great opportunity to learn enterprise software development practices.',
    requirements: [
      'Strong programming fundamentals (any language)',
      'Understanding of data structures',
      'Team player with growth mindset',
      'Available for full-time duration'
    ],
    tags: ['Backend', 'Full-stack', 'Enterprise']
  },
  {
    id: 'o5',
    title: 'Content Marketing Intern',
    company: 'EduSpark Media',
    location: 'Remote',
    type: 'Internship',
    duration: '3 months',
    stipend: '$500/month',
    deadline: '2026-11-25',
    category: 'Marketing',
    description: 'Create engaging educational content, manage social media channels, and help grow our student community.',
    requirements: [
      'Excellent written communication',
      'Interest in education technology',
      'Social media savvy',
      'Creative storytelling ability'
    ],
    tags: ['Content', 'Marketing', 'Remote']
  },
  {
    id: 'o6',
    title: 'Research Assistant - AI Ethics',
    company: 'University Innovation Lab',
    location: 'Hybrid',
    type: 'Research Opportunity',
    duration: '5 months',
    stipend: 'Stipend available',
    deadline: '2026-12-10',
    category: 'Research',
    description: 'Assist faculty researchers in studying ethical implications of AI systems. Ideal for students interested in AI policy and ethics.',
    requirements: [
      'Strong academic standing',
      'Interest in AI and ethics',
      'Good research and writing skills',
      'Ability to work independently'
    ],
    tags: ['Research', 'AI', 'Ethics']
  }
];

export const categories = [
  'All',
  'Computer Science',
  'Design',
  'Data Science',
  'Mobile Development',
  'Business',
  'Technology',
  'Marketing',
  'Research'
];

export const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
export const opportunityTypes = ['All', 'Internship', 'Research Opportunity', 'Part-time', 'Full-time'];
