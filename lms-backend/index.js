require("dotenv").config();
require("./mongo");

const express = require("express");
const cors = require("cors");
const User = require("./models/User");
const Course = require("./models/Course");

const app = express();
app.use(cors());
app.use(express.json());


// ---------- LOGIN ----------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  res.json(user);
});


// ---------- REGISTER ----------
app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role)
    return res.status(400).json({ message: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({
    email,
    password,
    role: role.toLowerCase(),
  });

  res.json(user);
});

// ---------- COURSES ----------
app.post("/courses", async (req, res) => {
  const course = await Course.create(req.body);
  res.json(course);
});

app.get("/courses", async (req, res) => {
  const courses = await Course.find()
    .populate("instructor")
    .populate("students");
  res.json(courses);
});


// ---------- INSTRUCTORS ----------
app.get("/users/instructors", async (req, res) => {
  const instructors = await User.find({ role: "instructor" });
  res.json(instructors);
});


// ---------- STUDENTS ----------
app.get("/users/students", async (req, res) => {
  const students = await User.find({ role: "student" });
  res.json(students);
});


// ---------- ASSIGN INSTRUCTOR ----------
app.put("/courses/:id/assign", async (req, res) => {
  const { instructorId } = req.body;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { instructor: instructorId },
    { new: true }
  ).populate("instructor");

  res.json(course);
});


// ---------- ENROLL STUDENT ----------
app.put("/courses/:id/enroll", async (req, res) => {
  const { studentId } = req.body;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { students: studentId } },
    { new: true }
  )
    .populate("instructor")
    .populate("students");

  res.json(course);
});


// ---------- STUDENT COURSES ----------
app.get("/my-courses/:studentId", async (req, res) => {
  const courses = await Course.find({ students: req.params.studentId })
    .populate("instructor");
  res.json(courses);
});

app.get("/instructor-courses/:instructorId", async (req, res) => {
  const courses = await Course.find({ instructor: req.params.instructorId })
    .populate("students");
  res.json(courses);
});

app.delete("/courses/:id", async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});




// ---------- DELETE USER ----------
app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send("User deleted");
  } catch (err) {
    res.status(500).send("Delete failed");
  }
});

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});


app.listen(5000, () => console.log("Server running on 5000"));
