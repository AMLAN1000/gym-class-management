Gym Class Scheduling and Membership Management System
A comprehensive gym management system built with TypeScript, Express.js, Prisma, and MongoDB. The system manages three user roles (Admin, Trainer, Trainee) with role-based access control, class scheduling, and booking functionality.
Live Demo
Live API: https://gym-class-management-amlan-ahmeds-projects.vercel.app/
Project Overview
This system efficiently manages gym operations with:
3 User Roles: Admin, Trainer, Trainee (each with specific permissions)
Class Scheduling: Admins create schedules (max 5 per day, 2 hours each)
Booking System: Trainees book classes (max 10 per schedule)
Profile Management: Users manage their own profiles
JWT Authentication: Secure token-based authentication
Business Rules Enforcement: Prevents overbooking and scheduling conflicts
Relation Diagram

![Screenshot](diagram.png)


Database Models (Prisma Schema)
// User Model - Base user for all roles
model User {
  id                String          @id @default(auto()) @map("_id") @db.ObjectId
  email             String          @unique
  password          String
  name              String
  role              UserRole        // ADMIN | TRAINER | TRAINEE
  phone             String?
  traineeProfile    Trainee?
  trainerProfile    Trainer?
  createdSchedules  ClassSchedule[] @relation("AdminSchedules")
}

// Trainer Profile (extends User)
model Trainer {
  userId            String          @unique @db.ObjectId
  specialization    String?
  experience        Int?
  bio               String?
  assignedSchedules ClassSchedule[]
}

// Trainee Profile (extends User)
model Trainee {
  userId            String          @unique @db.ObjectId
  age               Int?
  bookings          Booking[]
}

// Class Schedule (created by Admin)
model ClassSchedule {
  className         String
  date              DateTime
  startTime         String
  endTime           String
  trainerId         String          @db.ObjectId
  adminId           String          @db.ObjectId
  maxTrainees       Int             @default(10)
  bookings          Booking[]
}

// Booking (Trainee books ClassSchedule)
model Booking {
  traineeId         String          @db.ObjectId
  scheduleId        String          @db.ObjectId
  bookedAt          DateTime        @default(now())
  cancelledAt       DateTime?
  @@unique([traineeId, scheduleId])
}

🛠️ Technology Stack
Language: TypeScript
Runtime: Node.js
Framework: Express.js
Database: MongoDB (Atlas)
ORM: Prisma
Authentication: JWT (JSON Web Tokens)
Password Hashing: bcryptjs
Validation: express-validator
Deployment: Vercel
Architecture: Modular Pattern
Admin Credentials
For testing purposes:
Email: admin@gym.com
Password: admin123

API Endpoints
Authentication Routes (Public)
Method
Endpoint
Description
POST
/api/auth/login
Login (all roles)
POST
/api/auth/register
Trainee self-registration

User Management Routes (ADMIN only)
Method
Endpoint
Description
POST
/api/users/create
Admin creates Trainer/Trainee
GET
/api/users/
Get all users

Trainee Routes (TRAINEE only)
Method
Endpoint
Description
GET
/api/trainees/profile
Get own profile
PUT
/api/trainees/profile
Update own profile

Trainer Routes (TRAINER only)
Method
Endpoint
Description
GET
/api/trainers/profile
Get own profile
PUT
/api/trainers/profile
Update own profile
GET
/api/trainers/schedules
View assigned schedules

Schedule Routes (ADMIN only)
Method
Endpoint
Description
POST
/api/schedules/create
Create class schedule
GET
/api/schedules
Get all schedules
GET
/api/schedules/:id
Get schedule by ID

Booking Routes (TRAINEE only)
Method
Endpoint
Description
POST
/api/bookings/book
Book a class
GET
/api/bookings/my-bookings
View own bookings
DELETE
/api/bookings/:id
Cancel booking



API Request/Response Examples
1. Login
Request:
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gym.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f8a9b1c2d3e4f5a6b7c8d9",
      "email": "admin@gym.com",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

2. Create Trainer (Admin)
Request:
POST /api/users/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "trainer@gym.com",
  "password": "trainer123",
  "name": "John Trainer",
  "role": "TRAINER",
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": "65f8a9b1c2d3e4f5a6b7c8da",
    "email": "trainer@gym.com",
    "name": "John Trainer",
    "role": "TRAINER",
    "phone": "+1234567890"
  }
}

3. Book Class (Trainee)
Request:
POST /api/bookings/book
Authorization: Bearer <trainee_token>
Content-Type: application/json

{
  "scheduleId": "65f8a9b1c2d3e4f5a6b7c8db"
}

Response:
{
  "success": true,
  "statusCode": 201,
  "message": "Class booked successfully",
  "data": {
    "id": "65f8a9b1c2d3e4f5a6b7c8dc",
    "traineeId": "65f8a9b1c2d3e4f5a6b7c8dd",
    "scheduleId": "65f8a9b1c2d3e4f5a6b7c8db",
    "bookedAt": "2025-01-15T10:30:00.000Z"
  }
}

Running Locally
Prerequisites
Node.js (v18 or higher)
MongoDB Atlas account (or local MongoDB)
Git
Installation Steps
Clone the repository
git clone https://github.com/AMLAN1000/gym-class-management.git
cd gym-class-management

Install dependencies
npm install

Setup environment variables
Create .env file in root directory:
NODE_ENV=development
PORT=5000
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

Generate Prisma Client
npx prisma generate

Push database schema
npx prisma db push

Seed admin user
npm run prisma:seed

Start development server
npm run dev

Server running at: http://localhost:5000

🧪 Testing Guide
Step 1: Login as Admin
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@gym.com",
  "password": "admin123"
}

Copy the token from the response.
Step 2: Create Trainer
POST http://localhost:5000/api/users/create
Authorization: Bearer <your_admin_token>
Content-Type: application/json

{
  "email": "trainer1@gym.com",
  "password": "trainer123",
  "name": "John Trainer",
  "role": "TRAINER"
}



Step 3: Create Class Schedule
POST http://localhost:5000/api/schedules/create
Authorization: Bearer <your_admin_token>
Content-Type: application/json

{
  "className": "Morning Yoga",
  "date": "2025-01-20",
  "startTime": "08:00",
  "endTime": "10:00",
  "trainerId": "<trainer_id_from_step2>"
}

Step 4: Register as Trainee
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "trainee1@gym.com",
  "password": "trainee123",
  "name": "Sarah Trainee"
}

Step 5: Book Class
POST http://localhost:5000/api/bookings/book
Authorization: Bearer <trainee_token>
Content-Type: application/json

{
  "scheduleId": "<schedule_id_from_step3>"
}

Business Rules Implemented
 Max 5 class schedules per day (enforced in schedule creation)
 Max 10 trainees per schedule (enforced in booking)
 Each class is 2 hours (validated in schedule creation)
 No double booking (prevents trainee from booking same time slot)
 Role-based access control (JWT + middleware)
 Secure password storage (bcrypt hashing)
📂 Project Structure
gym-class-management/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Admin seeding script
├── src/
│   ├── config/
│   │   └── index.ts        # Environment config
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/           # Authentication module
│   │   ├── user/           # User management module
│   │   ├── trainer/        # Trainer module
│   │   ├── trainee/        # Trainee module
│   │   ├── schedule/       # Schedule module
│   │   └── booking/        # Booking module
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── jwt.utils.ts
│   │   └── password.utils.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Entry point
├── .env                    # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json             # Vercel deployment config
└── README.md



