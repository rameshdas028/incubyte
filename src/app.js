const express = require("express");

function createApp(db) {
  const app = express();
  app.use(express.json());

  app.post("/employees", (req, res) => {
    const { full_name, job_title, country, salary } = req.body;
    if (!full_name || !job_title || !country || salary == null) {
      return res.status(400).json({ error: "full_name, job_title, country, and salary are required" });
    }
    const result = db.prepare("INSERT INTO employees (full_name, job_title, country, salary) VALUES (?, ?, ?, ?)").run(full_name, job_title, country, salary);
    const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(employee);
  });

  app.get("/employees", (_req, res) => {
    res.json(db.prepare("SELECT * FROM employees").all());
  });

  app.get("/employees/:id", (req, res) => {
    const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  });

  app.put("/employees/:id", (req, res) => {
    const { full_name, job_title, country, salary } = req.body;
    if (!full_name || !job_title || !country || salary == null) {
      return res.status(400).json({ error: "full_name, job_title, country, and salary are required" });
    }
    const result = db.prepare("UPDATE employees SET full_name = ?, job_title = ?, country = ?, salary = ? WHERE id = ?").run(full_name, job_title, country, salary, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Employee not found" });
    res.json(db.prepare("SELECT * FROM employees WHERE id = ?").get(req.params.id));
  });

  app.delete("/employees/:id", (req, res) => {
    const result = db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Employee not found" });
    res.status(204).send();
  });

  // --- Salary Calculation ---

  app.get("/employees/:id/salary", (req, res) => {
    const employee = db.prepare("SELECT * FROM employees WHERE id = ?").get(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const gross = employee.salary;
    let tds = 0;
    if (employee.country === "India") tds = gross * 0.1;
    else if (employee.country === "United States") tds = gross * 0.12;

    res.json({ employee_id: employee.id, gross_salary: gross, deductions: { tds }, net_salary: gross - tds });
  });

  // --- Salary Metrics ---

  app.get("/metrics/country/:country", (req, res) => {
    const row = db.prepare("SELECT MIN(salary) as min_salary, MAX(salary) as max_salary, AVG(salary) as avg_salary FROM employees WHERE country = ?").get(req.params.country);
    if (row.min_salary == null) return res.status(404).json({ error: "No employees found for this country" });
    res.json(row);
  });

  app.get("/metrics/job-title/:jobTitle", (req, res) => {
    const row = db.prepare("SELECT AVG(salary) as avg_salary FROM employees WHERE job_title = ?").get(req.params.jobTitle);
    if (row.avg_salary == null) return res.status(404).json({ error: "No employees found for this job title" });
    res.json(row);
  });

  return app;
}

module.exports = { createApp };
