require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Student = require("./models/Student");
const LostItem = require("./models/LostItem");
const FoundItem = require("./models/FoundItem");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
  res.render("home", { title: "Campus Lost & Found", message: null });
});

// Student creation form
app.get("/students/new", (req, res) => {
  res.render("student-form", { title: "Create Student Profile", error: null, values: {} });
});

// Create a student profile
app.post("/students", async (req, res, next) => {
  try {
    const { fullName, email, department, contactNumber } = req.body;
    const values = { fullName, email, department, contactNumber };

    if (![fullName, email, department, contactNumber].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).render("student-form", {
        title: "Create Student Profile",
        error: "Please fill in every field.",
        values
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).render("student-form", {
        title: "Create Student Profile", error: "Please enter a valid email address.", values
      });
    }

    const existingStudent = await Student.findOne({ email: cleanEmail });
    if (existingStudent) {
      return res.status(409).render("student-form", {
        title: "Create Student Profile", error: "A student with this email already exists.", values
      });
    }

    const student = await Student.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      department: department.trim(),
      contactNumber: contactNumber.trim()
    });
    return res.redirect(`/students/${student._id}`);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render("student-form", {
        title: "Create Student Profile",
        error: "A student with this email already exists.",
        values: req.body
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).render("student-form", {
        title: "Create Student Profile", error: error.message, values: req.body
      });
    }
    next(error);
  }
});

// Display one student profile
app.get("/students/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).render("error", {
        title: "Invalid student ID", status: 400,
        message: "The student ID in this URL is not valid."
      });
    }
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).render("error", {
        title: "Student not found", status: 404,
        message: "We could not find a student with that ID."
      });
    }
    res.render("student-details", { title: "Student Profile", student });
  } catch (error) {
    next(error);
  }
});

// Form to report a lost item
app.get("/lost-items/new", async (req, res, next) => {
  try {
    const students = await Student.find().sort({ fullName: 1 });
    res.render("lost-item-form", {
      title: "Report a Lost Item", students, error: null, values: {}
    });
  } catch (error) {
    next(error);
  }
});

// Create a lost-item report
app.post("/lost-items", async (req, res, next) => {
  try {
    const { itemName, category, description, lastSeenLocation, dateLost, reportedBy } = req.body;
    const values = req.body;
    const students = await Student.find().sort({ fullName: 1 });

    if (![itemName, category, description, lastSeenLocation, dateLost, reportedBy]
      .every(v => typeof v === "string" && v.trim())) {
      return res.status(400).render("lost-item-form", {
        title: "Report a Lost Item", students, error: "Please fill in every field.", values
      });
    }
    if (!mongoose.isValidObjectId(reportedBy)) {
      return res.status(400).render("lost-item-form", {
        title: "Report a Lost Item", students, error: "Please select a valid student.", values
      });
    }
    const student = await Student.findById(reportedBy);
    if (!student) {
      return res.status(404).render("lost-item-form", {
        title: "Report a Lost Item", students, error: "The selected student does not exist.", values
      });
    }
    const parsedDate = new Date(dateLost);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).render("lost-item-form", {
        title: "Report a Lost Item", students, error: "Please enter a valid date.", values
      });
    }

    const item = await LostItem.create({
      itemName: itemName.trim(), category: category.trim(),
      description: description.trim(), lastSeenLocation: lastSeenLocation.trim(),
      dateLost: parsedDate, reportedBy: student._id
    });
    res.redirect(`/lost-items/${item._id}`);
  } catch (error) {
    next(error);
  }
});

// List lost items with optional search
app.get("/lost-items", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = search ? {
      $or: [
        { itemName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { lastSeenLocation: { $regex: search, $options: "i" } }
      ]
    } : {};
    const items = await LostItem.find(filter).populate("reportedBy").sort({ createdAt: -1 });
    res.render("lost-items", { title: "Lost Items", items, search });
  } catch (error) {
    next(error);
  }
});

// Display one lost item
app.get("/lost-items/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).render("error", {
        title: "Invalid item ID", status: 400, message: "The lost-item ID is not valid."
      });
    }
    const item = await LostItem.findById(req.params.id).populate("reportedBy");
    if (!item) {
      return res.status(404).render("error", {
        title: "Lost item not found", status: 404, message: "This lost-item report does not exist."
      });
    }
    res.render("lost-item-details", { title: item.itemName, item });
  } catch (error) {
    next(error);
  }
});

// Form to report a found item
app.get("/found-items/new", async (req, res, next) => {
  try {
    const students = await Student.find().sort({ fullName: 1 });
    res.render("found-item-form", {
      title: "Report a Found Item", students, error: null, values: {}
    });
  } catch (error) {
    next(error);
  }
});

// Create a found-item report
app.post("/found-items", async (req, res, next) => {
  try {
    const { itemName, category, description, foundLocation, dateFound, reportedBy } = req.body;
    const values = req.body;
    const students = await Student.find().sort({ fullName: 1 });

    if (![itemName, category, description, foundLocation, dateFound, reportedBy]
      .every(v => typeof v === "string" && v.trim())) {
      return res.status(400).render("found-item-form", {
        title: "Report a Found Item", students, error: "Please fill in every field.", values
      });
    }
    if (!mongoose.isValidObjectId(reportedBy)) {
      return res.status(400).render("found-item-form", {
        title: "Report a Found Item", students, error: "Please select a valid student.", values
      });
    }
    const student = await Student.findById(reportedBy);
    if (!student) {
      return res.status(404).render("found-item-form", {
        title: "Report a Found Item", students, error: "The selected student does not exist.", values
      });
    }
    const parsedDate = new Date(dateFound);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).render("found-item-form", {
        title: "Report a Found Item", students, error: "Please enter a valid date.", values
      });
    }

    const item = await FoundItem.create({
      itemName: itemName.trim(), category: category.trim(),
      description: description.trim(), foundLocation: foundLocation.trim(),
      dateFound: parsedDate, reportedBy: student._id
    });
    res.redirect(`/found-items/${item._id}`);
  } catch (error) {
    next(error);
  }
});

// List found items
app.get("/found-items", async (req, res, next) => {
  try {
    const items = await FoundItem.find().populate("reportedBy").sort({ createdAt: -1 });
    res.render("found-items", { title: "Found Items", items });
  } catch (error) {
    next(error);
  }
});

// Display one found item (claims are Phase 2)
app.get("/found-items/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).render("error", {
        title: "Invalid item ID", status: 400, message: "The found-item ID is not valid."
      });
    }
    const item = await FoundItem.findById(req.params.id).populate("reportedBy");
    if (!item) {
      return res.status(404).render("error", {
        title: "Found item not found", status: 404, message: "This found-item report does not exist."
      });
    }
    res.render("found-item-details", { title: item.itemName, item });
  } catch (error) {
    next(error);
  }
});

// 404 page for unknown routes
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page not found", status: 404, message: "The page you requested could not be found."
  });
});

// General error handler
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).render("error", {
    title: "Server error", status: 500,
    message: "Something went wrong. Check that MongoDB is running and try again."
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Add it to your .env file.");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Could not start the application:", error.message);
    process.exit(1);
  }
}

startServer();