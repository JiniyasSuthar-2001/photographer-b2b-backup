export const ROLE_TYPES = {
  'Lead':             { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'Lead' },
  'Traditional':      { color: '#F43F5E', bg: 'rgba(244,63,94,0.12)',  label: 'Traditional' },
  'Candid':           { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Candid' },
  'Drone':            { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'Drone' },
  'Reel':             { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Reel' },
  'Cinematographer':  { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  label: 'Cinematographer' },
  'Assistant':        { color: '#6366F1', bg: 'rgba(99,102,241,0.12)', label: 'Assistant' },
  'Helper':           { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)',label: 'Helper' },
  'Creative Director':{ color: '#EC4899', bg: 'rgba(236,72,153,0.12)', label: 'Creative Director' },
};

// ─── TEAM DIRECTORY ──────────────────────────────────────────────────────────
export const mockTeam = [
  { id: 101, name: 'Aarav Sharma', role: 'Lead', status: 'available', jobsCompleted: 156, rating: 4.9, joinedDate: '2023-01-12', city: 'Ahmedabad', phone: '+91 98765 00001', specialties: ['Lead', 'Traditional'], equipment: ['Sony A7R V', '24-70mm GM II'] },
  { id: 102, name: 'Ishani Patel', role: 'Candid', status: 'busy', jobsCompleted: 89, rating: 4.8, joinedDate: '2023-05-20', city: 'Mumbai', phone: '+91 98765 00002', specialties: ['Candid'], equipment: ['Canon R5', '50mm f/1.2'] },
  { id: 103, name: 'Rohan Mehta', role: 'Drone', status: 'available', jobsCompleted: 42, rating: 4.7, joinedDate: '2024-02-15', city: 'Surat', phone: '+91 98765 00003', specialties: ['Drone'], equipment: ['DJI Mavic 3 Pro', 'Inspire 3'] },
  { id: 104, name: 'Sana Khan', role: 'Reel', status: 'available', jobsCompleted: 210, rating: 4.9, joinedDate: '2023-11-05', city: 'Ahmedabad', phone: '+91 98765 00004', specialties: ['Reel', 'Candid'], equipment: ['iPhone 15 Pro Max', 'RS3 Mini'] },
  { id: 105, name: 'Vikram Singh', role: 'Traditional', status: 'offline', jobsCompleted: 312, rating: 4.6, joinedDate: '2022-08-10', city: 'Rajkot', phone: '+91 98765 00005', specialties: ['Traditional'], equipment: ['Nikon Z9', '70-200mm f/2.8'] },
  { id: 106, name: 'Priya Das', role: 'Cinematographer', status: 'available', jobsCompleted: 67, rating: 5.0, joinedDate: '2024-01-01', city: 'Vadodara', phone: '+91 98765 00006', specialties: ['Cinematographer'], equipment: ['Sony FX3', 'Anamorphic Lenses'] },
  { id: 107, name: 'Karan Malhotra', role: 'Assistant', status: 'available', jobsCompleted: 24, rating: 4.5, joinedDate: '2024-03-12', city: 'Ahmedabad', phone: '+91 98765 00007', specialties: ['Assistant'], equipment: ['Reflectors', 'AD600 Pro'] },
  { id: 108, name: 'Ananya Iyer', role: 'Creative Director', status: 'busy', jobsCompleted: 112, rating: 4.9, joinedDate: '2023-02-28', city: 'Mumbai', phone: '+91 98765 00008', specialties: ['Creative Director'], equipment: ['MacBook Pro M3 Max'] }
];

// ─── PROJECT HUB ─────────────────────────────────────────────────────────────
export const mockJobs = [
  { id: 'JOB-2026-001', title: 'The Oberoi Destination Wedding', client: 'Malhotra & Kapoor', date: '2026-05-18', budget: 250000, status: 'assigned', category: 'Wedding', roles: ['Lead', 'Candid', 'Drone', 'Reel'], location: 'Udaipur, RJ', venue: 'Udaidvilas Palace', notes: 'Golden hour ceremony mandatory.' },
  { id: 'JOB-2026-002', title: 'TechCon Global Summit', client: 'Google India', date: '2026-05-22', budget: 85000, status: 'assigned', category: 'Corporate', roles: ['Lead', 'Candid'], location: 'Ahmedabad, GJ', venue: 'Mahatma Mandir', notes: 'Keynote speakers focus.' },
  { id: 'JOB-2026-003', title: 'Sabyasachi Heritage Campaign', client: 'Sabyasachi Mukherjee', date: '2026-05-28', budget: 120000, status: 'open', category: 'Commercial', roles: ['Cinematographer', 'Candid'], location: 'Mumbai, MH', venue: 'Ballard Estate', notes: 'Vintage aesthetic required.' },
  { id: 'JOB-2026-004', title: 'Grand Sangeet Night', client: 'Mehta Family', date: '2026-05-15', budget: 45000, status: 'completed', category: 'Wedding', roles: ['Reel', 'Traditional'], location: 'Ahmedabad, GJ', venue: 'Karnavati Club', notes: 'Focus on dance performances.' },
  { id: 'JOB-2026-005', title: 'Real Estate Portfolio', client: 'Adani Realty', date: '2026-06-05', budget: 35000, status: 'open', category: 'Commercial', roles: ['Drone'], location: 'Surat, GJ', venue: 'Adani Shantigram', notes: '4K aerial shots of all towers.' },
  { id: 'JOB-2026-006', title: 'Maternity Studio Session', client: 'Yuki Tanaka', date: '2026-06-01', budget: 12000, status: 'assigned', category: 'Portrait', roles: ['Lead'], location: 'Ahmedabad, GJ', venue: 'Lumière Studio', notes: 'Natural light setup.' }
];

// ─── JOB REQUESTS & HISTORY ──────────────────────────────────────────────────
export const mockJobRequests = [
  { id: 'REQ-001', jobId: 'JOB-2026-001', jobTitle: 'The Oberoi Destination Wedding', owner_name: 'Lumière Admin', sentTo: 'Aarav Sharma', role: 'Lead', job_date: '2026-05-18', venue: 'Udaidvilas Palace', budget: 45000, status: 'accepted', sentAt: '2026-05-01T10:00:00Z', respondedAt: '2026-05-01T12:30:00Z' },
  { id: 'REQ-002', jobId: 'JOB-2026-001', jobTitle: 'The Oberoi Destination Wedding', owner_name: 'Lumière Admin', sentTo: 'Rohan Mehta', role: 'Drone', job_date: '2026-05-18', venue: 'Udaidvilas Palace', budget: 30000, status: 'accepted', sentAt: '2026-05-01T10:05:00Z', respondedAt: '2026-05-02T09:15:00Z' },
  { id: 'REQ-003', jobId: 'JOB-2026-002', jobTitle: 'TechCon Global Summit', owner_name: 'Lumière Admin', sentTo: 'Ishani Patel', role: 'Candid', job_date: '2026-05-22', venue: 'Mahatma Mandir', budget: 25000, status: 'accepted', sentAt: '2026-05-05T14:00:00Z', respondedAt: '2026-05-05T15:00:00Z' },
  { id: 'REQ-004', jobId: 'JOB-2026-003', jobTitle: 'Sabyasachi Heritage Campaign', owner_name: 'Lumière Admin', sentTo: 'Priya Das', role: 'Cinematographer', job_date: '2026-05-28', venue: 'Ballard Estate', budget: 50000, status: 'pending', sentAt: '2026-05-10T11:00:00Z', respondedAt: null },
  { id: 'REQ-005', jobId: 'JOB-2026-005', jobTitle: 'Real Estate Portfolio', owner_name: 'Lumière Admin', sentTo: 'Rohan Mehta', role: 'Drone', job_date: '2026-06-05', venue: 'Adani Shantigram', budget: 15000, status: 'declined', sentAt: '2026-05-08T16:00:00Z', respondedAt: '2026-05-08T18:00:00Z', decline_reason: 'Schedule conflict' },

  // ─── INCOMING REQUESTS (Admin acting as a Photographer/Freelancer for others) ───
  // Accepted (Upcoming)
  { id: 'INC-001', jobId: 'EXT-001', job_title: 'Global Motors Product Launch', sender_name: 'Studio X', owner_name: 'Studio X', receiver_name: 'Lumière Admin', role: 'Lead', job_date: '2026-05-25', venue: 'Convention Center', budget: 120000, status: 'accepted', sentAt: '2026-05-10T09:00:00Z' },
  { id: 'INC-002', jobId: 'EXT-002', job_title: 'BMW M-Series Launch', sender_name: 'Studio Munich', owner_name: 'Studio Munich', receiver_name: 'Lumière Admin', role: 'Cinematographer', job_date: '2026-06-20', venue: 'BIC Track', budget: 85000, status: 'accepted', sentAt: '2026-05-01T14:00:00Z' },
  
  // Invites (Pending)
  { id: 'INC-003', jobId: 'EXT-003', job_title: 'Luxury Villa Shoot', sender_name: 'Adani Realty', owner_name: 'Adani Realty', receiver_name: 'Lumière Admin', role: 'Drone', job_date: '2026-05-30', venue: 'Shantigram', budget: 45000, status: 'pending', sentAt: '2026-05-11T10:00:00Z' },
  { id: 'INC-004', jobId: 'EXT-004', job_title: 'Royal Wedding - Jodhpur', sender_name: 'Grand Moments', owner_name: 'Grand Moments', receiver_name: 'Lumière Admin', role: 'Traditional', job_date: '2026-06-12', venue: 'Umaid Bhawan', budget: 150000, status: 'pending', sentAt: '2026-05-09T16:00:00Z' },
  
  // Past Assignments
  { id: 'INC-005', jobId: 'EXT-005', job_title: 'Retro Theme Sangeet', sender_name: 'Vogue Events', owner_name: 'Vogue Events', receiver_name: 'Lumière Admin', role: 'Lead', job_date: '2026-04-15', venue: 'The Leela', budget: 35000, status: 'accepted', sentAt: '2026-04-01T12:00:00Z' },
  { id: 'INC-006', jobId: 'EXT-006', job_title: 'Corporate Portfolio', sender_name: 'TCS India', owner_name: 'TCS India', receiver_name: 'Lumière Admin', role: 'Candid', job_date: '2026-03-22', venue: 'TCS Campus', budget: 15000, status: 'accepted', sentAt: '2026-03-10T10:00:00Z' },
  
  // Declined
  { id: 'INC-007', jobId: 'EXT-007', job_title: 'Birthday Bash', sender_name: 'Local Studio', owner_name: 'Local Studio', receiver_name: 'Lumière Admin', role: 'Assistant', job_date: '2026-05-20', venue: 'City Club', budget: 5000, status: 'declined', sentAt: '2026-05-05T09:00:00Z', decline_reason: 'Budget too low' }
];

// ─── CALENDAR & AVAILABILITY ────────────────────────────────────────────────
export const mockCalendarRoles = {
  '2026-05-15': ['Traditional', 'Reel'],
  '2026-05-18': ['Lead', 'Drone', 'Candid'],
  '2026-05-22': ['Lead', 'Candid'],
  '2026-05-28': ['Cinematographer'],
  '2026-06-01': ['Lead'],
  '2026-06-05': ['Drone']
};

export const mockAvailability = {
  '2026-05-15': 'booked',
  '2026-05-18': 'booked',
  '2026-05-22': 'booked',
  '2026-05-28': 'booked',
  '2026-05-01': 'booked',
  '2026-06-05': 'available'
};

// ─── ANALYTICS (TRENDS & KPIS) ───────────────────────────────────────────────
const buildTrends = () => {
  const trends = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = [45000, 52000, 48000, 72000, 115000, 142000, 98000, 105000, 130000, 165000, 198000, 220000];
  for (let i = 0; i < 12; i++) {
    trends.push({
      month: `${months[i]} '26`,
      amount: values[i],
      jobs: Math.round(values[i] / 12000),
      Candid: Math.round(values[i] * 0.4),
      Lead: Math.round(values[i] * 0.35),
      Drone: Math.round(values[i] * 0.25)
    });
  }
  return trends;
};

export const mockBookingTrends = buildTrends();
export const mockRevenue = mockBookingTrends.slice(-12);
export const mockRevenueByRole = [
  { name: 'Lead',            value: 342000, color: '#3B82F6' },
  { name: 'Candid',         value: 285000, color: '#10B981' },
  { name: 'Drone',          value: 165000, color: '#8B5CF6' },
  { name: 'Reel',           value: 92000,  color: '#F59E0B' },
  { name: 'Cinematographer',value: 78000,  color: '#06B6D4' },
  { name: 'Traditional',    value: 54000,  color: '#F43F5E' },
];

export const mockTeamUtilization = [
  { name: 'Aarav Sharma', percent: 94, jobs: 18 },
  { name: 'Sana Khan', percent: 88, jobs: 24 },
  { name: 'Ishani Patel', percent: 82, jobs: 12 },
  { name: 'Rohan Mehta', percent: 76, jobs: 15 }
];

export const mockTopClients = [
  { name: 'The Oberois', jobs: 12, revenue: 850000, satisfaction: 5.0 },
  { name: 'Sabyasachi Mukherjee', jobs: 5, revenue: 420000, satisfaction: 4.9 },
  { name: 'Google India', jobs: 8, revenue: 310000, satisfaction: 4.8 }
];

export const mockBookingSources = [
  { name: 'Referral', value: 45 },
  { name: 'Instagram', value: 30 },
  { name: 'Direct', value: 15 },
  { name: 'Platform', value: 10 }
];

export const mockPhotographerEarnings = mockBookingTrends.map(t => ({
  month: t.month,
  amount: Math.round(t.amount * 0.5),
  jobs: t.jobs
}));

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
export const mockNotifications = [
  { id: 1, type: 'job_invite', title: 'New Job Invitation', message: 'Ishani Patel accepted your request for TechCon Global Summit.', time: '10m ago', created_at: new Date(Date.now() - 10 * 60000).toISOString(), is_read: false },
  { id: 2, type: 'job_invite', title: 'Incoming Request', message: 'New inquiry from Adani Realty for Drone coverage.', time: '1h ago', created_at: new Date(Date.now() - 60 * 60000).toISOString(), is_read: false },
  { id: 3, type: 'payment', title: 'Payment Received', message: 'Advance payment of ₹1,00,000 received for Udaipur Wedding.', time: '3h ago', created_at: new Date(Date.now() - 180 * 60000).toISOString(), is_read: true },
  { id: 4, type: 'team', title: 'Team Update', message: 'Priya Das updated her equipment: Sony FX3 added.', time: '5h ago', created_at: new Date(Date.now() - 300 * 60000).toISOString(), is_read: true }
];

// ─── ADMIN INITIAL STATE ─────────────────────────────────────────────────────
export const demoInitialState = {
  user: {
    full_name: 'Lumière Admin',
    email: 'admin',
    phone: '9876543210',
    mode: 'photographer',
    authority: 'manager',
    user_type: 'photographer',
    is_pro: true,
    isOnTrial: false,
    trialDaysLeft: 0,
    trialModalDismissed: true,
    studioName: 'Lumière Premium Studio',
    studioLocation: 'Ahmedabad, Gujarat',
    studioEmail: 'admin@lumiere.io',
    rolesOffered: ['Lead', 'Traditional', 'Candid', 'Drone', 'Reel', 'Cinematographer', 'Assistant', 'Helper', 'Creative Director']
  },
  team: mockTeam,
  jobs: mockJobs,
  jobRequests: mockJobRequests,
  calendarRoles: mockCalendarRoles,
  availability: mockAvailability,
  photographerProfile: {
    bio: 'Premium destination wedding and corporate cinematography studio based in Gujarat. Serving luxury clients globally since 2018.',
    skills: ['Directing', 'Post-Production', 'Lighting Design'],
    specialties: ['Luxury Weddings', 'High-Fashion Editorial'],
    equipment: [
      { id: 1, name: 'RED V-Raptor', type: 'Camera' },
      { id: 2, name: 'Arri Alexa Mini', type: 'Camera' },
      { id: 3, name: 'Zeiss CP.3 Prime Set', type: 'Lens' }
    ],
    yearsExperience: 12,
    instagramHandle: '@lumiere.premium',
    portfolioUrl: 'lumiere.studio',
    availableForBookings: true
  },
  analytics: {
    revenue: mockRevenue,
    bookingTrends: mockBookingTrends,
    revenueByRole: mockRevenueByRole,
    teamUtilization: mockTeamUtilization,
    topClients: mockTopClients,
    bookingSources: mockBookingSources,
    photographerEarnings: mockPhotographerEarnings,
    totalRevenue: 1542000,
    jobsThisMonth: 14,
    growthRate: 24.5,
    clientSatisfaction: 4.9,
    avgJobValue: 42000,
    totalJobsCompleted: 542,
    responseRate: 98,
    acceptRate: 92,
    utilizationRate: 88
  },
  jobTasks: [
    { id: 1, jobId: 'JOB-2026-001', text: 'Coordinate with Udaipur travel desk for gear transport', completed: true },
    { id: 2, jobId: 'JOB-2026-001', text: 'Scout locations at Udaidvilas for sunset shots', completed: false },
    { id: 3, jobId: 'JOB-2026-001', text: 'Finalize drone permit for lake area', completed: false },
    { id: 4, jobId: 'JOB-2026-002', text: 'Apply for Mahatma Mandir press pass', completed: true },
    { id: 5, jobId: 'JOB-2026-002', text: 'Prepare interview gear for CEO talk', completed: true },
    { id: 6, jobId: 'JOB-2026-003', text: 'Source vintage fabric backgrounds', completed: false },
    { id: 7, jobId: 'JOB-2026-003', text: 'Model coordination for heritage look', completed: false },
    { id: 8, jobId: 'JOB-2026-004', text: 'Deliver final edited reels to Mehta family', completed: true },
    { id: 9, jobId: 'JOB-2026-006', text: 'Clean studio natural light windows', completed: false }
  ],
  notifications: mockNotifications,
  toasts: []
};

// ─── EMPTY INITIAL STATE ─────────────────────────────────────────────────────
export const emptyInitialState = {
  user: {
    full_name: '',
    email: '',
    phone: '',
    mode: 'photographer',
    authority: 'manager',
    isOnTrial: true,
    trialDaysLeft: 14,
    trialModalDismissed: false,
    studioName: '',
    studioLocation: '',
    studioEmail: '',
    rolesOffered: []
  },
  team: [],
  jobs: [],
  jobRequests: [],
  calendarRoles: {},
  availability: {},
  photographerProfile: {
    bio: '',
    skills: [],
    specialties: [],
    equipment: [],
    yearsExperience: 0,
    instagramHandle: '',
    portfolioUrl: '',
    availableForBookings: true
  },
  analytics: {
    revenue: [],
    bookingTrends: [],
    revenueByRole: [],
    teamUtilization: [],
    topClients: [],
    bookingSources: [],
    photographerEarnings: [],
    totalRevenue: 0,
    jobsThisMonth: 0,
    growthRate: 0,
    clientSatisfaction: 0,
    avgJobValue: 0,
    totalJobsCompleted: 0,
    responseRate: 0,
    acceptRate: 0,
    utilizationRate: 0
  },
  jobTasks: [],
  notifications: [],
  toasts: []
};

export function getAppInitialState(username) {
  if (username === 'admin') return demoInitialState;
  return emptyInitialState;
}
