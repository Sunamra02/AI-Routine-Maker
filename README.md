# AI Routine Maker

A full-stack web app scaffold with a React frontend and a Spring Boot backend. The project is in early development — routing and page structure are in place, and most pages are currently placeholders.

## Tech Stack

**Frontend** (`client/`)
- React 19 + Vite
- React Router
- Tailwind CSS

**Backend** (`server/`)
- Spring Boot 4 (Java 21)
- Maven
- Lombok

## Project Structure

```
AI-Routine-Maker/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── pages/       # Home, About, Contacts, Courses
│       │   └── shared/      # Navbar
│       └── App.jsx          # Route definitions
└── server/                  # Spring Boot backend
    └── src/main/java/com/fsp/arm/
        ├── Main.java         # App entry point
        ├── Controller.java   # REST endpoints
        └── dto/User.java     # User data model
```

## Getting Started

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs the dev server (default: http://localhost:5173).

### Backend

```bash
cd server
./mvnw spring-boot:run
```

Runs the API on http://localhost:8000.
