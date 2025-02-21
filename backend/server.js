const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Root Route to Avoid 404 on "/"
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Dummy Data API! Use /generate endpoint." });
});

app.get("/generate", (req, res) => {
  const { fields, count } = req.query;

  if (!fields || !count) {
    return res.status(400).json({ error: "Fields and count are required" });
  }

  const countNumber = parseInt(count, 10);
  if (isNaN(countNumber) || countNumber <= 0) {
    return res.status(400).json({ error: "Count must be a positive number" });
  }

  const fieldList = fields.split(",");
  const validFields = ["firstName", "lastName", "email", "phoneNumber"];

  const invalidFields = fieldList.filter((field) => !validFields.includes(field));
  if (invalidFields.length > 0) {
    return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(", ")}` });
  }

  const records = [];

  for (let i = 0; i < countNumber; i++) {
    let record = {};
    fieldList.forEach((field) => {
      if (field === "firstName") record.firstName = faker.person.firstName();
      if (field === "lastName") record.lastName = faker.person.lastName();
      if (field === "email") record.email = faker.internet.email();
      if (field === "phoneNumber") record.phoneNumber = faker.phone.number();
    });
    records.push(record);
  }

  res.json({ data: records });
});

// Catch-all Route for Undefined Endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

