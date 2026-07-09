# Manual Setup Steps

After the code improvements, you need to complete these manual steps:

## 1. Environment Variables (Local Development)

The `.env.local` file has been updated with new environment variables. You need to:

1. **Get a Groq API Key** (if using Smart Fill feature):
   - Go to https://console.groq.com/
   - Sign up and create an API key
   - Replace `your_groq_api_key_here` in `.env.local` with your actual key

2. **Update Authentication Credentials** (IMPORTANT for production):
   - Change the default credentials in `.env.local`:
     ```
     VITE_ADMIN_USERNAME=admin  # Change this
     VITE_ADMIN_PASSWORD=admin6767  # Change this
     VITE_USER_USERNAME=user  # Change this
     VITE_USER_PASSWORD=user123  # Change this
     ```
   - Use strong, unique passwords for production

## 2. Vercel Deployment

If deploying to Vercel, you need to set environment variables in the Vercel dashboard:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

   **Required:**
   - `VITE_CONVEX_URL` - Your Convex deployment URL
   - `VITE_CONVEX_SITE_URL` - Your Convex site URL

   **Optional (for Smart Fill):**
   - `VITE_GROQ_API_KEY` - Your Groq API key

   **Authentication (CHANGE THESE):**
   - `VITE_ADMIN_USERNAME` - Admin username
   - `VITE_ADMIN_PASSWORD` - Admin password (use strong password)
   - `VITE_USER_USERNAME` - User username
   - `VITE_USER_PASSWORD` - User password (use strong password)

4. Redeploy your application after adding environment variables

## 3. Convex Database Setup

The application now uses Convex as the primary database for all data storage:

1. Ensure your Convex deployment is running:
   ```bash
   npx convex dev
   ```

2. The database schema is defined in `convex/schema.js` with tables for:
   - `coordinators` - Faculty coordinators
   - `venues` - Event venues
   - `eventTypes` - Event types
   - `reports` - Saved reports
   - `logos` - Logo configurations
   - `customTemplate` - Custom DOCX template
   - `userSettings` - User-specific settings (theme, accent)

3. The `initializeDefaults` mutation will automatically seed default data on first load:
   - Default coordinators (Dr Anusha K, Dr Braveen M)
   - Default venues (MG Auditorium, Kasturba Auditorium, etc.)
   - Default event types (Workshop, Hackathon, etc.)
   - Default logos (VIT Chennai, MIC, SWC, IIC, MLSA, VNEST)

4. No localStorage is used anymore - all data is stored in Convex
5. sessionStorage is only used for temporary draft storage during report creation

## 4. Testing the Changes

After setup, verify:

1. **Authentication** - Login with your configured credentials (admin goes to /admin, user goes to /user)
2. **Convex Integration** - Check that data is being saved to Convex (coordinators, venues, etc.)
3. **Admin Panel** - Verify admin panel is visible at /admin when logged in as admin
4. **Smart Fill** - If using Groq API, test the voice/text Smart Fill feature
5. **Microphone Access** - Test voice input in Smart Fill (should work with updated permissions)
6. **Code Splitting** - Check browser dev tools Network tab to see lazy-loaded components
7. **Linting** - Run `npm run lint` to check for code issues

## 5. Notes

- `.env.local` is already in `.gitignore` so your secrets won't be committed
- The application now requires Convex to be configured - there is no localStorage fallback
- All user settings (theme, accent) are persisted in Convex per user
- Camera permission was added to vercel.json to support potential future camera features
- oxlint configuration has been added for better code quality checks
- Draft reports are temporarily stored in sessionStorage during creation
