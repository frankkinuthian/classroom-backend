import express from "express";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Classroom backend is running." });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
