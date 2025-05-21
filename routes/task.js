// const express = require("express");
// const router = express.Router();
// const Task = require("../models/Task");
// const Board = require("../models/Board");
// const User = require("../models/User");
// const TaskAssignedUsers = require("../models/taskAssignedUsers"); // Many-to-Many Table
// const authMiddleware = require("../middleware/auth");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ Get All Tasks of a Specific Project
// router.get("/project/:boardId", authMiddleware, async (req, res) => {
//     try {
//         const { boardId } = req.params;
//         const tasks = await Task.findAll({
//             where: { boardId },
//             include: [
//                 {
//                     model: User,
//                     through: { attributes: [] }, // ✅ Get assigned users without extra fields
//                     attributes: ["id", "name", "role"],
//                 },
//                 { model: User, as: "creator", attributes: ["id", "name", "role"] },
//             ],
//         });

//         res.json(tasks);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching tasks", error: error.message });
//     }
// });

// // ✅ Get Tasks Assigned to a Specific User
// // router.get("/assigned", authMiddleware, async (req, res) => {
// //     try {
// //         const tasks = await Task.findAll({
// //             include: [
// //                 {
// //                     model: TaskAssignedUsers,
// //                     where: { user_id: req.user.id },
// //                     attributes: [],
// //                 },
// //                 { model: Board, attributes: ["id", "project_name"] },
// //             ],
// //         });

// //         res.json(tasks);
// //     } catch (error) {
// //         res.status(500).json({ message: "Error fetching assigned tasks", error: error.message });
// //     }
// // });
// router.get("/assigned", authMiddleware, async (req, res) => {
//     try {
//         const tasks = await Task.findAll({
//             include: [
//                 {
//                     model: User,
//                     as: "assignedUsers", // ✅ Use the alias from associations
//                     where: { id: req.user.id }, // ✅ Find tasks where the logged-in user is assigned
//                     attributes: ["id", "name", "email"], // ✅ Get user details
//                 },
//                 {
//                     model: Board,
//                     attributes: ["id", "project_name"], // ✅ Get related board/project info
//                 },
//             ],
//         });

//         res.json(tasks);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching assigned tasks", error: error.message });
//     }
// });


// // ✅ Create a Task (Only MANAGER)
// router.post("/:boardId", authMiddleware, roleMiddleware(["MANAGER"]), async (req, res) => {
//     try {
//         const { title, description, assignedTo, deadline, status, priority } = req.body;
//         const boardId = req.params.boardId;
//         const created_by = req.user.id;

//         const board = await Board.findByPk(boardId);
//         if (!board) return res.status(404).json({ message: "Project not found" });

//         const allowedStatuses = ["todo", "in-progress", "done"];
//         const taskStatus = allowedStatuses.includes(status) ? status : "todo";

//          // ✅ Check if all assigned users exist in the database
//          if (assignedTo && assignedTo.length > 0) {
//             const usersExist = await User.findAll({
//                 where: { id: assignedTo },
//                 attributes: ["id"],
//             });

//             const existingUserIds = usersExist.map(user => user.id);
//             const invalidUserIds = assignedTo.filter(id => !existingUserIds.includes(id));

//             if (invalidUserIds.length > 0) {
//                 return res.status(400).json({
//                     message: "Invalid user IDs provided",
//                     invalidUserIds,
//                 });
//             }
//         }

//         const newTask = await Task.create({
//             title,
//             description,
//             boardId,
//             created_by,
//             status: taskStatus,
//             priority,
//             deadline,
//         });

//         // ✅ Assign users if provided (Using TaskAssignedUsers directly)
//         if (assignedTo && assignedTo.length > 0) {
//             const assignments = assignedTo.map(userId => ({
//                 task_id: newTask.id,
//                 user_id: userId,
//             }));
//             await TaskAssignedUsers.bulkCreate(assignments);
//         }

//         res.status(201).json(newTask);
//     } catch (error) {
//         res.status(500).json({ message: "Error creating task", error: error.message });
//     }
// });

// // ✅ Update Task (Manager & Assigned Member)
// router.put("/:id", authMiddleware, roleMiddleware(["MANAGER", "MEMBER"]), async (req, res) => {
//     try {
//         const taskId = req.params.id;
//         const { status,priority, progress } = req.body;
        

//         const task = await Task.findByPk(taskId);
//         if (!task) return res.status(404).json({ message: "Task not found" });

//         const user = req.user;

//         const isAssigned = await TaskAssignedUsers.findOne({
//             where: { task_id: taskId, user_id: user.id },
//         });

//         // ✅ Ensure only assigned users or task creator (Manager) can update
//         if (user.role !== "MANAGER" && !isAssigned && task.created_by !== user.id) {
//             return res.status(403).json({ message: "You do not have permission to update this task" });
//         }

//     //     task.status = status || task.status;
//     //     await task.save();

//     //     res.status(200).json(task);
//     // } catch (error) {
//     //     res.status(500).json({ message: "Error updating task", error: error.message });
//     // }
//          // ✅ Update only allowed fields
//          if (user.role === "MEMBER") {
//             task.status = status || task.status;
//             task.progress = progress || task.progress;
//         } else {
//             task.status = status || task.status;
//             task.priority = priority || task.priority;
//             task.progress = progress || task.progress;
//         }

//         await task.save();
//         res.status(200).json(task);
//     } catch (error) {
//         res.status(500).json({ message: "Error updating task", error: error.message });
//     }
// });

// // ✅ Delete Task (Only Managers)
// router.delete("/:id", authMiddleware, roleMiddleware(["MANAGER"]), async (req, res) => {
//     try {
//         const taskId = req.params.id;
//         const task = await Task.findByPk(taskId);
//         if (!task) return res.status(404).json({ message: "Task not found" });

//         await task.destroy();
//         res.json({ message: "Task deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error deleting task", error: error.message });
//     }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Board = require("../models/Board");
const User = require("../models/User");
const TaskAssignedUsers = require("../models/taskAssignedUsers");
const ProjectAssignedUser = require("../models/ProjectAssignedUser");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");
const sendTaskNotification = require("../emailService");
// This is for the log activity function

const ActivityLog = require("../models/ActivityLog");

// ✅ Get All Tasks of a Specific Project
router.get("/project/:boardId", authMiddleware, async (req, res) => {
    try {
        const { boardId } = req.params;
        const tasks = await Task.findAll({
            where: { boardId: boardId },  // Ensure column name is correct
            include: [
                { model: User, as: "assignedUsers", attributes: ["id", "name", "email"] },
                { model: User, as: "creator", attributes: ["id", "name", "role"] }
            ]
        });

        if (!tasks.length) return res.status(404).json({ message: "No tasks found for this project." });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
});

// ✅ Create a Task (Only ADMIN & MANAGER)
router.post("/:boardId", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), async (req, res) => {
    try {
        const { title, description, assignedTo = [], deadline, status, priority } = req.body;
        const boardId = req.params.boardId;
        const created_by = req.user.id;

        const board = await Board.findByPk(boardId);
        if (!board) return res.status(404).json({ message: "Project not found" });

        // ✅ Validate priority value
        const validPriorities = ["low", "medium", "high"];
        if (priority && !validPriorities.includes(priority.toLowerCase())) {
            return res.status(400).json({ message: "Invalid priority value. Use low, medium, high, urgent." });
        }

        // ✅ Validate assigned users exist & belong to the project
        if (assignedTo.length > 0) {
            const usersExist = await User.findAll({ where: { id: assignedTo } });
            if (usersExist.length !== assignedTo.length) {
                return res.status(400).json({ message: "One or more assigned users do not exist." });
            }

            const projectMembers = await ProjectAssignedUser.findAll({
                where: { project_id: boardId },
                attributes: ["user_id"],
            });

            const allowedUserIds = projectMembers.map(member => member.user_id);
            const invalidUserIds = assignedTo.filter(id => !allowedUserIds.includes(id));

            if (invalidUserIds.length > 0) {
                return res.status(400).json({
                    message: "Users must be assigned to the project first.",
                    invalidUserIds,
                });
            }
        }

        const newTask = await Task.create({
            title,
            description,
            board_id: boardId, // Ensure column name is correct
            created_by,
            status: status || "todo",
            priority: priority || "medium",
            boardId,
            deadline,
        });

  // ✅ Log activity for task creation
  await ActivityLog.create({
    user_id: req.user.id,
    board_id: boardId,
    task_id: newTask.id,
    action_type: "create",
    description: `Created a new task: "${title}" in project ID ${boardId}`,
});





        // ✅ Assign users if provided
        if (assignedTo.length > 0) {
            const assignments = assignedTo.map(userId => ({
                task_id: newTask.id,
                user_id: userId,
            }));
            await TaskAssignedUsers.bulkCreate(assignments);



         // Assign users to the task if any
   // ✅ Log activity for task assignments
   for (const userId of assignedTo) {
    await ActivityLog.create({
        user_id: req.user.id,
        board_id: boardId,
        task_id: newTask.id,
        action_type: "assign",
        description: `Assigned user ID ${userId} to task "${title}" (Task ID: ${newTask.id})`,
    });
}


            // ✅ Fetch assigned users' emails
            const assignedUsers = await User.findAll({
                where: { id: assignedTo },
                attributes: ["name", "email"],
            });

            // ✅ Send email notification to each assigned user
            for (const user of assignedUsers) {
                await sendTaskNotification(user.email, user.name, title, deadline, description);
            }
        }

        res.status(201).json(newTask);
    } catch (error) {
        console.error("❌ Error creating task:", error);
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
});





// ✅ Update Task (ADMIN,Managers & Assigned Members)
router.put("/:id", authMiddleware, roleMiddleware(["MANAGER", "MEMBER", "ADMIN"]), async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status, priority, progress } = req.body;
        const task = await Task.findByPk(taskId);

        if (!task) return res.status(404).json({ message: "Task not found" });

        const user = req.user;

        // ✅ Admin can update any task
        if (user.role === "ADMIN") {
            task.status = status || task.status;
            task.priority = priority || task.priority;
            task.progress = progress !== undefined ? progress : task.progress;
            await task.save();
            // ✅ Log activity for task updates (Admin can update anything)
            await ActivityLog.create({
                user_id: req.user.id,
                board_id: task.boardId,
                task_id: task.id,
                action_type: "update",
                description: `Admin updated task "${task.title}" (ID: ${task.id}): Status: ${status || task.status}, Priority: ${priority || task.priority}, Progress: ${progress !== undefined ? progress : task.progress}`,
            });
            return res.status(200).json(task);
            
        }

        // ✅ Check if Member is assigned
        const isAssigned = await TaskAssignedUsers.findOne({ where: { task_id: taskId, user_id: user.id } });

        if (user.role === "MEMBER" && !isAssigned) {
            return res.status(403).json({ message: "You do not have permission to update this task" });
        }

        // ✅ Validate progress (0-100)
        if (progress !== undefined && (progress < 0 || progress > 100)) {
            return res.status(400).json({ message: "Progress must be between 0 and 100." });
        }

        if (user.role === "MEMBER") {
            // ✅ Members can only update status & progress
            task.status = status || task.status;
            task.progress = progress !== undefined ? progress : task.progress;
        } else {
            // ✅ Managers/Admins can update everything
            task.status = status || task.status;
            task.priority = priority || task.priority;
            task.progress = progress !== undefined ? progress : task.progress;
        }

        await task.save();

   // ✅ Log activity for task updates (Managers can update specific task attributes)
   await ActivityLog.create({
    user_id: req.user.id,
    board_id: task.boardId,
    task_id: task.id,
    action_type: "update",
    description: `Updated task "${task.title}" (ID: ${task.id}): Status: ${status || task.status}, Priority: ${priority || task.priority}, Progress: ${progress !== undefined ? progress : task.progress}`,
});


        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task", error: error.message });
    }
});


// ✅ Delete Task (Only Admin & Manager who created the task)
// router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), async (req, res) => {
//     try {
//         const taskId = req.params.id;
//         const task = await Task.findByPk(taskId);
//         if (!task) return res.status(404).json({ message: "Task not found" });

//         if (req.user.role === "MANAGER" && task.created_by !== req.user.id) {
//             return res.status(403).json({ message: "You do not have permission to delete this task" });
//         }

//         // ✅ Check for dependent records
//         const taskAssignments = await TaskAssignedUsers.findAll({ where: { task_id: taskId } });
//         if (taskAssignments.length > 0) {
//             await TaskAssignedUsers.destroy({ where: { task_id: taskId } });
//         }

//         await task.destroy();

//  // ✅ Log activity for task deletion
//  await ActivityLog.create({
//     user_id: req.user.id,
//     board_id: task.boardId,
//     task_id: task.id,
//     action_type: "delete",
//     description: `Deleted task "${task.title}" (ID: ${task.id}) from project ID ${task.boardId}`,
// });


//         res.json({ message: "Task deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error deleting task", error: error.message });
//     }
// });


// ✅ Delete Task (Only Admin & Manager who created the task)
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "MANAGER"]), async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findByPk(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Ensure only the creator or an admin can delete the task
        if (req.user.role === "MANAGER" && task.created_by !== req.user.id) {
            return res.status(403).json({ message: "You do not have permission to delete this task" });
        }

        // ✅ Log activity before deleting task
        await ActivityLog.create({
            user_id: req.user.id,
            board_id: task.boardId, // Ensure correct board ID is passed
            task_id: task.id, // Task ID for the log
            action_type: "delete",
            description: `Deleted task "${task.title}" (ID: ${task.id}) from project ID ${task.boardId}`,
        });

        // ✅ Check for dependent records before deleting
        const taskAssignments = await TaskAssignedUsers.findAll({ where: { task_id: taskId } });
        if (taskAssignments.length > 0) {
            await TaskAssignedUsers.destroy({ where: { task_id: taskId } });
        }

        // ✅ Deleting the task
        await task.destroy();

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting task:", error);
        res.status(500).json({ message: "Error deleting task", error: error.message });
    }
});





// ✅ Project Report API - Get a detailed report of a project

router.get("/:projectId/report", authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;

        // ✅ Fetch project details, including missing fields
        const project = await Board.findByPk(projectId, {
            include: [
                { model: User, as: "manager", attributes: ["id", "name", "role", "profile_picture"] },
                { model: User, as: "assignedUsers", attributes: ["id", "name", "role", "profile_picture"] }
            ]
        });

        if (!project) return res.status(404).json({ message: "Project not found" });

        // ✅ Fetch all tasks of the project
        const tasks = await Task.findAll({
            where: { boardId: projectId },
            include: [
                { model: User, as: "assignedUsers", attributes: ["id", "name", "email"] },
                { model: User, as: "creator", attributes: ["id", "name", "role"] }
            ]
        });

        // ✅ Calculate task completion percentage
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === "done").length;
        const completionRate = totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2)) : 0;

        // ✅ Return complete response with missing fields
        res.status(200).json({
            project: {
                id: project.id,
                project_name: project.project_name, // ✅ Fixed field
                company_name: project.company_name, // ✅ Fixed field
                created_by: project.created_by,
                created_by_name: project.created_by_name, // ✅ Added field
                deadline: project.deadline,
                status: project.status,
                createdAt: project.createdAt,
                manager: project.manager,
                assignedUsers: project.assignedUsers
            },
            tasks,
            completionRate
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching project report", error: error.message });
    }
});


// ✅ Get All Tasks in the Database (For Pie Chart & Reporting)

router.get("/tasks/all", authMiddleware, roleMiddleware(["ADMIN", "MANAGER","MEMBER"]), async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [
                { model: User, as: "assignedUsers", attributes: ["id", "name", "email"] },
                { model: User, as: "creator", attributes: ["id", "name", "role"] }
            ],
            attributes: ["id", "title", "status", "priority", "createdAt"]
        });

        if (!tasks.length) return res.status(404).json({ message: "No tasks found in the database." });

        res.status(200).json(tasks);

        //  // ✅ Log activity for task retrieval
        //  await ActivityLog.create({
        //     user_id: req.user.id,
        //     action_type: "retrieve",
        //     description: "Retrieved all tasks",
        // });


    } catch (error) {
        console.error("❌ Error fetching all tasks:", error);
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
});


// ✅ Get Task Stats for Pie Chart (Role-Based)
// router.get("/tasks/stats", authMiddleware, async (req, res) => {
//     try {
//         const user = req.user; // Get the logged-in user
//         let tasks;

//         if (user.role === "ADMIN") {
//             // ✅ Admin: Get all tasks
//             tasks = await Task.findAll({ attributes: ["status"] });
//         } else if (user.role === "MANAGER") {
//             // ✅ Manager: Get tasks where they are the creator
//             tasks = await Task.findAll({
//                 where: { created_by: user.id },
//                 attributes: ["status"]
//             });
//         } else {
//             // ✅ Member: Get tasks where they are assigned
//             tasks = await Task.findAll({
//                 include: {
//                     model: TaskAssignedUsers,
//                     where: { user_id: user.id },
//                     attributes: [] // No need to fetch extra columns
//                 },
//                 attributes: ["status"]
//             });
//         }

//         // ✅ Count tasks based on their status
//         const taskStats = {
//             todo: 0,
//             in_progress: 0,
//             done: 0
//         };

//         tasks.forEach(task => {
//             if (task.status === "todo") taskStats.todo++;
//             else if (task.status === "in_progress") taskStats.in_progress++;
//             else if (task.status === "done") taskStats.done++;
//         });

//         res.status(200).json(taskStats);
//     } catch (error) {
//         console.error("❌ Error fetching task stats:", error);
//         res.status(500).json({ message: "Error fetching task statistics", error: error.message });
//     }
// });


// router.get("/tasks/all", authMiddleware, roleMiddleware(["ADMIN", "MANAGER", "MEMBER"]), async (req, res) => {
//     try {
//         const user = req.user;
//         let whereCondition = {}; // Default: Admin sees all

//         if (user.role === "MANAGER") {
//             // ✅ Managers see tasks in projects they are assigned to or created
//             const projectIds = await ProjectAssignedUser.findAll({
//                 where: { user_id: user.id },
//                 attributes: ["project_id"]
//             });
//             const projectIdList = projectIds.map(p => p.project_id);
//             whereCondition = { boardId: projectIdList };
//         }

//         if (user.role === "MEMBER") {
//             // ✅ Members see only tasks assigned to them
//             const assignedTaskIds = await TaskAssignedUsers.findAll({
//                 where: { user_id: user.id },
//                 attributes: ["task_id"]
//             });
//             const taskIdList = assignedTaskIds.map(t => t.task_id);
//             whereCondition = { id: taskIdList };
//         }

//         const tasks = await Task.findAll({
//             where: whereCondition,
//             include: [
//                 {
//                     model: User,
//                     as: "assignedUsers",
//                     attributes: ["id", "name", "email"],
//                     through: { attributes: [] } // Hide TaskAssignedUsers details
//                 },
//                 { model: User, as: "creator", attributes: ["id", "name", "role"] }
//             ],
//             attributes: ["id", "title", "status", "priority", "createdAt"]
//         });

//         return res.status(200).json(tasks);
//     } catch (error) {
//         console.error("❌ Error fetching tasks:", error);
//         res.status(500).json({ message: "Error fetching tasks", error: error.message });
//     }
// });








module.exports = router;
