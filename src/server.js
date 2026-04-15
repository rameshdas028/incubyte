const { createDb } = require("./db");
const { createApp } = require("./app");

const db = createDb();
const app = createApp(db);
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
