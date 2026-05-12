/**
 * CHRONOLOGICAL SORTING UTILITY
 * Purpose: Ensures consistent job/request ordering across the platform.
 * Logic:
 * 1. UPCOMING: date >= today, sorted ASC (closest first).
 * 2. PAST: date < today OR status === 'completed', sorted DESC (most recent first).
 * 
 * Connectivity: 
 * - Projects.jsx (My Jobs, Accepted Jobs, Invites)

 * - Dashboard.jsx (Recent Jobs widget)
 */

export const sortChronologically = (items, dateKey = 'date') => {
  if (!items || !Array.isArray(items)) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = [];
  const past = [];

  items.forEach(item => {
    const itemDate = new Date(item[dateKey]);
    const isCompleted = item.status === 'completed' || item.is_completed || itemDate < now;

    if (isCompleted) {
      past.push(item);
    } else {
      upcoming.push(item);
    }
  });

  // Sort upcoming: Closest date to now comes first (ASC)
  upcoming.sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));

  // Sort past: Most recently completed comes first (DESC)
  past.sort((a, b) => new Date(b[dateKey]) - new Date(a[dateKey]));

  return [...upcoming, ...past];
};
