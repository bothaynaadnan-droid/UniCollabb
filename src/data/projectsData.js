const projectsData = [
  {
    id: 1,
    title: 'Smart Campus Navigation App',
    description: 'A mobile application to help students navigate the university campus with real-time updates and event notifications.',
    detailedDescription: 'A comprehensive mobile application designed to help students and visitors navigate the university campus efficiently. Features include real-time indoor/outdoor mapping, event notifications, building information, and emergency alerts. The app integrates with the campus database to provide up-to-date information and supports multiple universities across Jordan.',
    tools: ['React Native', 'Firebase', 'Maps API', 'UI/UX'],
    rating: 4.5,
    tags: ['IT', 'Maps', 'Mobile'],
    githubLink: 'https://github.com/sample/campus-nav',
    documentation: 'https://docs.example.com/campus-nav',
    supervisor: { 
      name: 'Dr. Fadi Al-Khatib', 
      university: 'WISE University', 
      department: 'Computer Science', 
      email: 'fadi.khatib@wise.edu' 
    },
    supervisorName: 'Dr. Fadi Al-Khatib',
    team: [
      { name: 'Alice Johnson', role: 'Frontend Developer', contribution: 'UI design and React Native implementation' },
      { name: 'Bob Smith', role: 'Backend Developer', contribution: 'Firebase integration and APIs' },
      { name: 'Carol White', role: 'UX/UI Designer', contribution: 'User experience and interface design' }
    ],
    timeline: [
      { phase: 'Planning & Design', completed: true, duration: '2 weeks', description: 'Gathered requirements and designed UI mockups' },
      { phase: 'Development', completed: true, duration: '8 weeks', description: 'Core feature implementation and integration' },
      { phase: 'Testing & QA', completed: false, duration: '2 weeks', description: 'Testing across devices and bug fixes' }
    ],
    feedback: [
      { user: 'Dr. Fadi Al-Khatib', comment: 'Excellent project with great potential for campus-wide implementation', rating: 5 },
      { user: 'Prof. Ahmed Hassan', comment: 'Well-structured code and good documentation', rating: 4 },
      { user: 'Student Reviewer', comment: 'Very intuitive interface, love the real-time updates', rating: 4 }
    ],
    field: 'IT',
    skills: ['React Native', 'Firebase', 'Maps API', 'UI/UX', 'Mobile Development', 'REST APIs'],
    status: 'in-progress',
    progress: 65,
    teamMembers: 3,
    maxTeamSize: 5,
    lookingForTeam: true,
    createdAt: '2024-10-15',
    isOwner: true
  },
  {
    id: 2,
    title: 'AI-Based Learning Assistant',
    description: 'An AI-powered tool that provides personalized learning recommendations and study plans for students.',
    detailedDescription: 'An intelligent tutoring system powered by machine learning that analyzes student learning patterns and provides personalized recommendations. The system uses NLP to understand student queries, recommends relevant resources, and creates adaptive study plans. It tracks progress and adjusts difficulty levels accordingly.',
    tools: ['Python', 'TensorFlow', 'NLP', 'Flask', 'PostgreSQL'],
    rating: 4.2,
    tags: ['AI', 'Education', 'Machine Learning'],
    githubLink: 'https://github.com/sample/ai-tutor',
    documentation: 'https://docs.example.com/ai-tutor',
    supervisor: { 
      name: 'Dr. Somaya Al-Khatib', 
      university: 'University of Jordan', 
      department: 'Artificial Intelligence', 
      email: 'somaya.khatib@ju.edu' 
    },
    supervisorName: 'Dr. Somaya Al-Khatib',
    team: [
      { name: 'Bob Wilson', role: 'ML Engineer', contribution: 'Model development and training' },
      { name: 'Diana Lee', role: 'Data Scientist', contribution: 'Data preprocessing and analysis' }
    ],
    timeline: [
      { phase: 'Research & Exploration', completed: true, duration: '3 weeks', description: 'Literature review and model selection' },
      { phase: 'Model Development', completed: true, duration: '6 weeks', description: 'Training and optimization' },
      { phase: 'Integration & Testing', completed: false, duration: '4 weeks', description: 'API development and system testing' }
    ],
    feedback: [
      { user: 'Dr. Somaya Al-Khatib', comment: 'Great research work with promising results', rating: 5 },
      { user: 'Research Committee', comment: 'Novel approach to personalized learning', rating: 4 }
    ],
    field: 'AI',
    skills: ['Python', 'TensorFlow', 'NLP', 'Machine Learning', 'Flask', 'PostgreSQL', 'Data Analysis'],
    status: 'planning',
    progress: 20,
    teamMembers: 2,
    maxTeamSize: 4,
    lookingForTeam: true,
    createdAt: '2024-10-20',
    isOwner: false
  },
  {
    id: 3,
    title: 'Sustainable Energy Monitor',
    description: 'IoT device to monitor and optimize energy consumption in campus buildings with real-time analytics.',
    detailedDescription: 'An integrated IoT system that monitors energy consumption across campus buildings in real-time. The system uses Arduino-based sensors to collect data from various buildings, analyzes patterns, and provides recommendations for energy optimization. Includes a web dashboard for visualization and reporting.',
    tools: ['Arduino', 'IoT', 'Python', 'Data Analysis', 'Node-RED', 'InfluxDB'],
    rating: 4.0,
    tags: ['Engineering', 'IoT', 'Sustainability'],
    githubLink: 'https://github.com/sample/energy-monitor',
    documentation: 'https://docs.example.com/energy-monitor',
    supervisor: { 
      name: 'Dr. Hassan Nasser', 
      university: 'PSUT', 
      department: 'Electrical Engineering', 
      email: 'hassan.nasser@psut.edu' 
    },
    supervisorName: 'Dr. Hassan Nasser',
    team: [
      { name: 'Carol Davis', role: 'Hardware Engineer', contribution: 'Sensor setup and Arduino programming' }
    ],
    timeline: [
      { phase: 'Hardware Design', completed: false, duration: '4 weeks', description: 'Sensor selection and circuit design' },
      { phase: 'Firmware Development', completed: false, duration: '6 weeks', description: 'Arduino code and data collection' },
      { phase: 'Analytics & Dashboard', completed: false, duration: '3 weeks', description: 'Backend and visualization' }
    ],
    feedback: [
      { user: 'Dr. Hassan Nasser', comment: 'Innovative approach to campus energy management', rating: 4 },
      { user: 'Sustainability Office', comment: 'Very useful for our green initiatives', rating: 4 }
    ],
    field: 'Engineering',
    skills: ['Arduino', 'IoT', 'Embedded Systems', 'Python', 'Data Analysis', 'Electronics'],
    status: 'planning',
    progress: 10,
    teamMembers: 1,
    maxTeamSize: 3,
    lookingForTeam: true,
    createdAt: '2024-10-25',
    isOwner: false
  }
];

export default projectsData;
