
const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

// ✅ User Registration
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            status: "Active",
            profile_picture: "default-profile.png" // Assign default profile picture
        });

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🔍 Checking user in database...");

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log("❌ User not found in database!");

            try {
                await ActivityLog.create({
                    user_id: null,  // Log as a guest/system login attempt
                    action_type: "login",
                    description: `Failed login attempt for email: ${email} (User not found)`,
                });
            } catch (logError) {
                console.error("❌ Error logging activity:", logError.message);
            }

            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("✅ User found:", user.name);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Password does not match!");

            try {
                await ActivityLog.create({
                    user_id: user.id,
                    action_type: "login",
                    description: `Failed login attempt for ${user.name} (Wrong password)`,
                });
            } catch (logError) {
                console.error("❌ Error logging activity:", logError.message);
            }

            return res.status(401).json({ message: "Invalid email or password" });

        }




        // Store user session (excluding sensitive info like password)
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            profile_picture: user.profile_picture, // ✅ Include profile picture

        };

        console.log("✅ Storing session:", req.session.user);

        try {
            await ActivityLog.create({
                user_id: user.id,
                action_type: "login",
                description: `User ${user.name} logged in successfully`,
            });
        } catch (logError) {
            console.error("❌ Error logging activity:", logError.message);
        }

        return res.json({ message: "Login successful", user: req.session.user });

    } catch (error) {
        console.error("❌ Unexpected error in login route:", error.message);

        if (!res.headersSent) {
            return res.status(500).json({ message: "Error logging in", error: error.message });
        }
    }
});

module.exports = router;
