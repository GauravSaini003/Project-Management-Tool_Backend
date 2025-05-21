// const express = require("express");
// const router = express.Router();
// const User  = require("../models/User");
// const authMiddleware = require("../middleware/auth");
// const roleMiddleware = require("../middleware/roleMiddleware");
// const multer = require("multer");
// const path = require("path");


// // ✅ Storage configuration for profile pictures
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/"); // Save images in the 'uploads' folder
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
//     },
// });

// // ✅ File filter to allow only images
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only image files are allowed!"), false);
//     }
// };

// // ✅ Upload middleware
// const upload = multer({ storage, fileFilter });





// // ✅ Get all users - Only Admin and manager can access
// router.get("/", authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
//     try {
//         const users = await User.findAll({
//             attributes: ["id", "name", "email", "role", "status", "createdAt"],
//         });

//         res.status(200).json(users);
//     } catch (error) {
//         console.error("❌ Error fetching users:", error.message);
//         res.status(500).json({ message: "Error fetching users", error: error.message });
//     }
// });


// // ✅ Delete a user - Only Admin can delete users
// router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
//     try {
//         const userId = req.params.id;

//         // Prevent admin from deleting themselves
//         if (req.user.id.toString() === userId) {
//             return res.status(403).json({ message: "Admins cannot delete their own account" });
//         }

//         // Check if user exists before deleting
//         const user = await User.findOne({ where: { id: userId } });
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Remove user from all projects before deleting
//         await user.setAssignedProjects([]); // This will remove all project associations

//         // Delete profile picture if not default
//         const fs = require("fs");
//         if (user.profile_picture && user.profile_picture !== "default-profile.png") {
//             fs.unlinkSync(`uploads/${user.profile_picture}`);
//         }

//         // Delete user
//         await user.destroy();

//         res.status(200).json({ message: "User deleted successfully" });
//     } catch (error) {
//         console.error("❌ Error deleting user:", error.message);
//         res.status(500).json({ message: "Error deleting user", error: error.message });
//     }
// });



// // ✅ Update user details - Only Admin can edit users
// router.put("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
//     try {
//         const { name, email, role } = req.body;
//         const userId = req.params.id;

//         // Find the user by ID
//         const user = await User.findByPk(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Update user fields if provided
//         user.name = name || user.name;
//         user.email = email || user.email;
//         user.role = role || user.role;

//         // Save updated user details
//         await user.save();

//         res.status(200).json({ message: "User updated successfully", user });
//     } catch (error) {
//         console.error(" Error updating user:", error.message);
//         res.status(500).json({ message: "Error updating user", error: error.message });
//     }
// });




// // ✅ Upload Profile Picture Route
// router.post("/upload-profile", authMiddleware, upload.single("profile_picture"), async (req, res) => {
//     try {
//         const userId = req.user.id; // Get user ID from the logged-in user

//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         const user = await User.findByPk(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // ✅ Save the new profile picture path in the database
//         user.profile_picture = req.file.filename; // Save only filename
//         await user.save();

//         res.status(200).json({
//             message: "Profile picture uploaded successfully",
//             profile_picture: `/uploads/${req.file.filename}`,
//         });

//     } catch (error) {
//         console.error("❌ Error uploading profile picture:", error.message);
//         res.status(500).json({ message: "Error uploading profile picture", error: error.message });
//     }
// });

// module.exports = router;







const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const ActivityLog = require("../models/ActivityLog");

// We are adding the  log activity function to log the activity of the user
// const logActivity = require("../utils/logActivity");

// ✅ Storage configuration for profile pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save images in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

// ✅ File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// ✅ Upload middleware
const upload = multer({ storage, fileFilter });


// ✅ Get all users - Only Admin and Manager can access
router.get("/", authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role", "status", "profile_picture", "createdAt"],
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error.message);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});


// ✅ Delete a user - Only Admin can delete users
// router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
//     try {
//         const userId = req.params.id;

//         // Prevent admin from deleting themselves
//         if (req.user.id.toString() === userId) {
//             return res.status(403).json({ message: "Admins cannot delete their own account" });
//         }

//         // Check if user exists before deleting
//         const user = await User.findOne({ where: { id: userId } });
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }


//          // ❌ Prevent an admin from deleting another admin
//          if (user.role === "admin") {
//             return res.status(403).json({ message: "Admins cannot delete other admins" });
//         }

//         // ✅ Remove user from all projects before deleting
//         await user.setAssignedProjects([]); // This will remove all project associations

//         // ✅ Delete profile picture if not default
//         if (user.profile_picture && user.profile_picture !== "default-profile.png") {
//             const filePath = path.join(__dirname, "../uploads", user.profile_picture);
//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }
//         }

//         // ✅ Delete user
//         await user.destroy();

//         res.status(200).json({ message: "User deleted successfully" });
//     } catch (error) {
//         console.error("❌ Error deleting user:", error.message);
//         res.status(500).json({ message: "Error deleting user", error: error.message });
//     }
// });

// ✅ Soft delete a user - Only Admin can delete users
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const userId = req.params.id;

        // ❌ Prevent an admin from deleting themselves
        if (req.user.id.toString() === userId) {
            return res.status(403).json({ message: "Admins cannot delete their own account" });
        }

        // ✅ Check if user exists
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ❌ Prevent an admin from deleting another admin
        if (user.role === "admin") {
            return res.status(403).json({ message: "Admins cannot delete other admins" });
        }

        // ✅ Remove user from all projects before deleting
        await user.setAssignedProjects([]); // Removes project associations

        // ✅ Delete profile picture if not default
        if (user.profile_picture && user.profile_picture !== "default-profile.png") {
            const filePath = path.join(__dirname, "../uploads", user.profile_picture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // ✅ Soft delete the user instead of permanent delete
        await user.destroy();


         // ✅ Log the activity AFTER successful deletion
         await ActivityLog.create({
            user_id: req.user.id, // Ensure user_id is provided
            board_id: null, // Since it's a user action, board_id is null
            task_id: null, // Since it's a user action, task_id is null
            action_type: "delete", // Fix: Provide valid action_type
            description: `User ${user.name} (ID: ${user.id}) was deleted by ${req.user.name} (ID: ${req.user.id})`
        });


        res.status(200).json({ message: "User moved to trash successfully" });
    } catch (error) {
        console.error("❌ Error deleting user:", error.message);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

// ✅ Restore Deleted User (Only Admin)
router.put("/restore/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const userId = req.params.id;

        // ✅ Find soft-deleted user
        const user = await User.findOne({ where: { id: userId }, paranoid: false });
        if (!user || user.deleted_at === null) {
            return res.status(404).json({ message: "User not found or not deleted" });
        }

        // ✅ Restore user by setting deleted_at = NULL
        await user.restore();

         // Log the activity of user restoration
         await ActivityLog.create({
            user_id: req.user.id, // Corrected to match your model
            board_id: null, // No board for this action
            task_id: null, // No task for this action
            action_type: "restore", // Correct action_type field
            description: `User ${user.name} (ID: ${user.id}) was restored by ${req.user.name} (ID: ${req.user.id})`,
        });
        

        res.status(200).json({ message: "User restored successfully" });
    } catch (error) {
        console.error("❌ Error restoring user:", error.message);
        res.status(500).json({ message: "Error restoring user", error: error.message });
    }
});

//Op is used to create advanced queries like Op.ne (not equal), Op.like, etc.
// It is part of Sequelize and allows you to build complex queries using operators.
// ✅ Get all deleted users (trash) - Only Admin can access
//If Op is not imported, Sequelize doesn’t recognize it, causing the error.
// const { Op } = require("sequelize");
router.get("/trash", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const deletedUsers = await User.findAll({ 
            where: { deleted_at: { [Op.ne]: null } }, 
            paranoid: false 
        });

        res.status(200).json({ deletedUsers });
    } catch (error) {
        console.error("❌ Error fetching deleted users:", error.message);
        res.status(500).json({ message: "Error fetching deleted users" });
    }
});
 
router.delete("/trash/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user
        const user = await User.findOne({ where: { id: userId }, paranoid: false });
        if (!user) {
            return res.status(404).json({ message: "User not found in trash" });
        }

        // Delete profile picture if not default
        if (user.profile_picture && user.profile_picture !== "default-profile.png") {
            const filePath = path.join(__dirname, "../uploads", user.profile_picture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Permanently delete the user
        await user.destroy({ force: true });
        

       // Log the activity of permanent deletion
       await ActivityLog.create({
        user_id: req.user.id, // Corrected to match your model
        board_id: null, // No board for this action
        task_id: null, // No task for this action
        action_type: "delete", // Correct action_type field
        description: `User ${user.name} (ID: ${user.id}) was permanently deleted by ${req.user.name} (ID: ${req.user.id})`,
    });
    res.status(200).json({ message: "User permanently deleted" }); 

      
    } catch (error) {
        console.error("❌ Error permanently deleting user:", error.message);
        res.status(500).json({ message: "Error permanently deleting user" });
    }
});










// ✅ Update user details - Only Admin can edit users
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const userId = req.params.id;

        // Find the user by ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user fields if provided
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        // Save updated user details
        await user.save();

          // Log the activity of user update
          await ActivityLog.create({
            user_id: req.user.id, // Corrected to match your model
            board_id: null, // No board for this action
            task_id: null, // No task for this action
            action_type: "update", // Correct action_type field
            description: `User ${user.name} (ID: ${user.id}) was updated by ${req.user.name} (ID: ${req.user.id})`,
        });
        

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("❌ Error updating user:", error.message);
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
});

// ✅ Upload Profile Picture Route
router.post("/upload-profile", authMiddleware, upload.single("profile_picture"), async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the logged-in user

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Remove old profile picture (if exists and not default)
        if (user.profile_picture && user.profile_picture !== "default-profile.png") {
            const filePath = path.join(__dirname, "../uploads", user.profile_picture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // ✅ Save the new profile picture path in the database
        user.profile_picture = req.file.filename; // Save only filename
        await user.save();

        res.status(200).json({
            message: "Profile picture uploaded successfully",
            profile_picture: `/uploads/${req.file.filename}`,
        });

    } catch (error) {
        console.error("❌ Error uploading profile picture:", error.message);
        res.status(500).json({ message: "Error uploading profile picture", error: error.message });
    }
});

module.exports = router;
