# LOTTERYLOT PWA - Complete Development Plan

## Overview

Build a Progressive Web App (PWA) for Kerala lottery shop owners to view and print lottery results. The app uses Next.js App Router, custom JWT authentication, Supabase for database and storage, and integrates with IndiaLotteryAPI.com for live lottery data.

---

## Architecture Overview

### Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (for client logos)
- **Authentication**: Custom JWT (httpOnly cookies)
- **API Client**: axios
- **External API**: IndiaLotteryAPI.com
- **Deployment**: Vercel
- **Styling**: Tailwind CSS (for simple, large-button UI)

### Why This Stack?

- **Next.js App Router**: Modern React framework with built-in API routes, perfect for full-stack apps
- **Supabase**: Managed PostgreSQL + Storage, no need for separate services
- **JWT over Supabase Auth**: Full control over auth flow, simpler for MVP
- **httpOnly Cookies**: More secure than localStorage (prevents XSS attacks)

---

## Database Schema

### Why Only 2 Tables?

This MVP uses a minimal schema:

- **users**: Handles authentication and authorization (role-based)
- **client_details**: Stores branding info only for clients (admins don't need logos)

This separation keeps concerns clean: auth vs. branding.

### Table 1: users

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster login lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

**Explanation**:

- `id`: UUID primary key (Supabase standard)
- `username`: Unique login identifier
- `password_hash`: bcrypt hash (never store plain passwords)
- `role`: Either 'admin' or 'client' (enforced by CHECK constraint)
- `is_active`: Soft delete flag (can disable users without deleting)
- `created_at`: Audit trail

### Table 2: client_details

```sql
-- Create client_details table
CREATE TABLE client_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_text TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_client_details_user_id ON client_details(user_id);
```

**Explanation**:

- `user_id`: Foreign key to users (UNIQUE ensures one detail record per client)
- `display_text`: Custom branding text (e.g., "ABC Lottery Shop")
- `logo_url`: Path to logo in Supabase Storage
- `ON DELETE CASCADE`: If user is deleted, their details are auto-deleted

**Why Admins Aren't Here**: Admins don't need logos or branding. They only manage users.

---

## Project Structure

```
lotterylot-pwa/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   └── layout.tsx
│   ├── (protected)/             # Protected routes group
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Home with big buttons
│   │   ├── results/
│   │   │   ├── page.tsx         # Latest result view
│   │   │   └── [date]/
│   │   │       └── page.tsx     # Result by date
│   │   ├── admin/
│   │   │   ├── page.tsx         # Admin dashboard
│   │   │   ├── users/
│   │   │   │   ├── page.tsx     # User list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Edit user
│   │   │   └── layout.tsx       # Admin-only layout
│   │   └── layout.tsx           # Protected layout (JWT check)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts     # POST /api/auth/login
│   │   │   └── logout/
│   │   │       └── route.ts     # POST /api/auth/logout
│   │   └── lottery/
│   │       ├── latest/
│   │       │   └── route.ts     # GET /api/lottery/latest
│   │       └── date/
│   │           └── route.ts     # GET /api/lottery/date?date=YYYY-MM-DD
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Redirect to login/dashboard
├── lib/
│   ├── db/
│   │   └── supabase.ts          # Supabase client (DB only)
│   ├── storage/
│   │   └── supabase-storage.ts  # Supabase Storage client
│   ├── auth/
│   │   ├── jwt.ts               # JWT encode/decode utilities
│   │   ├── cookies.ts           # Cookie helpers (httpOnly)
│   │   └── middleware.ts        # JWT validation middleware
│   ├── api/
│   │   └── lottery-api.ts       # axios wrapper for IndiaLotteryAPI.com
│   └── utils/
│       └── bcrypt.ts            # Password hashing
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx           # Large button component
│   │   ├── DatePicker.tsx       # Date search input
│   │   ├── PDFViewer.tsx        # PDF display with logo overlay
│   │   └── WarningModal.tsx     # "Not today's result" popup
│   ├── protected/
│   │   └── ProtectedRoute.tsx  # Client-side route guard
│   └── admin/
│       ├── UserList.tsx
│       ├── UserForm.tsx
│       └── LogoUpload.tsx
├── types/
│   ├── user.ts                  # User types
│   ├── lottery.ts               # Lottery result types
│   └── api.ts                   # API response types
├── .env.local                   # Environment variables
├── next.config.js               # Next.js config (PWA settings)
├── package.json
└── README.md
```

---

## JWT Authentication Deep Dive

### What is JWT?

JWT (JSON Web Token) is a compact, URL-safe token format. It has 3 parts:

1. **Header**: Algorithm + token type
2. **Payload**: Data (user_id, username, role)
3. **Signature**: Ensures token hasn't been tampered with

**Format**: `header.payload.signature` (base64 encoded)

### Why JWT?

- **Stateless**: Server doesn't need to store sessions
- **Portable**: Token contains all user info
- **Secure**: Signature prevents tampering

### Login Flow

```
1. User submits username + password
2. Server verifies credentials against DB
3. If valid → generate JWT with user data
4. Set JWT as httpOnly cookie
5. Client redirects to dashboard
```

### Implementation

**File**: `lib/auth/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!; // Must be strong random string

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin' | 'client';
}

export function encodeJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null; // Invalid or expired
  }
}
```

**File**: `lib/auth/cookies.ts`

```typescript
import { cookies } from 'next/headers';

const COOKIE_NAME = 'lotterylot_token';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,    // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',   // CSRF protection
    maxAge: MAX_AGE,
    path: '/',
  });
}

export function getAuthCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

export function deleteAuthCookie() {
  cookies().delete(COOKIE_NAME);
}
```

**Why httpOnly?**: Prevents XSS attacks. JavaScript can't read the cookie, so even if malicious script runs, it can't steal the token.

### Protected Route Example

**File**: `app/(protected)/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getAuthCookie } from '@/lib/auth/cookies';
import { decodeJWT } from '@/lib/auth/jwt';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = getAuthCookie();
  
  if (!token) {
    redirect('/login');
  }

  const payload = decodeJWT(token);
  
  if (!payload) {
    redirect('/login'); // Invalid token
  }

  return <>{children}</>;
}
```

---

## API Wrapper (axios)

### Why axios?

- Better error handling than fetch
- Request/response interceptors
- Automatic JSON parsing
- Built-in timeout support

### Implementation

**File**: `lib/api/lottery-api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.indialotteryapi.com';
const API_KEY = process.env.INDIA_LOTTERY_API_KEY!;

// Create axios instance with base config
const lotteryAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`, // Adjust based on API docs
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Error interceptor
lotteryAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Lottery API Error:', error.response?.data || error.message);
    throw error;
  }
);

export interface LotteryResult {
  date: string;
  draw: string;
  category: string;
  winningNumbers: string[];
  pdfUrl: string;
}

export async function getLatestResult(): Promise<LotteryResult> {
  const response = await lotteryAPI.get('/kerala/latest');
  return response.data;
}

export async function getResultByDate(date: string): Promise<LotteryResult> {
  // date format: YYYY-MM-DD
  const response = await lotteryAPI.get(`/kerala/date/${date}`);
  return response.data;
}
```

**Note**: Adjust endpoints and auth headers based on actual IndiaLotteryAPI.com documentation.

---

## Development Roadmap

### Phase 1: Project Setup (Day 1)

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest lotterylot-pwa --typescript --tailwind --app
   ```

2. **Install dependencies**
   ```bash
   npm install axios jsonwebtoken bcryptjs
   npm install -D @types/jsonwebtoken @types/bcryptjs
   ```

3. **Set up Supabase**

   - Create Supabase project
   - Run SQL schema (users + client_details tables)
   - Create storage bucket: `client-logos`
   - Get Supabase URL + anon key

4. **Environment variables** (`.env.local`)
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   JWT_SECRET=your_strong_random_secret
   INDIA_LOTTERY_API_KEY=your_api_key
   ```

5. **Create folder structure** (as outlined above)

### Phase 2: Authentication (Day 2-3)

1. **Implement JWT utilities** (`lib/auth/jwt.ts`, `lib/auth/cookies.ts`)
2. **Create login API route** (`app/api/auth/login/route.ts`)

   - Hash password with bcrypt
   - Verify against DB
   - Generate JWT
   - Set cookie

3. **Create logout API route** (`app/api/auth/logout/route.ts`)
4. **Build login page** (`app/(auth)/login/page.tsx`)

   - Simple form (username + password)
   - Large submit button
   - Error handling

5. **Create protected layout** (`app/(protected)/layout.tsx`)

   - JWT validation
   - Redirect if invalid

### Phase 3: Database & Supabase Setup (Day 3)

1. **Create Supabase client** (`lib/db/supabase.ts`)
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   export const supabase = createClient(
     process.env.SUPABASE_URL!,
     process.env.SUPABASE_ANON_KEY!
   );
   ```

2. **Create password hashing utility** (`lib/utils/bcrypt.ts`)
   ```typescript
   import bcrypt from 'bcryptjs';
   
   export async function hashPassword(password: string): Promise<string> {
     return bcrypt.hash(password, 10);
   }
   
   export async function verifyPassword(
     password: string,
     hash: string
   ): Promise<boolean> {
     return bcrypt.compare(password, hash);
   }
   ```

3. **Seed initial admin user** (one-time script)

   - Create admin account manually via SQL or script

### Phase 4: Lottery API Integration (Day 4)

1. **Create axios wrapper** (`lib/api/lottery-api.ts`)
2. **Create API routes**:

   - `app/api/lottery/latest/route.ts` → calls `getLatestResult()`
   - `app/api/lottery/date/route.ts` → calls `getResultByDate()`

3. **Test API integration** (mock if needed)

### Phase 5: Client Features (Day 5-6)

1. **Dashboard page** (`app/(protected)/dashboard/page.tsx`)

   - Three large buttons:
     - "Latest Result"
     - "Search by Date"
     - "Print"

2. **Latest result page** (`app/(protected)/results/page.tsx`)

   - Fetch and display result
   - Show PDF viewer
   - Print button

3. **Date search page** (`app/(protected)/results/[date]/page.tsx`)

   - Date picker
   - Fetch result for selected date
   - **Date validation logic**:
     ```typescript
     const today = new Date().toISOString().split('T')[0];
     if (selectedDate !== today) {
       // Show warning modal
     }
     ```


4. **PDF viewer component** (`components/ui/PDFViewer.tsx`)

   - Display PDF (iframe or react-pdf)
   - Logo overlay in print mode
   - Print functionality

5. **Warning modal** (`components/ui/WarningModal.tsx`)

   - "This is not today's result" message

### Phase 6: Admin Features (Day 7-8)

1. **Admin layout** (`app/(protected)/admin/layout.tsx`)

   - Check role === 'admin'
   - Redirect if not admin

2. **Admin dashboard** (`app/(protected)/admin/page.tsx`)

   - List of all users
   - "Create User" button

3. **User management**:

   - `app/(protected)/admin/users/page.tsx` → User list
   - `app/(protected)/admin/users/[id]/page.tsx` → Edit user
   - User form component (`components/admin/UserForm.tsx`)
     - Username + password fields
     - Role selector
     - Logo upload
     - Display text input

4. **Logo upload** (`components/admin/LogoUpload.tsx`)

   - Upload to Supabase Storage
   - Store URL in `client_details.logo_url`

### Phase 7: Styling & UX (Day 9)

1. **Large button component** (`components/ui/Button.tsx`)

   - Minimum 60px height
   - Large text (18px+)
   - High contrast colors

2. **Responsive design** (mobile-first)
3. **Loading states** (spinners, skeletons)
4. **Error handling** (user-friendly messages)

### Phase 8: PWA Configuration (Day 10)

1. **Next.js PWA setup** (`next.config.js`)
   ```javascript
   const withPWA = require('next-pwa')({
     dest: 'public',
     disable: process.env.NODE_ENV === 'development',
   });
   
   module.exports = withPWA({
     // Next.js config
   });
   ```

2. **Manifest file** (`public/manifest.json`)

   - App name, icons, theme colors

3. **Service worker** (auto-generated by next-pwa)

### Phase 9: Testing & Deployment (Day 11-12)

1. **Manual testing**:

   - Login/logout flow
   - Date validation
   - PDF printing with logo
   - Admin user creation

2. **Deploy to Vercel**:

   - Connect GitHub repo
   - Set environment variables
   - Deploy

3. **Post-deployment checks**:

   - HTTPS (required for httpOnly cookies)
   - API endpoints working
   - Supabase connection

---

## Best Practices

### Security

- **Never store passwords in plain text** (always bcrypt)
- **Use httpOnly cookies** (prevents XSS)
- **Validate JWT on every request** (don't trust client)
- **Use HTTPS in production** (required for secure cookies)
- **Sanitize user inputs** (prevent SQL injection via Supabase client)

### Code Quality

- **TypeScript** for type safety
- **Error boundaries** for graceful failures
- **Loading states** for better UX
- **Consistent error messages**

### Performance

- **Server-side rendering** (Next.js default)
- **Image optimization** (Next.js Image component)
- **API route caching** (if needed)

---

## Key Files to Create

1. `lib/auth/jwt.ts` - JWT encoding/decoding
2. `lib/auth/cookies.ts` - Cookie management
3. `lib/api/lottery-api.ts` - axios wrapper
4. `app/api/auth/login/route.ts` - Login endpoint
5. `app/(protected)/layout.tsx` - Protected route guard
6. `app/(protected)/dashboard/page.tsx` - Main dashboard
7. `components/ui/WarningModal.tsx` - Date validation popup
8. `components/ui/PDFViewer.tsx` - PDF display with logo

---

## Environment Variables Checklist

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=          # Generate: openssl rand -base64 32
INDIA_LOTTERY_API_KEY=
NODE_ENV=production
```

---

## Next Steps After Plan Approval

1. Initialize Next.js project
2. Set up Supabase database (run SQL schema)
3. Implement authentication system
4. Build client-facing features
5. Add admin panel
6. Deploy to Vercel