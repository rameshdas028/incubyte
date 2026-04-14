# Incubyte Salary Management

A full-stack salary management application with a Node.js/Express API backend and React frontend.

## Tech Stack

- **Backend:** Node.js, Express, in-memory array storage
- **Frontend:** React, Axios

## Setup

### Backend
```bash
cd backend
npm install
npm start        # runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm start        # runs on http://localhost:3000
```

## API Endpoints

### Employee CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/employees` | Create employee |
| GET | `/employees` | List all employees |
| GET | `/employees/:id` | Get employee by ID |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |

**Employee fields:** `full_name`, `job_title`, `country`, `salary`

### Salary Calculation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees/:id/salary` | Calculate net salary with deductions |

**Deduction rules:**
- India: 10% TDS
- United States: 12% TDS
- All others: No deductions

### Salary Metrics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/metrics/country/:country` | Min, max, avg salary by country |
| GET | `/metrics/job-title/:jobTitle` | Avg salary by job title |

