# Project Setup Guide

This project consists of two parts:

- `client/` — React frontend powered by Vite
- `server/` — Spring Boot backend connected to MySQL

## Project Structure

```text
project-root/
├── client/
└── server/
```

---

# Prerequisites

Before running the project, make sure the following are installed:

- Node.js and npm
- Java JDK 17
- MySQL Server

The backend uses MySQL as its database, so MySQL must be installed and configured before starting the server.

---

# 1. Run the Client

The client is the React frontend and uses Vite as its development server.

### Step 1: Open a terminal in the project root

Move into the `client` directory:

```bash
cd client
```

### Step 2: Install dependencies

Run:

```bash
npm i
```

This installs all dependencies required by the React application.

### Step 3: Start the development server

Run:

```bash
npm run dev
```

Vite should start the frontend at:

```text
http://localhost:5173
```

Open that address in your browser.

---

# 2. Configure MySQL

**MySQL must be installed and configured properly before running the server.**

### Step 1: Open MySQL

Log in to your MySQL server using your preferred MySQL client.

### Step 2: Create a database

Create a database using the following command:

```sql
CREATE DATABASE project_name;
```

Replace `project_name` with the database name you want to use.

For example:

```sql
CREATE DATABASE ai_routine_maker;
```

Use a consistent lowercase naming convention for the database name.

---

# 3. Configure the Server

The server contains the Spring Boot backend.

### Step 1: Open `application.properties`

Navigate to:

```text
server/src/main/resources/application.properties
```

### Step 2: Configure the database URL

Find:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/######
```

Replace `######` with the database name you created in MySQL.

For example, if you created:

```sql
CREATE DATABASE ai_routine_maker;
```

change the property to:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ai_routine_maker
```

### Step 3: Configure the MySQL password

Find:

```properties
spring.datasource.password=########
```

Replace `########` with the actual password of your MySQL user.

For example:

```properties
spring.datasource.password=your_mysql_password
```

Do not commit your actual database password to a public GitHub repository.

---

# 4. Run the Server

### Step 1: Open a terminal in the project root

Move into the `server` directory:

```bash
cd server
```

### Step 2: Start the Spring Boot application

On Windows Command Prompt, run:

```cmd
mvnw.cmd spring-boot:run
```

On Windows PowerShell, run:

```cmd
.\mvnw.cmd spring-boot:run
```

The Maven Wrapper included with the project allows the Maven command to be run without requiring a separate Maven installation. Spring Boot provides the `spring-boot:run` goal for running the application from the command line.

Wait for Spring Boot to finish starting before using the application.

---

# Summary

#### Supposing the MySQL server is properly configured.

Open two separate terminals.

### Terminal 1 — Client

```cmd
cd client
npm i
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

### Terminal 2 — Server

```cmd
cd server
.\mvnw.cmd spring-boot:run
```

The backend will start according to its Spring Boot configuration.

At this point, both the React frontend and Spring Boot backend should be running.
