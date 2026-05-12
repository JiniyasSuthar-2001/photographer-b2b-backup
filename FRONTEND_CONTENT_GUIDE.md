# Lumière Content & Branding Guide

This guide contains all the "display text" (titles, labels, buttons, and messages) you need to input into your frontend template to make it look professional and consistent.

---

## 1. Global Brand Identity
| Item | Recommended Value | Notes |
| :--- | :--- | :--- |
| **App Name** | Lumière | Or your chosen brand name. |
| **Slogan** | Elevating Photography Business | Used in landing/login pages. |
| **Primary Color** | `#6366f1` (Indigo) or `#000000` (Sleek Black) | Use for buttons and active states. |
| **Font Style** | Inter, Outfit, or Montserrat | Modern, clean sans-serif fonts. |

---

## 2. Navigation Menu (Sidebar/Header)
Copy these titles exactly for your navigation links:

1.  **Dashboard** (Icon: LayoutDashboard)
2.  **Job Hub** (Icon: Briefcase)
3.  **My Projects** (Icon: Folder)
4.  **Team Ecosystem** (Icon: Users)
5.  **Calendar** (Icon: Calendar)
6.  **Analytics** (Icon: BarChart)
7.  **Notifications** (Icon: Bell)
8.  **Settings** (Icon: Settings)

---

## 3. Page-by-Page Content Details

### A. Login Page (`/login`)
*   **Main Title:** Welcome Back
*   **Subtitle:** Enter your credentials to access your studio dashboard.
*   **Fields:**
    *   `Username`: Label: "Username", Placeholder: "e.g. joni_clicks"
    *   `Password`: Label: "Password", Placeholder: "••••••••"
*   **Primary Button:** Sign In
*   **Footer Link:** "Don't have an account? **Register Now**"

### B. Signup Page (`/signup`)
*   **Main Title:** Join Lumière
*   **Subtitle:** Start managing your photography team and projects with ease.
*   **Fields:**
    *   `Full Name`: Label: "Full Name", Placeholder: "John Doe"
    *   `Phone`: Label: "Phone Number", Placeholder: "+91 98765 43210"
    *   `Username`: Label: "Username", Placeholder: "choose_unique_id"
    *   `Password`: Label: "Password", Placeholder: "Min. 8 characters"
    *   `User Type`: Label: "I am a...", Options: "Studio Owner", "Freelancer"
*   **Primary Button:** Create Account

### C. Dashboard / Overview (`/dashboard`)
*   **Greeting:** "Hello, {Name}!"
*   **Stats Cards Labels:**
    *   "Total Revenue" (Format: ₹XX,XXX)
    *   "Active Projects"
    *   "Pending Invites"
    *   "Team Size"
*   **Empty State Text:** "No recent activity yet. Post your first job to get started!"

### D. Job Hub (`/jobs`)
*   **Main Title:** Job Hub
*   **Subtitle:** Browse available opportunities or post a new requirement.
*   **Buttons:** "Post New Job", "Search Filters"
*   **Empty State:** "The Job Hub is quiet today. Check back later for new shoots!"

### E. Project Management (`/projects`)
*   **Main Title:** Project Portfolio
*   **Section Headers:** "To be Allocated", "In Progress", "Completed"
*   **Project Card Labels:**
    *   `Date`: "Shoot Date"
    *   `Budget`: "Total Budget"
    *   `Location`: "Venue/City"

### F. Team Ecosystem (`/team`)
*   **Main Title:** My Team
*   **Subtitle:** Manage your photographers and crew members.
*   **Button Text:** "Invite Member"
*   **Modal Title (Invite):** "Add New Team Member"
*   **Modal Fields:**
    *   `Phone`: "Search by Phone Number"
    *   `Display Name`: "Nickname/Role (e.g., Lead Photographer)"

---

## 4. Popup & Modal Details
These are the small windows that pop up over your main pages. Ensure these match the branding of their parent pages.

### A. Post New Job Modal
*   **Connected Page:** Job Hub (`/jobs`) or Dashboard
*   **Trigger:** "Post New Job" Button
*   **Modal Title:** Post a New Requirement
*   **Fields:**
    *   `Title`: "Wedding Shoot - Sharma"
    *   `Category`: Select (Wedding, Event, Cinematic, etc.)
    *   `Location`: "City Name"
    *   `Budget`: "Total Budget (₹)"
*   **Action Button:** Publish Job

### B. Send Job Invitation Modal
*   **Connected Page:** Team Ecosystem (`/team`) or Photographer Search
*   **Trigger:** "Send Job Request" (User Icon)
*   **Modal Title:** Send Job Invitation
*   **Subtitle:** Select a job to invite this photographer.
*   **Fields:**
    *   `Select Job`: Dropdown of your active jobs
    *   `Message`: "Optional message for the photographer"
    *   `Budget`: "Suggested pay for this role"
*   **Action Button:** Send Invitation

### C. Add Team Member Modal
*   **Connected Page:** Team Ecosystem (`/team`)
*   **Trigger:** "Invite Member" Button
*   **Modal Title:** Add Member to Team
*   **Fields:**
    *   `Phone`: Search input for photographer's phone
    *   `Display Name`: "How they appear in your team list"
    *   `Role/Category`: "Lead, Assistant, Editor, etc."
*   **Action Button:** Send Team Request

### D. Job Status / Tracking Modal
*   **Connected Page:** Job Hub (`/jobs`) — Studio Owner View
*   **Trigger:** "Tracking" (Users/History Icon) on a Job Card
*   **Modal Title:** Recruitment Status
*   **Content:**
    *   List of photographers contacted
    *   Status badges: `Accepted` (Green), `Declined` (Red), `Pending` (Yellow)
*   **Action Button:** Close

### E. Upgrade Subscription Modal
*   **Connected Page:** Dashboard (`/dashboard`) or Profile
*   **Trigger:** "Upgrade to Pro" or "Trial Expiring" banner
*   **Modal Title:** Unlock Pro Features
*   **Content:** "Access unlimited job posts, advanced analytics, and priority team search."
*   **Action Button:** Choose Plan

---

## 5. Professional Interaction Messages

### Success Messages (Toast Notifications)
*   **Login:** "Welcome back! Redirecting to dashboard..."
*   **Job Posted:** "Success! Your job has been posted to the hub."
*   **Invite Sent:** "Request sent successfully to {Name}."
*   **Profile Saved:** "Your changes have been updated."

### Error Messages
*   **Auth Failure:** "Invalid username or password. Please try again."
*   **Form Missing:** "Please fill in all required fields."
*   **Network Error:** "Connection lost. Please check your internet."
*   **Duplicate User:** "This username or phone number is already registered."

---

## 6. UI Elements & Micro-copy
*   **Delete Confirmation:** "Are you sure? This action cannot be undone."
*   **Accept Button:** "Accept Request"
*   **Decline Button:** "Decline"
*   **Load More:** "Show More Results"
*   **Save Changes:** "Update Profile"

---

## 7. Iconography Guide (Lucide-React / FontAwesome)
Use these icons for a "Lumière" look:
- **Camera** for logo/branding.
- **Sparkles** for "Pro" or "Premium" features.
- **CheckCircle** for completed tasks.
- **Clock** for pending requests.

> [!TIP]
> Keep your titles short and bold (H1). Use a slightly muted color (gray-500) for subtitles to create a visual hierarchy.
