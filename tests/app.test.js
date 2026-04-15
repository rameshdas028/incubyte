const request = require("supertest");
const { createDb } = require("../src/db");
const { createApp } = require("../src/app");

let db, app;

beforeEach(() => {
  db = createDb(":memory:");
  app = createApp(db);
});

afterEach(() => db.close());

const emp = { full_name: "John Doe", job_title: "Engineer", country: "India", salary: 100000 };

describe("POST /employees", () => {
  it("creates an employee and returns 201", async () => {
    const res = await request(app).post("/employees").send(emp);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), ...emp });
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/employees").send({ full_name: "X" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when salary is missing", async () => {
    const res = await request(app).post("/employees").send({ full_name: "X", job_title: "Y", country: "Z" });
    expect(res.status).toBe(400);
  });
});

describe("GET /employees", () => {
  it("returns empty array when no employees exist", async () => {
    const res = await request(app).get("/employees");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all employees", async () => {
    const r1 = await request(app).post("/employees").send(emp);
    expect(r1.status).toBe(201);
    const r2 = await request(app).post("/employees").send({ ...emp, full_name: "Jane Doe" });
    expect(r2.status).toBe(201);
    const res = await request(app).get("/employees");
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe("GET /employees/:id", () => {
  it("returns employee by id", async () => {
    const created = await request(app).post("/employees").send(emp);
    const res = await request(app).get(`/employees/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.full_name).toBe("John Doe");
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).get("/employees/999");
    expect(res.status).toBe(404);
  });
});

describe("PUT /employees/:id", () => {
  it("updates an employee", async () => {
    const created = await request(app).post("/employees").send(emp);
    const res = await request(app).put(`/employees/${created.body.id}`).send({ ...emp, full_name: "Jane Doe" });
    expect(res.status).toBe(200);
    expect(res.body.full_name).toBe("Jane Doe");
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).put("/employees/999").send(emp);
    expect(res.status).toBe(404);
  });

  it("returns 400 when fields are missing", async () => {
    const created = await request(app).post("/employees").send(emp);
    const res = await request(app).put(`/employees/${created.body.id}`).send({ full_name: "X" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /employees/:id", () => {
  it("deletes an employee and returns 204", async () => {
    const created = await request(app).post("/employees").send(emp);
    const res = await request(app).delete(`/employees/${created.body.id}`);
    expect(res.status).toBe(204);
    const list = await request(app).get("/employees");
    expect(list.body).toHaveLength(0);
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).delete("/employees/999");
    expect(res.status).toBe(404);
  });
});

// --- Salary Calculation ---

describe("GET /employees/:id/salary", () => {
  it("applies 10% TDS for India", async () => {
    const created = await request(app).post("/employees").send({ ...emp, country: "India", salary: 100000 });
    const res = await request(app).get(`/employees/${created.body.id}/salary`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ employee_id: created.body.id, gross_salary: 100000, deductions: { tds: 10000 }, net_salary: 90000 });
  });

  it("applies 12% TDS for United States", async () => {
    const created = await request(app).post("/employees").send({ ...emp, country: "United States", salary: 100000 });
    const res = await request(app).get(`/employees/${created.body.id}/salary`);
    expect(res.body.deductions.tds).toBe(12000);
    expect(res.body.net_salary).toBe(88000);
  });

  it("applies no deductions for other countries", async () => {
    const created = await request(app).post("/employees").send({ ...emp, country: "Germany", salary: 50000 });
    const res = await request(app).get(`/employees/${created.body.id}/salary`);
    expect(res.body.deductions.tds).toBe(0);
    expect(res.body.net_salary).toBe(50000);
  });

  it("returns 404 for non-existent employee", async () => {
    const res = await request(app).get("/employees/999/salary");
    expect(res.status).toBe(404);
  });
});

// --- Salary Metrics ---

describe("GET /metrics/country/:country", () => {
  it("returns min, max, avg salary for a country", async () => {
    await request(app).post("/employees").send({ ...emp, salary: 50000 });
    await request(app).post("/employees").send({ ...emp, salary: 100000 });
    await request(app).post("/employees").send({ ...emp, salary: 150000 });
    const res = await request(app).get("/metrics/country/India");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ min_salary: 50000, max_salary: 150000, avg_salary: 100000 });
  });

  it("returns correct values for single employee", async () => {
    await request(app).post("/employees").send({ ...emp, salary: 75000 });
    const res = await request(app).get("/metrics/country/India");
    expect(res.body).toEqual({ min_salary: 75000, max_salary: 75000, avg_salary: 75000 });
  });

  it("returns 404 when no employees in country", async () => {
    const res = await request(app).get("/metrics/country/Mars");
    expect(res.status).toBe(404);
  });
});

describe("GET /metrics/job-title/:jobTitle", () => {
  it("returns avg salary for a job title", async () => {
    await request(app).post("/employees").send({ ...emp, salary: 60000 });
    await request(app).post("/employees").send({ ...emp, salary: 80000 });
    const res = await request(app).get("/metrics/job-title/Engineer");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ avg_salary: 70000 });
  });

  it("returns 404 when no employees with job title", async () => {
    const res = await request(app).get("/metrics/job-title/Astronaut");
    expect(res.status).toBe(404);
  });

  it("only includes employees with matching job title", async () => {
    await request(app).post("/employees").send({ ...emp, job_title: "Engineer", salary: 100000 });
    await request(app).post("/employees").send({ ...emp, job_title: "Manager", salary: 200000 });
    const res = await request(app).get("/metrics/job-title/Engineer");
    expect(res.body.avg_salary).toBe(100000);
  });
});
