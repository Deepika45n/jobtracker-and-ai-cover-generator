# JobTrack AI - Deep Technical Architecture & Codebase Documentation

## 1. Project Overview & Repository Structure
JobTrack AI is a full-stack web application. The monolithic repository contains both the Java Spring Boot backend (at the root level) and the React frontend (inside the `/frontend` directory).

### Directory Structure
```
jobtracker-and-ai-cover-generator/
├── src/
│   ├── main/
│   │   ├── java/com/jobtracker/           # Backend Java Source
│   │   │   ├── config/                    # Configuration (CORS, Security, Database)
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/                # REST API Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── JobApplicationController.java
│   │   │   │   └── AICoverLetterController.java
│   │   │   ├── model/                     # JPA Entity Models
│   │   │   │   ├── User.java
│   │   │   │   └── JobApplication.java
│   │   │   ├── repository/                # Spring Data JPA Interfaces
│   │   │   │   ├── UserRepository.java
│   │   │   │   └── JobApplicationRepository.java
│   │   │   ├── service/                   # Business Logic & Service Layer
│   │   │   │   ├── UserService.java
│   │   │   │   ├── JobApplicationService.java
│   │   │   │   ├── AICoverLetterService.java
│   │   │   │   └── AuthenticationService.java
│   │   │   ├── util/                      # Utility Classes
│   │   │   │   └── JwtTokenUtil.java
│   │   │   └── JobTrackerApplication.java # Main Spring Boot Entry Point
│   │   └── resources/                     # Backend Resources
│   │       ├── application.properties     # Database & Spring Configuration
│   │       ├── application-dev.properties
│   │       └── application-prod.properties
│   └── test/
│       └── java/com/jobtracker/           # Unit & Integration Tests
│           ├── controller/
│           └── service/
│
├── frontend/                              # React Frontend Application
│   ├── public/                            # Static Assets
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── assets/                        # Images, Icons, Fonts
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── components/                    # Reusable UI Components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/                         # Page-Level Components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   ├── AICoverLetter.jsx
│   │   │   └── NotFound.jsx
│   │   ├── store/                         # Zustand State Management
│   │   │   ├── authStore.js
│   │   │   ├── jobStore.js
│   │   │   └── themeStore.js
│   │   ├── hooks/                         # Custom React Hooks
│   │   │   ├── useAuth.js
│   │   │   └── useFetch.js
│   │   ├── utils/                         # Utility Functions
│   │   │   ├── api.js                     # API Client Configuration
│   │   │   ├── validators.js
│   │   │   └── formatters.js
│   │   ├── styles/                        # Global Styles
│   │   │   ├── index.css
│   │   │   ├── tailwind.css
│   │   │   └── variables.css
│   │   ├── App.jsx                        # Root React Component
│   │   └── main.jsx                       # React Entry Point
│   ├── .env.example                       # Environment Variables Template
│   ├── package.json                       # Node Dependencies
│   ├── tailwind.config.js                 # Tailwind CSS Configuration
│   ├── vite.config.js                     # Vite Build Configuration
│   └── .gitignore
│
├── pom.xml                                # Maven Project Configuration & Dependencies
├── .gitignore
├── README.md                              # Project Documentation
├── CONTRIBUTING.md                        # Contribution Guidelines
└── technical_documentation.md             # This File
```

---

## 2. Backend Implementation Details (Spring Boot)

The backend follows a classic MVC/N-Tier architecture.

### 2.1 Domain Models (`/model`)
- **`User.java`**: Represents a registered user.
  - Fields: `id`, `name`, `email`, `password`, `createdAt`.
  - Annotations: Uses `@Entity` and `@Table(name = "users")` for Hibernate ORM mapping.
- **`JobApplication.java`**: Represents a tracked job.
  - Fields: `id`, `company`, `position`, `status`, `appliedDate`, `userId`, etc.
  - Relation: Logically tied to the `User` via `userId`.

### 2.2 Data Access Layer (`/repository`)
- **`UserRepository.java`** & **`JobApplicationRepository.java`**: 
  - Extend `JpaRepository<T, ID>`.
  - Provide out-of-the-box CRUD methods.
  - Custom query methods like `findByEmail(String email)` and `findByUserId(Long userId)` are automatically implemented by Spring Data JPA.

### 2.3 Business Service Layer (`/service`)
- **`UserService.java`**:
  - Handles password validation.
  - **Password Reset Mechanism**: Generates a UUID token and stores it in a `ConcurrentHashMap<String, String>` mapping the token to the user's email.
- **`JobApplicationService.java`**:
  - Encapsulates logic for saving, updating, and fetching jobs for a specific user ID.
- **`AICoverLetterService.java`**:
  - **Integration**: Makes an HTTP POST request to the Anthropic API (`api.anthropic.com/v1/messages`).
  - **Prompt Engineering**: Constructs a system prompt combining the job description, the user's provided skills/resume, and desired tone (e.g., Professional, Enthusiastic) to generate a tailored cover letter.

### 2.4 REST Controllers (`/controller`)
Controllers are annotated with `@RestController` and map HTTP methods to service calls.
- **`AuthController.java`**: Exposes `/api/auth/register`, `/login`, `/forgot-password`, `/reset-password`. It catches runtime exceptions (like "Email already exists") and formats them into HTTP 400 Bad Request responses.
- **`JobApplicationController.java`**: Exposes CRUD endpoints under `/api/jobs`.
- **`AICoverLetterController.java`**: Exposes `/api/ai/generate-cover-letter`.

---

## 3. Frontend Implementation Details (React & Vite)

The frontend is a Single Page Application (SPA) built with React 18.

### 3.1 State Management (Zustand)
Zustand is used over Redux for its simplicity and reduced boilerplate.
- **`authStore.js`**: 
  - Manages the `user` state and `token`.
  - Integrates `fetch` API calls for login/register endpoints.
  - Persists session data using `localStorage` (`jt_session`) so users stay logged in after refreshing.
- **`jobStore.js`**:
  - Manages the array of `JobApplication` objects.
  - Exposes actions like `fetchJobs`, `addJob`, `updateJob`, and `deleteJob`.

### 3.2 Page Components (`/pages`)
- **`Login.jsx` & `Register.jsx`**:
  - Implement controlled forms using React `useState`.
  - Feature UI enhancements like real-time password strength indicators and password visibility toggles (`showPassword` state manipulating the input `type` attribute).
  - Handle complex flows like the 3-step Password Recovery modal (Email verification -> OTP -> New Password).
- **`Dashboard.jsx` / `MyApplications.jsx`**:
  - Consume data from `jobStore`.
  - Render statistics (Total Applied, Interviewing, Rejected) dynamically based on the current job array.
- **`AICoverLetter.jsx`**:
  - A dedicated form allowing users to paste a job description and their skills. It handles loading states while awaiting the Anthropic API response.

### 3.3 Theming & Styling
- **`index.css` & `tailwind.config.js`**:
  - Uses CSS variables mapped to Tailwind configuration to support dynamic light and dark modes.
  - Colors are referenced semantically (e.g., `bg-primary`, `text-accent`) rather than statically (e.g., `bg-white`).
- **`themeStore.js`**: Checks the user's OS preference via `window.matchMedia('(prefers-color-scheme: dark)')` to set the initial theme and applies the `.dark` class to the HTML root element.

---

## 4. Configuration and Environment Setup

- **Database Configuration (`application.properties`)**: 
  - Uses `spring.jpa.hibernate.ddl-auto=update` to automatically create/update database tables based on JPA entities.
  - Configures the MySQL connection string.
- **CORS Setup (`CorsConfig.java`)**: 
  - Implements `WebMvcConfigurer` to whitelist specific frontend ports (5173, 5174, 3000) overriding the default strict same-origin policies.
- **Environment Variables**:
  - Uses `${ANTHROPIC_API_KEY:}` syntax to pull API keys from the host OS securely.

## 5. End-to-End Flow Example: Generating a Cover Letter
1. **Frontend**: User pastes job details in `AICoverLetter.jsx` and clicks Generate.
2. **State**: Component sets `isGenerating(true)` and sends an HTTP POST to `/api/ai/generate-cover-letter`.
3. **Controller**: `AICoverLetterController` receives the JSON payload and passes it to the Service.
4. **Service**: `AICoverLetterService` formats the prompt, injects the `ANTHROPIC_API_KEY` into headers, and makes a synchronous REST call to Anthropic.
5. **Response**: Anthropic streams/returns the generated text. The backend wraps it in a success JSON object.
6. **Frontend**: Receives the text, updates the local state, stops the loading spinner, and displays the generated letter with a "Copy to Clipboard" utility.
