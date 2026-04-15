# Incubyte Salary Management

A Node.js/Express REST API for employee salary management with SQLite storage.

## Setup

```bash
npm install
npm start        # runs on http://localhost:3001
npm test         # runs test suite
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

## Tech Stack

- Node.js + Express
- SQLite (better-sqlite3)
- Jest + Supertest for testing

## Implementation Details

- AI tool used: Amazon Q in IDE
- Used AI to scaffold Express routes, SQLite setup, and Jest test suite
- TDD approach: tests written first covering CRUD, salary calculation (TDS rules), and metrics endpoints including edge cases (404s, missing fields, single employee metrics)
- In-memory SQLite (`:memory:`) used in tests for isolation; file-based `salary.db` in production
