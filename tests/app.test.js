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
