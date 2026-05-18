import { tool } from "@langchain/core/tools";
import { connectDB } from "@/lib/mongodb/mongodb";
import { TaskModel, WriteTasksSchema, ReadTasksSchema, UpdateTasksSchema, GetNextRunnableTasksSchema } from "@/models/taskSchema";
import crypto from "crypto";
import mongoose from "mongoose";

const mapTaskToOutput = (t: any) => ({
    id: t._id.toString(),
    task: t.task,
    assigned_to: t.assigned_to,
    status: t.status,
    parent_id: t.parent_id?.toString(),
    dependencies: t.dependencies?.map((d: any) => d.toString()) || [],
    created_at: t.created_at.toISOString(),
    updated_at: t.updated_at.toISOString()
});

export const writeTasksDescription = `
This tool allows the Manager Agent to initialize and persist a structured workflow composed of multiple tasks for multi-step agent orchestration.

It acts as the foundational entry point for workflow execution and task delegation across subagents. The tool ensures every task is stored in a deterministic, database-ready structure with guaranteed consistency, unique identifiers, timestamps, dependency relationships, and execution state tracking.

The tool is designed to behave as a strict orchestration API rather than an AI reasoning layer. Its responsibility is limited to validation, normalization, persistence, and deterministic output generation.

Core Responsibilities:
* Initialize structured workflows for multi-agent execution
* Persist tasks as independent MongoDB documents
* Generate unique IDs for all tasks
* Apply system-controlled defaults and timestamps
* Support parent-child task hierarchies
* Support dependency-based execution ordering
* Prevent duplicate task creation during retry loops through idempotency protection
* Return the exact persisted workflow state back to the caller

Execution Semantics:
* \`assigned_to\` represents a deterministic agent identifier (e.g. "manager", "frontend_agent", "research_agent", or "me")
* \`parent_id\` defines hierarchical task relationships
* \`dependencies\` define execution constraints and prerequisite tasks
* These two systems must remain logically separate

Default Behavior:
* If \`status\` is not provided, default to "pending"
* If \`dependencies\` is not provided, default to an empty array []
* \`created_at\` and \`updated_at\` timestamps are generated server-side
* All tasks receive unique generated identifiers automatically

Idempotency Rules:
The tool must prevent accidental duplicate task creation during retries or repeated orchestration passes. Duplicate protection should be based on a deterministic hash generated from:
\${workflow_name}-\${task}-\${assigned_to}

Persistence Rules:
* All tasks must be persisted as independent documents in MongoDB
* MongoDB acts as the single source of truth
* Tool output must reflect the actual persisted database state
* The tool must not perform AI reasoning, task reprioritization, or semantic transformation
`;

export const write_tasks = tool(
    async ({ workflow_name, tasks }) => {
        try {
            await connectDB();

            const results = [];

            for (const t of tasks) {
                const hashInput = `${workflow_name}-${t.task}-${t.assigned_to}`;
                const idempotency_key = crypto.createHash("sha256").update(hashInput).digest("hex");

                const parentIdObj = t.parent_id && mongoose.Types.ObjectId.isValid(t.parent_id)
                    ? new mongoose.Types.ObjectId(t.parent_id)
                    : undefined;

                const depsObj = (t.dependencies || [])
                    .filter(d => mongoose.Types.ObjectId.isValid(d))
                    .map(d => new mongoose.Types.ObjectId(d));

                try {
                    const taskDoc = await TaskModel.findOneAndUpdate(
                        { workflow_name, idempotency_key },
                        {
                            $setOnInsert: {
                                workflow_name,
                                task: t.task,
                                assigned_to: t.assigned_to,
                                status: t.status || "pending",
                                parent_id: parentIdObj,
                                dependencies: depsObj,
                                idempotency_key
                            }
                        },
                        { upsert: true, new: true, runValidators: true }
                    );

                    results.push(taskDoc.toObject());
                } catch (err) {
                    console.error(`[write_tasks] Failed to insert/update task: ${t.task}`, err);
                }
            }

            const mappedTasks = results.map(mapTaskToOutput);

            return JSON.stringify({
                message: `Workflow '${workflow_name}' created successfully with ${results.length} tasks initialized.`,
                workflow_name: workflow_name,
                tasks: mappedTasks
            });

        } catch (error) {
            console.error("[write_tasks] Fatal tool error:", error);
            return JSON.stringify({ error: "Failed to persist tasks to database due to a systemic error." });
        }
    },
    {
        name: "write_tasks",
        description: writeTasksDescription,
        schema: WriteTasksSchema,
    }
);

export const readTasksDescription = `
The read_tasks tool retrieves all tasks belonging to a workflow from the persistent orchestration database.

This tool is used when the manager agent or orchestration layer needs to:
* Inspect the current workflow state
* Determine which tasks are pending or blocked
* Analyze dependencies
* Monitor sub-agent progress
* Resume interrupted workflows
* Coordinate multi-agent execution
`;

export const read_tasks = tool(
    async ({ workflow_name }) => {
        try {
            await connectDB();

            const tasks = await TaskModel.find({ workflow_name }).sort({ created_at: 1 });

            const mappedTasks = tasks.map(mapTaskToOutput);

            return JSON.stringify({
                message: `Retrieved ${tasks.length} tasks for workflow '${workflow_name}'.`,
                workflow_name,
                tasks: mappedTasks
            });
        } catch (error) {
            console.error("[read_tasks] Fatal tool error:", error);
            return JSON.stringify({ error: "Failed to retrieve tasks due to a systemic error." });
        }
    },
    {
        name: "read_tasks",
        description: readTasksDescription,
        schema: ReadTasksSchema,
    }
);

export const updateTasksDescription = `
The update_tasks tool updates existing tasks in a workflow using their unique IDs.

This tool is used when the manager agent wants to:
* Change task execution status
* Mark tasks as completed or blocked
* Reassign tasks to another agent
* Update task descriptions
* Control orchestration flow during execution
`;

export const update_tasks = tool(
    async ({ workflow_name, updates }) => {
        try {
            await connectDB();

            const updated_tasks = [];
            const failed_updates = [];

            for (const update of updates) {
                if (!mongoose.Types.ObjectId.isValid(update.id)) {
                    failed_updates.push({ id: update.id, error: "Invalid task ID format" });
                    continue;
                }

                // Filter undefined fields (excluding 'id') for dynamic update
                const { id: _, ...fields } = update;
                const updateFields = Object.fromEntries(Object.entries(fields).filter(([_, v]) => v !== undefined));

                if (Object.keys(updateFields).length === 0) {
                    failed_updates.push({ id: update.id, error: "No fields provided to update" });
                    continue;
                }

                try {
                    const taskDoc = await TaskModel.findOneAndUpdate(
                        { _id: new mongoose.Types.ObjectId(update.id), workflow_name },
                        { $set: updateFields },
                        { new: true, runValidators: true }
                    );

                    if (!taskDoc) {
                        failed_updates.push({ id: update.id, error: "Task not found or does not belong to workflow" });
                    } else {
                        updated_tasks.push(mapTaskToOutput(taskDoc));
                    }
                } catch (err) {
                    console.error(`[update_tasks] Failed to update task: ${update.id}`, err);
                    failed_updates.push({ id: update.id, error: err instanceof Error ? err.message : String(err) });
                }
            }

            return JSON.stringify({
                message: "Task list updated successfully.",
                workflow_name,
                updated_tasks,
                failed_updates: failed_updates.length > 0 ? failed_updates : undefined
            });

        } catch (error) {
            console.error("[update_tasks] Fatal tool error:", error);
            return JSON.stringify({ error: "Failed to update tasks due to a systemic error." });
        }
    },
    {
        name: "update_tasks",
        description: updateTasksDescription,
        schema: UpdateTasksSchema,
    }
);

export const getNextRunnableTasksDescription = `
The get_next_runnable_tasks tool computes the next executable tasks in a multi-agent orchestration workflow. 
It behaves strictly as a READ-ONLY dependency resolution engine and NEVER mutates workflow state.

Workflows operate as a Directed Acyclic Graph (DAG):
- Tasks are nodes.
- Dependencies are directed edges.
- Execution must follow topological ordering.

This tool computes the next executable tasks safely for autonomous multi-agent workflows. It exists to:
- prevent out-of-order execution
- enforce execution safety
- support manager-agent orchestration loops
- coordinate deterministic subagent scheduling

Runnable Task Criteria:
A task is considered runnable ONLY IF:
1. Its status === "pending"
2. AND it either has NO dependencies OR all of its dependency task IDs strictly point to tasks with status === "completed".

Dependencies must be resolved strictly by task ID.
Blocked, failed, retrying, skipped, or incomplete dependency chains entirely prevent execution eligibility for dependent tasks.

Important Usage Notes:
- This tool should be used by manager/supervisor agents before dispatching work to subagents.
- The result is intended for orchestration planning, not direct execution.

Behavioral Examples (Database State & Expected JSON Output):

Example 1 (Safe Resolution):
State: Task A (status: "completed"), Task B (status: "pending", dependencies: [Task A ID])
Tool Input: { "workflow_name": "example_workflow" }
Tool Output:
{
  "message": "Runnable tasks computed successfully.",
  "workflow_name": "example_workflow",
  "runnable_tasks": [
    { "id": "id_B", "task": "Task B", "assigned_to": "agent_1", "status": "pending", "dependencies": ["id_A"], ... }
  ],
  "blocked_tasks": [],
  "completed_tasks": [
    { "id": "id_A", "task": "Task A", "assigned_to": "agent_1", "status": "completed", "dependencies": [], ... }
  ],
  "unresolved_dependencies": []
}

Example 2 (Blocked Execution Chain):
State: Task A (status: "in_progress"), Task B (status: "pending", dependencies: [Task A ID])
Tool Input: { "workflow_name": "example_workflow" }
Tool Output:
{
  "message": "Runnable tasks computed successfully.",
  "workflow_name": "example_workflow",
  "runnable_tasks": [],
  "blocked_tasks": [
    { "id": "id_B", "task": "Task B", "assigned_to": "agent_1", "status": "pending", "dependencies": ["id_A"], ... }
  ],
  "completed_tasks": [],
  "unresolved_dependencies": []
}
`;

export const get_next_runnable_tasks = tool(
    async ({ workflow_name }) => {
        try {
            await connectDB();
            const tasks = await TaskModel.find({ workflow_name }).sort({ created_at: 1 });

            const taskMap = new Map();
            for (const t of tasks) {
                taskMap.set(t._id.toString(), t);
            }

            const runnable_tasks = [];
            const blocked_tasks = [];
            const completed_tasks = [];
            const unresolved_dependencies = [];

            for (const t of tasks) {
                const normalizedTask = mapTaskToOutput(t);

                if (t.status === "completed") {
                    completed_tasks.push(normalizedTask);
                    continue;
                }

                if (t.status !== "pending") {
                    // Task is in_progress, failed, skipped, blocked, etc.
                    continue;
                }

                // t.status === "pending"
                let isRunnable = true;
                let hasUnresolved = false;

                if (t.dependencies && t.dependencies.length > 0) {
                    for (const depIdObj of t.dependencies) {
                        const depId = depIdObj.toString();
                        const depTask = taskMap.get(depId);

                        if (!depTask) {
                            hasUnresolved = true;
                            isRunnable = false;
                            break;
                        }

                        if (depTask.status !== "completed") {
                            isRunnable = false;
                        }
                    }
                }

                if (hasUnresolved) {
                    unresolved_dependencies.push(normalizedTask);
                } else if (isRunnable) {
                    runnable_tasks.push(normalizedTask);
                } else {
                    blocked_tasks.push(normalizedTask);
                }
            }

            return JSON.stringify({
                message: "Runnable tasks computed successfully.",
                workflow_name,
                runnable_tasks,
                blocked_tasks,
                completed_tasks,
                unresolved_dependencies
            });

        } catch (error) {
            console.error("[get_next_runnable_tasks] Fatal tool error:", error);
            return JSON.stringify({ error: "Failed to compute runnable tasks due to a systemic error." });
        }
    },
    {
        name: "get_next_runnable_tasks",
        description: getNextRunnableTasksDescription,
        schema: GetNextRunnableTasksSchema,
    }
);


const taskToolsList = [write_tasks, read_tasks, update_tasks, get_next_runnable_tasks];

export { taskToolsList };
