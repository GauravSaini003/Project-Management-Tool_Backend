const express = require("express");
const cors = require("cors");
const session = require("express-session");
const sequelize = require("./config/database");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/task");
const projectRoutes = require("./routes/projects");
const activityLog = require("./routes/activityLog"); // Import activity log routes
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config(); // Load environment variables
const app = express();
app.use(express.json()); // Middleware to parse JSON requests
const PORT = process.env.PORT || 5000;



// ✅ Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Storage configuration for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Upload middleware
const upload = multer({ storage, fileFilter });

// ✅ Serve uploaded images
app.use("/uploads", express.static(uploadDir));

// CORS Configuration (Allow frontend to access the backend)
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust based on frontend deployment
    credentials: true,
  })
);

// Session Configuration (Replaces JWT)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Use a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production (requires HTTPS)
      maxAge: 24 * 60 * 60 * 1000, // Session lasts 24 hours
    },
  })
);

//  Ensure associations are set up before syncing database
require("./models/associations");

// Health Check Route
app.get("/", (req, res) => {
  res.send("Project Management Tool API is running...");
});

// Import Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/activity-log", activityLog); // Activity log routes
// Handle Unknown Routes (404)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handling
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Database Connection & Sync
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
    return sequelize.sync();
  })
  .then(() => {
    console.log("✅ Database synchronized successfully");
  })
  .catch((err) => {
    console.error("❌ Error synchronizing database:", err);
    process.exit(1);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful Shutdown Handling
process.on("SIGINT", async () => {
  console.log("⚠️ Shutting down the server...");
  await sequelize.close();
  process.exit(0);
});


// ✅ Export upload middleware for routes
module.exports = { upload };