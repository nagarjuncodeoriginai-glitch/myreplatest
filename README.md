# HR & Employee Management System (HRMS)

A modern enterprise-level HR and Employee Management Web Application built with Next.js 15, TypeScript, Tailwind CSS, and MySQL.

## Features

### HR/Admin Portal
- **Employee Management** - Add, edit, delete, search, and filter employees
- **Leave Management** - Approve/reject leave requests with full history
- **Dashboard Analytics** - Real-time stats, department distribution, recent activities
- **Secure Authentication** - JWT-based auth with role-based access control

### Employee Portal
- **Self-Service Dashboard** - View leave balance, pending requests, history
- **Leave Application** - Apply for Casual Leave (CL) with validation
- **Profile View** - Complete onboarding details and employment info
- **Leave History** - Track all leave applications and status

### Leave Policy
- **2 CL per month** per employee
- **No carry-forward** - unused leaves expire monthly
- **Automatic reset** on the 1st of each month

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| UI Components | Custom ShadCN-inspired components |
| Authentication | JWT (jose), bcryptjs |
| Database | MySQL with mysql2 |
| Validation | Zod, React Hook Form |
| Icons | Lucide React |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MySQL credentials

# Set up the database
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hr_management
JWT_SECRET=your-super-secret-key
```

## Default Credentials

### HR Admin
- **Username:** `codeorigin`
- **Password:** `hrcodeoriginai@1234`

### Employee
- Created by HR through the admin portal

## Project Structure

```
src/
├── app/
│   ├── api/          # API Routes
│   │   ├── auth/     # Login, logout, me
│   │   ├── employees/# CRUD operations
│   │   ├── leaves/   # Leave management
│   │   └── dashboard/# Stats & analytics
│   ├── hr/           # HR Dashboard pages
│   ├── employee/     # Employee Dashboard pages
│   ├── login/        # Login page
│   └── page.tsx      # Landing page
├── components/       # Reusable UI components
├── database/         # DB connection, schema, seeds
├── lib/              # Auth, utils, validations
├── types/            # TypeScript type definitions
└── middleware.ts     # Auth & route protection
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login (HR & Employee) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/employees` | List employees (HR) |
| POST | `/api/employees` | Create employee (HR) |
| GET | `/api/employees/[id]` | Get employee details |
| PUT | `/api/employees/[id]` | Update employee (HR) |
| DELETE | `/api/employees/[id]` | Delete employee (HR) |
| GET | `/api/leaves` | List leaves |
| POST | `/api/leaves` | Apply for leave (Employee) |
| PUT | `/api/leaves/[id]` | Approve/Reject (HR) |
| GET | `/api/leaves/balance` | Get leave balance |
| POST | `/api/leaves/reset` | Monthly balance reset |
| GET | `/api/dashboard/hr` | HR dashboard stats |
| GET | `/api/dashboard/employee` | Employee dashboard stats |

## Security Features

- JWT authentication with httpOnly cookies
- Bcrypt password hashing (12 rounds)
- Role-based access control middleware
- SQL injection protection (parameterized queries)
- Input validation with Zod schemas
- Secure cookie configuration
- Session timeout (8 hours)

## Deployment

### Vercel (Frontend)
```bash
vercel deploy
```

### Database
- Use any MySQL-compatible cloud database (PlanetScale, AWS RDS, Railway)
- Run the seed script to initialize the schema and admin account

## License

MIT
