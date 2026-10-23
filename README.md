# Government Service Token Management System

A web-based queue and token management system designed to streamline citizen services in government offices, such as transport management offices. The system digitizes token issuance, reduces physical queue congestion, and promotes fair **First-In, First-Out (FIFO)** service processing.

Developed as a **Database Management System (DBMS) project** for the Bachelor of Computer Applications (BCA) program.

## 🚀 Features

- **Citizen Portal:** Allows citizens to select a government service, enter their details, and generate a numbered token.
- **Queue Position Tracking:** Displays a citizen's position in the waiting queue.
- **Staff Dashboard:** Enables staff to select a service counter and process waiting tokens.
- **FIFO Queue Processing:** Prioritizes the oldest waiting token using SQL ordering based on creation time.
- **Token Lifecycle Management:** Tracks tokens through the following statuses:
  `WAITING` → `CALLED` → `COMPLETED`
- **Parameterized SQL Queries:** Uses the `mysql2` driver with parameterized queries to help prevent SQL injection.
- **Relational Database Design:** Uses MySQL tables and foreign-key relationships to maintain data integrity.
- **Responsive User Interface:** Uses Tailwind CSS to provide a clean, modern interface.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MySQL |
| Database Driver | `mysql2` |
| Frontend | HTML5, CSS, Vanilla JavaScript (ES6+) |
| Styling | Tailwind CSS via CDN |
| API Communication | REST-style HTTP endpoints and CORS |

## 🗄️ Database Design

The system uses a relational database named `token_management_system`, consisting of four core tables.

| Table | Purpose |
|---|---|
| `services` | Stores available government services, descriptions, and estimated processing durations. |
| `counters` | Stores information about service counters in the office. |
| `staff` | Stores staff information, login credentials, and roles. |
| `tokens` | Stores token records, citizen details, token statuses, timestamps, and relevant foreign-key references. |

### Token Status Workflow

```text
┌─────────┐
│ WAITING │
└────┬────┘
     │ Staff calls token
     ▼
┌────────┐
│ CALLED │
└────┬───┘
     │ Service completed
     ▼
┌───────────┐
│ COMPLETED │
└───────────┘
```

### Queue Processing Logic

Waiting tokens are retrieved in chronological order using SQL ordering such as:

```sql
SELECT *
FROM tokens
WHERE status = 'WAITING'
ORDER BY created_at ASC;
```

This query illustrates FIFO ordering. The actual query should also filter by the relevant service or counter if required by the application's database design.

## 📁 Project Structure

The following is an illustrative structure. Adjust the filenames to match your actual project.

```text
government-token-management-system/
├── index.html          # Citizen portal
├── staff.html          # Staff dashboard
├── server.js           # Express backend
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Locked dependency versions
├── database.sql        # Database schema and initial data
└── README.md           # Project documentation
```

## ⚙️ Installation and Setup

### Prerequisites

Ensure the following are installed:

- [Node.js](https://nodejs.org/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (optional, for database management)
- Git (optional, for cloning the repository)

### 1. Clone the Repository

Replace `YOUR_USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR_USERNAME/government-token-management-system.git
cd government-token-management-system
```

### 2. Install Dependencies

Install the required Node.js packages:

```bash
npm install express mysql2 cors
```

If the project already includes a `package.json` with the required dependencies, use:

```bash
npm install
```

### 3. Configure the Database

1. Start your MySQL server.
2. Open MySQL Workbench or your preferred MySQL client.
3. Execute the project's SQL script to create the database and its tables.
4. Insert any required initial records, such as services and counters.

If your SQL script is named `database.sql`, you can import it through MySQL Workbench or execute it using the MySQL command-line client.

Update the database connection settings in the backend configuration to match your local MySQL setup.

**Security note:** Keep database credentials in environment variables rather than committing passwords or other secrets to GitHub.

### 4. Start the Backend Server

Run:

```bash
node server.js
```

If configured as described, the Express server will be available at:

```text
http://localhost:3000
```

The actual port depends on the configuration in `server.js`.

### 5. Open the Frontend

Open `index.html` in your browser to access the Citizen Portal.

Open `staff.html` to access the Staff Dashboard.

Ensure the backend server is running and the frontend's API URLs match the backend configuration. If browser requests are blocked or fail when opening HTML files directly, serve the frontend over HTTP and configure CORS appropriately.

## 🔒 Security Considerations

- Use parameterized SQL queries for database operations.
- Store database credentials in environment variables.
- Validate and sanitize user input on the server.
- Hash staff passwords instead of storing plaintext passwords.
- Enforce appropriate staff authentication and authorization.
- Restrict database permissions to the minimum required.
- Avoid exposing sensitive citizen information through API responses.

These are recommended security practices; their implementation depends on the current project code.

## 🎯 Project Objectives

- Digitize the traditional token-based queue management process.
- Reduce unnecessary waiting and physical congestion.
- Improve the organization of government service counters.
- Demonstrate relational database design and SQL query implementation.
- Apply client-server architecture using Node.js, Express.js, and MySQL.
- Provide a foundation for future enhancements, such as live queue updates and reporting.

## 🔮 Future Enhancements

Potential improvements include:

- Real-time queue updates without manually refreshing the page.
- Staff authentication and role-based access control.
- Estimated waiting-time calculations.
- Administrative dashboards and service statistics.
- Token cancellation and expired-token handling.
- Printable tokens with QR codes.
- Queue history and reporting.

## 👨‍💻 Author

**Dipesh Karki**

BCA Student  
Gomendra Multiple College  
Purbanchal University

---

*Developed as an academic DBMS project to explore database-driven queue management and government service digitization.*
