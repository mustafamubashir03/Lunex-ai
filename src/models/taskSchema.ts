import mongoose from "mongoose";
import { z } from "zod";

export const TaskStatusEnum = z.enum([
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "skipped",
  "failed",
  "retrying"
]);

export const InputTaskSchema = z.object({
  task: z.string().describe("The actual task instruction"),
  assigned_to: z.string().describe("Agent responsible for execution"),
  status: TaskStatusEnum.optional(),
  parent_id: z.string().optional().describe("Optional parent task ID for hierarchical workflows"),
  dependencies: z.array(z.string()).optional().describe("Task IDs that must complete before this task can begin"),
});

export const WriteTasksSchema = z.object({
  workflow_name: z.string().describe("Name or identifier of the workflow"),
  tasks: z.array(InputTaskSchema)
});

export const ReadTasksSchema = z.object({
  workflow_name: z.string().describe("Unique workflow identifier used to retrieve all related tasks")
});

export const UpdateTasksSchema = z.object({
  workflow_name: z.string().describe("Workflow identifier containing the tasks"),
  updates: z.array(
    z.object({
      id: z.string().describe("Unique task ID"),
      task: z.string().optional(),
      assigned_to: z.string().optional(),
      status: TaskStatusEnum.optional()
    })
  )
});

export const GetNextRunnableTasksSchema = z.object({
  workflow_name: z.string().describe(
    "Workflow identifier used to compute the next runnable tasks"
  )
});

const taskMongooseSchema = new mongoose.Schema({
    workflow_name: { type: String, required: true, index: true },
    task: { type: String, required: true },
    assigned_to: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: ["pending", "in_progress", "completed", "blocked", "skipped", "failed", "retrying"],
        default: "pending"
    },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    idempotency_key: { type: String },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    strict: true
});

// Ensure uniqueness for workflow_name + idempotency_key to prevent duplicate tasks on retries
taskMongooseSchema.index({ workflow_name: 1, idempotency_key: 1 }, { unique: true, sparse: true });

export const TaskModel = mongoose.models.Task || mongoose.model("Task", taskMongooseSchema);
