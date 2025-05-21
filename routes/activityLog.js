// const express = require("express");
// const ActivityLog = require("../models/ActivityLog"); // Import model
// const router = express.Router();
// const { Op } = require("sequelize");

// const validActions = ["login", "delete", "create", "update"]; // Define valid actions

// // Get all activity logs (with optional filters)
// router.get("/", async (req, res) => {
//     try {
//         const { user_id, action, startDate, endDate, page = 1, pageSize = 10 } = req.query;

//         let filters = {};
//         let pagination = {
//             limit: parseInt(pageSize, 10),
//             offset: (parseInt(page, 10) - 1) * pageSize,
//         };

//         // ✅ Validate and parse user_id
//         if (user_id) {
//             const parsedUserId = parseInt(user_id, 10);
//             if (isNaN(parsedUserId)) {
//                 return res.status(400).json({ message: "Invalid user_id format" });
//             }
//             filters.user_id = parsedUserId;
//         }

//         // ✅ Ensure the correct field name for action type and validate
//         if (action) {
//             if (!validActions.includes(action)) {
//                 return res.status(400).json({ message: "Invalid action type" });
//             }
//             filters.action = action; // Use correct field name
//         }

//         // ✅ Validate and format date range
//         if (startDate && endDate) {
//             const start = new Date(startDate);
//             const end = new Date(endDate);

//             if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//                 return res.status(400).json({ message: "Invalid date format" });
//             }

//             filters.createdAt = { [Op.between]: [start, end] };
//         }

//         // ✅ Fetch logs from database
//         const logs = await ActivityLog.findAll({
//             where: filters,
//             order: [["createdAt", "DESC"]],
//             ...pagination,
//         });

//         // ✅ Return meaningful response if no logs found
//         if (logs.length === 0) {
//             return res.status(404).json({ message: "No activity logs found for the given filters." });
//         }

//         res.json(logs);
//     } catch (error) {
//         console.error("❌ Error fetching activity logs:", error.message);
//         res.status(500).json({ message: "Error fetching activity logs", error: error.message });
//     }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const Board = require("../models/Board");
const Task = require("../models/Task");

const validActions = ["login", "delete", "create", "update", "assign", "restore"];

// ✅ Get Activity Logs (with Role-Based Access)
router.get("/", async (req, res) => {
    try {
      const {
        user_id,
        role,
        action_type,
        startDate,
        endDate,
        page = 1,
        pageSize = 10,
        search = ""
      } = req.query;
  
      const parsedUserId = parseInt(user_id, 10);
      const parsedPage = parseInt(page, 10);
      const parsedPageSize = parseInt(pageSize, 10);
  
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid user_id format" });
      }
  
      let filters = {};
      let includeConditions = [
        {
          model: User,
          attributes: ["id", "name", "role"],
          where: {},
        },
        { model: Board, attributes: ["id", "project_name"] },
        { model: Task, attributes: ["id", "title"] },
      ];
  
      // Apply role-based access
      if (role === "admin") {
        // Admin gets everything
      } else if (role === "manager") {
        const managerBoards = await Board.findAll({
          where: { created_by: parsedUserId },
          attributes: ["id"],
        });
  
        const boardIds = managerBoards.map((b) => b.id);
        if (boardIds.length === 0) {
          return res.json({
            logs: [],
            totalPages: 0,
            currentPage: parsedPage,
            totalLogs: 0,
          });
        }
  
        filters.board_id = { [Op.in]: boardIds };
      } else if (role === "member") {
        filters.user_id = parsedUserId;
      } else {
        return res.status(400).json({ message: "Invalid role" });
      }
  
      // Action type filter
      if (action_type) {
        filters.action_type = action_type;
      }
  
      // Date range filter
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filters.createdAt = { [Op.between]: [start, end] };
      }
  
      // Search filter (searching in user name, project name, task title, and description)
      if (search) {
        includeConditions[0].where.name = { [Op.like]: `%${search}%` }; // User name
        filters.description = { [Op.like]: `%${search}%` };
      }
  
      // Count all matching logs first
      const totalLogs = await ActivityLog.count({
        where: filters,
        include: includeConditions,
      });
  
      const logs = await ActivityLog.findAll({
        where: filters,
        include: includeConditions,
        order: [["createdAt", "DESC"]],
        limit: parsedPageSize,
        offset: (parsedPage - 1) * parsedPageSize,
      });
  
      return res.status(200).json({
        logs,
        totalPages: Math.ceil(totalLogs / parsedPageSize),
        currentPage: parsedPage,
        totalLogs,
      });
    } catch (error) {
      console.error("❌ Error fetching activity logs:", error.message);
      return res.status(500).json({ message: "Error fetching activity logs", error: error.message });
    }
  });
  

// ✅ Insert a New Activity Log
router.post("/", async (req, res) => {
    try {
        const { user_id, board_id, task_id, action_type, description } = req.body;

        if (!user_id || !action_type || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!validActions.includes(action_type)) {
            return res.status(400).json({ message: "Invalid action type" });
        }

        const newLog = await ActivityLog.create({
            user_id,
            board_id,
            task_id,
            action_type,
            description,
            createdAt: new Date(),
        });

        res.status(201).json(newLog);
    } catch (error) {
        console.error("❌ Error creating activity log:", error.message);
        res.status(500).json({ message: "Error creating activity log", error: error.message });
    }
});

module.exports = router;
