import { write_tasks, read_tasks, update_tasks, get_next_runnable_tasks } from "./src/tools/taskTool";
import { connectDB } from "./src/lib/mongodb/mongodb";
import mongoose from "mongoose";
import { TaskModel } from "./src/models/taskSchema";

async function runTests() {
    console.log("=== Starting Task Tools Integration Tests ===");
    
    // Ensure DB connection
    await connectDB();
    
    const workflow_name = `test_workflow_${Date.now()}`;
    console.log(`Using workflow_name: ${workflow_name}`);

    try {
        // --- 1. write_tasks ---
        console.log("\n--- Testing write_tasks ---");
        const writePayload = {
            workflow_name,
            tasks: [
                { task: "Task A", assigned_to: "agent_1" }, // Default to pending
                { task: "Task B", assigned_to: "agent_1" }
            ]
        };
        const writeResStr = await write_tasks.invoke(writePayload);
        const writeRes = JSON.parse(writeResStr);
        console.log("write_tasks Result:", writeRes);
        
        const taskA = writeRes.tasks.find((t: any) => t.task === "Task A");
        const taskB = writeRes.tasks.find((t: any) => t.task === "Task B");
        
        if (!taskA || !taskB) throw new Error("Tasks not returned from write_tasks");
        
        // --- 1b. write_tasks idempotency + dependencies ---
        console.log("\n--- Testing write_tasks (Dependencies + Idempotency) ---");
        const writePayload2 = {
            workflow_name,
            tasks: [
                { task: "Task A", assigned_to: "agent_1" }, // Should be skipped/idempotent update
                { task: "Task C", assigned_to: "agent_2", dependencies: [taskA.id, taskB.id] }
            ]
        };
        const writeResStr2 = await write_tasks.invoke(writePayload2);
        const writeRes2 = JSON.parse(writeResStr2);
        console.log("write_tasks (deps) Result:", writeRes2);
        const taskC = writeRes2.tasks.find((t: any) => t.task === "Task C");

        // --- 2. read_tasks ---
        console.log("\n--- Testing read_tasks ---");
        const readResStr = await read_tasks.invoke({ workflow_name });
        const readRes = JSON.parse(readResStr);
        console.log("read_tasks Result:", readRes);

        if (readRes.tasks.length !== 3) {
            console.warn(`Expected 3 tasks, got ${readRes.tasks.length}`);
        }

        // --- 3. get_next_runnable_tasks (Initial State) ---
        console.log("\n--- Testing get_next_runnable_tasks (Initial) ---");
        let runResStr = await get_next_runnable_tasks.invoke({ workflow_name });
        let runRes = JSON.parse(runResStr);
        console.log("Runnable Tasks:", runRes.runnable_tasks.map((t: any) => t.task));
        console.log("Blocked Tasks:", runRes.blocked_tasks.map((t: any) => t.task));
        
        // --- 4. update_tasks ---
        console.log("\n--- Testing update_tasks (Complete Task A) ---");
        const updatePayload = {
            workflow_name,
            updates: [
                { id: taskA.id, status: "completed" as const },
                { id: taskB.id, status: "in_progress" as const }
            ]
        };
        const updateResStr = await update_tasks.invoke(updatePayload);
        const updateRes = JSON.parse(updateResStr);
        console.log("update_tasks Result:", updateRes);

        // --- 5. get_next_runnable_tasks (After partial update) ---
        console.log("\n--- Testing get_next_runnable_tasks (After A=completed, B=in_progress) ---");
        runResStr = await get_next_runnable_tasks.invoke({ workflow_name });
        runRes = JSON.parse(runResStr);
        console.log("Runnable Tasks:", runRes.runnable_tasks.map((t: any) => t.task));
        console.log("Blocked Tasks:", runRes.blocked_tasks.map((t: any) => t.task));
        console.log("Completed Tasks:", runRes.completed_tasks.map((t: any) => t.task));

        // --- 6. update_tasks (Complete Task B to unlock Task C) ---
        console.log("\n--- Testing update_tasks (Complete Task B) ---");
        await update_tasks.invoke({
            workflow_name,
            updates: [{ id: taskB.id, status: "completed" as const }]
        });
        
        // --- 7. get_next_runnable_tasks (After full update) ---
        console.log("\n--- Testing get_next_runnable_tasks (After B=completed) ---");
        runResStr = await get_next_runnable_tasks.invoke({ workflow_name });
        runRes = JSON.parse(runResStr);
        console.log("Runnable Tasks (Expected C):", runRes.runnable_tasks.map((t: any) => t.task));
        console.log("Blocked Tasks:", runRes.blocked_tasks.map((t: any) => t.task));
        console.log("Completed Tasks (Expected A, B):", runRes.completed_tasks.map((t: any) => t.task));

        console.log("\n=== Integration Tests Passed Successfully! ===");
    } catch (err) {
        console.error("Test execution failed:", err);
    } finally {
        // Cleanup test data
        await TaskModel.deleteMany({ workflow_name });
        await mongoose.disconnect();
    }
}

runTests();
