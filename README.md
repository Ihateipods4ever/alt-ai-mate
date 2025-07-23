# ALT-AI-MATE: The Development Super-Platform

Welcome to ALT-AI-MATE, the all-in-one, AI-powered platform that enables you to generate, develop, preview, deploy, and manage software applications, hardware prototypes, and their entire digital infrastructure from a single interface.

## Table of Contents

1.  [Technology Stack](#technology-stack)
2.  [Project Structure](#project-structure)
3.  [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
    * [Running the Application](#running-the-application)
4.  [Application Features](#application-features)

---

## Technology Stack

-   **Monorepo:** Managed with npm workspaces.
-   **Frontend:** React (Vite), TypeScript, Tailwind CSS
-   **UI Components:** shadcn/ui
-   **Backend:** Node.js, Express.js
-   **Database:** PostgreSQL (Schema provided for setup)
-   **Code Editor:** Monaco Editor (via `@monaco-editor/react`)
-   **Routing:** React Router DOM

---

## Project Structure

The project is organized as a monorepo to ensure clean separation of concerns and scalability.

alt-ai-mate/
├── packages/
│   ├── client/         # React Frontend Application
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── pages/      # Route-specific page components
│   │   │   ├── lib/        # Utility functions
│   │   │   ├── assets/     # Static assets (images, etc.)
│   │   │   └── App.tsx     # Main application component with routing
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── server/         # Node.js Backend Application
│       ├── src/
│       │   ├── api/      # API routes
│       │   └── index.ts  # Server entry point
│       └── package.json
│
├── package.json        # Root package.json for monorepo management
└── README.md           # This file


---

## Getting Started

Follow these instructions to get the ALT-AI-MATE platform running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) (v9.x or later)
-   [PostgreSQL](https://www.postgresql.org/download/) installed and running.

### Installation

1.  **Clone the repository:**
    (In a real-world scenario, you would use `git clone`. For this setup, simply create the file structure as described below).

2.  **Set up the PostgreSQL Database:**
    * Open your PostgreSQL terminal (`psql`).
    * Create a new user and database. Replace `alt_user` and `password` with your desired credentials.
        ```sql
        CREATE USER alt_user WITH PASSWORD 'password';
        CREATE DATABASE altaimate_db;
        GRANT ALL PRIVILEGES ON DATABASE altaimate_db TO alt_user;
        ```
    * Connect to the new database: `\c altaimate_db`
    * Run the following SQL to create the necessary tables. (Note: These are foundational schemas for the specified features).
        ```sql
        -- Users Table
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Projects Table
        CREATE TABLE projects (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            name VARCHAR(255) NOT NULL,
            project_type VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'Not Deployed',
            shareable_url VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Servers Table
        CREATE TABLE servers (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            provider VARCHAR(50) NOT NULL,
            server_type VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'Provisioning',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- IP Guard Applications Table
        CREATE TABLE ip_applications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            idea_description TEXT NOT NULL,
            creator_details TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'Drafting',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        ```

3.  **Create the project files:**
    Create the directory structure and all the files listed in the "Source Code" section below. Copy and paste the content for each file exactly as provided.

4.  **Install Dependencies:**
    * Navigate to the root directory of the project (`alt-ai-mate/`).
    * Run the following command to install all dependencies for both the client and server packages:
        ```bash
        npm install
        ```

### Running the Application

This command will start both the backend server and the frontend development server concurrently.

1.  From the root directory (`alt-ai-mate/`), run:
    ```bash
    npm run dev
    ```

2.  **Access the application:**
    * The backend server will be running on `http://localhost:3001`.
    * The frontend application will be available at `http://localhost:5173`. Open this URL in your web browser.

---

## Application Features

-   **Unified Dashboard:** A central hub for all your development activities.
-   **Multi-Page Layout:** Persistent sidebar and header for seamless navigation.
-   **Dark/Light Theme:** Professional theme catering to developer preferences.
-   **AI Project Generation:** A smart prompt engine to kickstart your projects.
-   **Integrated Editor:** An in-browser VS Code-like editor with live preview and an AI assistant.
-   **One-Click Deployment:** Simulate deploying your projects and managing domains.
-   **Server Management:** Provision and manage virtual servers from major cloud providers.
-   **IP Protection:** A guided wizard to help you draft and track copyright/patent applications.
-   **Hardware Prototyping:** A dedicated editor for designing hardware blueprints and generating a Bill of Materials.