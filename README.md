# MindFlow - Next.js 15 Application

## Project Overview
A modern web application built with Next.js 15 featuring:

- Authentication via NextAuth.js  
- PostgreSQL database with Prisma ORM  
- OpenAI API integration  
- Email functionality using Mailtrap (for development)

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)  
- PostgreSQL database  
- Git (for version control)

---

## Installation



### Install dependencies:

```bash
npm install
```

### Set up environment variables:

Create a `.env` file in the root directory with the following structure:

```env
# Database
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database_name>"

# NextAuth
NEXTAUTH_SECRET="your-secure-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Mailtrap Configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

---

## Database Setup

### Initialize Prisma:

```bash
npx prisma init
```

### Apply database schema:

```bash
npx prisma db push
```

### Generate Prisma Client:

```bash
npx prisma generate
```

### (Optional) Seed database:

```bash
npx prisma db seed
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Runs the app at: [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## Authentication

Configured using **NextAuth.js**.

Ensure you have:

- A valid `NEXTAUTH_SECRET`  
  *(can be generated using `openssl rand -base64 32`)*  
- Proper `NEXTAUTH_URL` set in your environment variables

---

## Email Setup

For development, we use **Mailtrap**.

For production:

- Replace Mailtrap credentials with a production SMTP service  
- Update the `EMAIL_FROM` address to match your domain

---

## Tech Stack

- **Framework**: Next.js 15  
- **Database**: PostgreSQL with Prisma ORM  
- **Authentication**: NextAuth.js  
- **AI Integration**: OpenAI API  
- **Email**: Nodemailer with Mailtrap (dev)

---

## Important Notes

- ❗ Never commit your `.env` file to version control  
- 🔒 Replace all placeholder values with actual credentials  
- 🚀 For production deployment:
  - Use proper secrets management  
  - Replace Mailtrap with a production email service  
  - Ensure all security best practices are followed
