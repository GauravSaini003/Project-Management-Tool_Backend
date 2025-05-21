const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Board = require("./Board"); // Board is your projects table
const Task = require("./Task");

const ActivityLog = sequelize.define("activity_logs", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    board_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Board, // Linking to projects
        key: "id",
      },
      onDelete: "SET NULL",
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Task,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    action_type: {
      type: DataTypes.ENUM("create", "update", "delete", "assign", "restore", "login"),
      allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    }, { 
      timestamps: false // ❌ Disable `updatedAt`
    });
    
    module.exports = ActivityLog;