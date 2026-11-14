import { Course, Task, StudySession, UserProfile, FocusReflection } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Alex Chen',
  email: 'alex@studyloop.dev',
  timezone: 'America/New_York (EST)',
  preferredSessionLength: 45, // 45-minute focus blocks
  preferredBreakLength: 10,   // 10-minute breaks
  preferredTimeOfDay: 'evening',
  maxDailySessions: 4,
  onboardingCompleted: true,
  createdAt: '2026-11-01T08:00:00Z',
  updatedAt: '2026-11-14T08:00:00Z',
  weeklyAvailability: [
    { day: 'Monday', enabled: true, startTime: '17:00', endTime: '21:30', targetDailyHours: 3.5 },
    { day: 'Tuesday', enabled: true, startTime: '18:00', endTime: '22:00', targetDailyHours: 3.0 },
    { day: 'Wednesday', enabled: true, startTime: '17:00', endTime: '21:30', targetDailyHours: 3.5 },
    { day: 'Thursday', enabled: true, startTime: '18:30', endTime: '22:00', targetDailyHours: 2.5 },
    { day: 'Friday', enabled: true, startTime: '16:00', endTime: '19:30', targetDailyHours: 2.0 },
    { day: 'Saturday', enabled: true, startTime: '10:00', endTime: '16:00', targetDailyHours: 4.0 },
    { day: 'Sunday', enabled: true, startTime: '11:00', endTime: '17:00', targetDailyHours: 4.0 },
  ],
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course_cs201',
    name: 'Data Structures & Algorithms',
    code: 'CS 201',
    color: '#3b82f6', // Blue
    instructor: 'Prof. Miller',
    notes: 'Midterm on graph algorithms and dynamic programming.',
    targetGrade: 'A',
  },
  {
    id: 'course_bio110',
    name: 'Molecular & Cellular Biology',
    code: 'BIO 110',
    color: '#10b981', // Emerald
    instructor: 'Dr. Evans',
    notes: 'Heavy reading; requires active recall diagrams.',
    targetGrade: 'A-',
  },
  {
    id: 'course_math240',
    name: 'Linear Algebra & Matrices',
    code: 'MATH 240',
    color: '#8b5cf6', // Violet
    instructor: 'Prof. Gupta',
    notes: 'Weekly problem sets and theorem proof practice.',
    targetGrade: 'A',
  },
  {
    id: 'course_eng102',
    name: 'Technical Writing & Ethics',
    code: 'ENG 102',
    color: '#f59e0b', // Amber
    instructor: 'Prof. Walker',
    notes: 'Case study analysis and peer reviews.',
    targetGrade: 'B+',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Midterm Exam Preparation: Graph Algorithms & Dynamic Programming',
    courseId: 'course_cs201',
    courseName: 'CS 201',
    dueDate: '2026-11-20',
    estimatedHours: 6.0,
    priority: 'high',
    status: 'in_progress',
    sourceDocumentName: 'CS201_Syllabus_Fall2026.pdf',
    sourceExcerpt: 'Midterm Exam: Nov 20 in Hall B. Covers Modules 1-5 (Graphs, BFS/DFS, Dijkstra, DP).',
    pageReference: 'Page 3, Section 4.2',
    priorityRationale: 'High impact on final course grade (30%); exam date is in 6 days.',
    needsReview: false,
    requiredMaterials: ['Textbook Ch. 7-9', 'Lecture slides 10-14', 'LeetCode practice list'],
    instructions: 'Focus on topological sort, DAG shortest path, and 1D/2D DP memoization.',
    subtasks: [
      { id: 'st_1', title: 'Review BFS/DFS & Graph representations', completed: true },
      { id: 'st_2', title: 'Work through Dijkstra & Bellman-Ford problem sets', completed: false },
      { id: 'st_3', title: 'Solve 4 classic DP problems (0/1 Knapsack, LCS)', completed: false },
      { id: 'st_4', title: 'Take 2025 practice midterm under timed conditions', completed: false },
    ],
    createdAt: '2026-11-05T10:00:00Z',
  },
  {
    id: 'task_2',
    title: 'Lab Report 4: Cellular Respiration & Enzyme Kinetics',
    courseId: 'course_bio110',
    courseName: 'BIO 110',
    dueDate: '2026-11-18',
    estimatedHours: 3.5,
    priority: 'high',
    status: 'in_progress',
    sourceDocumentName: 'BIO110_LabManual_Exp4.pdf',
    sourceExcerpt: 'Lab 4 formal write-up due Tuesday Nov 18 before 11:59 PM to Canvas.',
    pageReference: 'Page 12',
    priorityRationale: 'Upcoming deadline in 4 days; requires data plotting and discussion.',
    needsReview: false,
    requiredMaterials: ['Lab 4 spectrophotometer data', 'GraphPad or Excel template', 'Lab manual rubrics'],
    instructions: 'Include Michaelis-Menten plot, calculate Km and Vmax, write 800-word discussion.',
    subtasks: [
      { id: 'st_5', title: 'Compile absorbance raw data and generate Lineweaver-Burk plot', completed: true },
      { id: 'st_6', title: 'Draft methodology and results summary', completed: false },
      { id: 'st_7', title: 'Write error analysis and conclusion against hypothesis', completed: false },
    ],
    createdAt: '2026-11-07T12:00:00Z',
  },
  {
    id: 'task_3',
    title: 'Problem Set 7: Eigenvalues, Eigenvectors & Diagonalization',
    courseId: 'course_math240',
    courseName: 'MATH 240',
    dueDate: '2026-11-22',
    estimatedHours: 4.0,
    priority: 'medium',
    status: 'not_started',
    sourceDocumentName: 'Math240_HomeworkCalendar.pdf',
    sourceExcerpt: 'HW 7 (Sec 5.1-5.3): Due Sunday Nov 22, 5:00 PM. No late submissions.',
    pageReference: 'Page 1',
    priorityRationale: 'Moderate deadline distance; complex conceptual proof problems.',
    needsReview: false,
    requiredMaterials: ['Lay Linear Algebra textbook', 'Lecture notes 18-20'],
    instructions: 'Complete exercises 4, 12, 18, 26 from Section 5.1 and proofs 7, 11 from Section 5.2.',
    subtasks: [
      { id: 'st_8', title: 'Review characteristic equation & determinant formulas', completed: false },
      { id: 'st_9', title: 'Solve computation problems 1-4', completed: false },
      { id: 'st_10', title: 'Write rigorous proofs for geometric multiplicity', completed: false },
    ],
    createdAt: '2026-11-10T14:00:00Z',
  },
  {
    id: 'task_4',
    title: 'AI Ethics Case Study: Algorithmic Bias in Healthcare Screening',
    courseId: 'course_eng102',
    courseName: 'ENG 102',
    dueDate: '2026-11-26',
    estimatedHours: 3.0,
    priority: 'medium',
    status: 'not_started',
    sourceDocumentName: 'ENG102_EssayPrompt_CaseStudy.pdf',
    sourceExcerpt: 'Final Essay Draft due Thursday Nov 26. 1,500 words with IEEE citations.',
    pageReference: 'Page 2',
    priorityRationale: 'Due in 12 days; steady milestone progress recommended to avoid last-minute rush.',
    needsReview: false,
    requiredMaterials: ['Obermeyer et al. 2019 paper', 'ACM Code of Ethics'],
    instructions: 'Analyze the Optum healthcare algorithm case study through utilitarian and deontological frameworks.',
    subtasks: [
      { id: 'st_11', title: 'Read Obermeyer paper and highlight primary algorithmic bias mechanisms', completed: false },
      { id: 'st_12', title: 'Create 3-point argumentative outline', completed: false },
      { id: 'st_13', title: 'Draft rough body paragraphs and literature citations', completed: false },
    ],
    createdAt: '2026-11-12T09:30:00Z',
  },
  {
    id: 'task_5',
    title: 'BIO 110 Chapter 14 Quiz Review: Gene Expression & Regulation',
    courseId: 'course_bio110',
    courseName: 'BIO 110',
    dueDate: '2026-11-16',
    estimatedHours: 2.0,
    priority: 'high',
    status: 'in_progress',
    sourceDocumentName: 'BIO110_Syllabus.pdf',
    sourceExcerpt: 'Weekly Online Quiz 6: Opens Monday Nov 16 at 8 AM, closes at 11 PM.',
    pageReference: 'Page 5',
    priorityRationale: 'Imminent deadline (in 2 days); quick high-yield recall needed.',
    needsReview: false,
    requiredMaterials: ['Campbell Biology Ch. 14', 'Flashcard deck (Anki)'],
    instructions: 'Focus on lac operon, trp operon, and eukaryotic transcription factors.',
    subtasks: [
      { id: 'st_14', title: 'Review prokaryotic operon feedback loops', completed: true },
      { id: 'st_15', title: 'Run 25 active-recall flashcard drills', completed: false },
    ],
    createdAt: '2026-11-12T10:00:00Z',
  },
];

export const INITIAL_SCHEDULE: StudySession[] = [
  {
    id: 'session_1',
    taskId: 'task_5',
    taskTitle: 'BIO 110 Chapter 14 Quiz Review: Gene Expression & Regulation',
    courseId: 'course_bio110',
    courseName: 'BIO 110',
    courseColor: '#10b981',
    scheduledDate: '2026-11-14', // Today
    startTime: '14:00',
    endTime: '14:45',
    durationMinutes: 45,
    status: 'scheduled',
    priorityRationale: 'Quiz opens Monday; finishing operon drills today allows retention buffer.',
    sessionObjective: 'Master lac vs trp operon repressor mechanisms and review eukaryotic enhancer loops.',
  },
  {
    id: 'session_2',
    taskId: 'task_2',
    taskTitle: 'Lab Report 4: Cellular Respiration & Enzyme Kinetics',
    courseId: 'course_bio110',
    courseName: 'BIO 110',
    courseColor: '#10b981',
    scheduledDate: '2026-11-14', // Today
    startTime: '15:15',
    endTime: '16:00',
    durationMinutes: 45,
    status: 'scheduled',
    priorityRationale: 'Lab report due in 4 days; drafting results while data is fresh.',
    sessionObjective: 'Draft methodology section and calculate Km and Vmax from Lineweaver-Burk plot.',
  },
  {
    id: 'session_3',
    taskId: 'task_1',
    taskTitle: 'Midterm Prep: Graph Algorithms (Dijkstra & Shortest Path)',
    courseId: 'course_cs201',
    courseName: 'CS 201',
    courseColor: '#3b82f6',
    scheduledDate: '2026-11-15', // Tomorrow
    startTime: '10:30',
    endTime: '11:15',
    durationMinutes: 45,
    status: 'scheduled',
    priorityRationale: 'High exam weight; morning slot matches peak analytical focus.',
    sessionObjective: 'Implement Dijkstra with priority queue and solve 2 grid shortest-path variations.',
  },
  {
    id: 'session_4',
    taskId: 'task_1',
    taskTitle: 'Midterm Prep: Dynamic Programming (0/1 Knapsack & Memoization)',
    courseId: 'course_cs201',
    courseName: 'CS 201',
    courseColor: '#3b82f6',
    scheduledDate: '2026-11-15',
    startTime: '11:45',
    endTime: '12:30',
    durationMinutes: 45,
    status: 'scheduled',
    priorityRationale: 'Challenging topic; paired with Dijkstra session for deep study day.',
    sessionObjective: 'Write recursive state transitions for 0/1 Knapsack and optimize space to 1D array.',
  },
  {
    id: 'session_5',
    taskId: 'task_3',
    taskTitle: 'Linear Algebra: Eigenvalue Determinants & Characteristic Equations',
    courseId: 'course_math240',
    courseName: 'MATH 240',
    courseColor: '#8b5cf6',
    scheduledDate: '2026-11-16',
    startTime: '17:30',
    endTime: '18:15',
    durationMinutes: 45,
    status: 'scheduled',
    priorityRationale: 'Pset 7 due Nov 22; solving core questions early prevents weekend backlog.',
    sessionObjective: 'Complete computational exercises 4 and 12 from section 5.1.',
  },
];

export const INITIAL_REFLECTIONS: FocusReflection[] = [
  {
    id: 'ref_1',
    taskId: 'task_1',
    taskTitle: 'Midterm Prep: Graph Algorithms (BFS/DFS Review)',
    courseName: 'CS 201',
    timestamp: '2026-11-13T16:45:00Z',
    energyLevel: 4,
    factor: 'deep_flow',
    notes: 'Good session! Drawing the recursion trees helped clarify the queue mechanics.',
    aiSuggestedAdjustment: 'Great flow state achieved. Your current 45-minute block works well for conceptual algorithm coding.',
  },
  {
    id: 'ref_2',
    taskId: 'task_2',
    taskTitle: 'Lab Report 4: Data Extraction',
    courseName: 'BIO 110',
    timestamp: '2026-11-12T19:30:00Z',
    energyLevel: 2,
    factor: 'fatigue',
    notes: 'Felt tired after 35 minutes; was hard to concentrate on Excel tables.',
    aiSuggestedAdjustment: 'Noticed lower energy during late evening sessions. Consider scheduling heavy data analysis during afternoon windows.',
  },
  {
    id: 'ref_3',
    taskId: 'task_3',
    taskTitle: 'Linear Algebra: Review Matrix Inversion',
    courseName: 'MATH 240',
    timestamp: '2026-11-11T18:15:00Z',
    energyLevel: 3,
    factor: 'notifications',
    notes: 'Phone buzzes interrupted my proof chain twice.',
    aiSuggestedAdjustment: 'Phone distraction noted. StudyLoop recommends turning on Do Not Disturb during 45-minute focus intervals.',
  },
];

// Realistic sample syllabi for instant 1-click testing
export const SAMPLE_MATERIALS = [
  {
    id: 'sample_cs201',
    title: 'Computer Science 201: Data Structures & Algorithms Syllabus',
    course: 'CS 201',
    fileType: 'pdf' as const,
    content: `UNIVERSITY DEPARTMENT OF COMPUTER SCIENCE
CS 201: Data Structures and Algorithms - Fall 2026
Instructor: Prof. Sarah Miller | Office: Tech Bldg 402 | Office Hours: Tue/Thu 2-4 PM

COURSE SCHEDULE & ASSIGNMENTS:
1. Programming Assignment 3: Balanced BSTs and AVL Trees
   - Due Date: November 19, 2026 at 11:59 PM
   - Estimated Workload: ~5 hours
   - Notes: Implement tree rotations, deletion rebalancing, and unit tests. Late penalty 10%/day.
   - Page Reference: Syllabus p. 4

2. Midterm Exam 2
   - Date: November 24, 2026 (In-class, 10:00 AM - 11:50 AM, Hall B)
   - Scope: Modules 4-8 (Heaps, Graph Traversals, Shortest Paths, Dynamic Programming).
   - Estimated Prep: ~8 hours over 4-5 study sessions.
   - Materials allowed: One two-sided handwritten formula sheet.
   - Page Reference: Syllabus p. 5

3. Final Project Milestone 1: Problem Definition & Graph Modeling
   - Due Date: December 03, 2026
   - Estimated Workload: ~4 hours
   - Team or Individual submission to GitHub Classroom.
   - Page Reference: Syllabus p. 7`,
  },
  {
    id: 'sample_chem101',
    title: 'General Chemistry 101: Exam Timetable & Problem Sets',
    course: 'CHEM 101',
    fileType: 'pdf' as const,
    content: `COLLEGE OF NATURAL SCIENCES
CHEM 101: General Chemistry I - Fall 2026
Coordinator: Dr. Marcus Vance

UPCOMING DEADLINES & EXAM TIMETABLE:
- Online Homework 8: Thermochemistry & Calorimetry
  Due Date: November 17, 2026 at 11:00 PM on WebAssign.
  Estimated time: 2.5 hours.

- Lab Report 6: Hess's Law & Enthalpy of Neutralization
  Due Date: November 21, 2026 at 5:00 PM.
  Requires: Completed Excel data table, error propagation, and 2-page synthesis discussion.
  Estimated effort: 4 hours.

- Exam 3: Molecular Geometry, VSEPR & Thermochemistry
  Date: November 25, 2026 at 7:00 PM in Science Center 150.
  Bring: Scientific non-programmable calculator, #2 pencils.
  Estimated study time: 7 hours.`,
  },
  {
    id: 'sample_psych100',
    title: 'Psychology 100: Research Paper & Reading Schedule',
    course: 'PSYC 100',
    fileType: 'pdf' as const,
    content: `FACULTY OF SOCIAL SCIENCES
PSYC 100: Introduction to Cognitive Psychology
Instructor: Dr. Rachel Gomez

SCHEDULE OF EVALUATIONS:
1. Literature Synthesis Paper: Memory Consolidation in REM Sleep
   - Due Date: November 22, 2026 (Canvas submission)
   - Length: 1,200 - 1,500 words, APA 7th edition formatting
   - Minimum 4 peer-reviewed journal articles required
   - Estimated Effort: 5.5 hours across 3 milestones

2. Quiz 4: Cognitive Biases & Decision Making
   - Due Date: November 18, 2026 (Timed 30 min on Canvas)
   - Covers Ch. 8-9 in Goldstein Cognitive Psychology
   - Estimated Prep: 2 hours

3. Research Participation Credits (SONA)
   - Deadline: December 01, 2026 (Complete 4 total credits)`,
  },
];

