package infrastructure

import (
	"automation-hub/internal/domain"
	"context"
	"testing"
)

func TestInMemoryTaskRepository_Create(t *testing.T) {
	repo := NewInMemoryTaskRepository()
	ctx := context.Background()

	task := domain.NewTask("Test Task", "Test Description")
	task.ID = "test-id"

	err := repo.Create(ctx, task)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Try to create the same task again (should fail)
	err = repo.Create(ctx, task)
	if err == nil {
		t.Errorf("Expected error when creating duplicate task")
	}
}

func TestInMemoryTaskRepository_GetByID(t *testing.T) {
	repo := NewInMemoryTaskRepository()
	ctx := context.Background()

	// Test getting non-existent task
	_, err := repo.GetByID(ctx, "non-existent")
	if err == nil {
		t.Errorf("Expected error when getting non-existent task")
	}

	// Create and get task
	task := domain.NewTask("Test Task", "Test Description")
	task.ID = "test-id"

	err = repo.Create(ctx, task)
	if err != nil {
		t.Errorf("Error creating task: %v", err)
	}

	retrieved, err := repo.GetByID(ctx, "test-id")
	if err != nil {
		t.Errorf("Error getting task: %v", err)
	}

	if retrieved.ID != task.ID {
		t.Errorf("Expected ID %s, got %s", task.ID, retrieved.ID)
	}

	if retrieved.Name != task.Name {
		t.Errorf("Expected name %s, got %s", task.Name, retrieved.Name)
	}
}

func TestInMemoryTaskRepository_GetAll(t *testing.T) {
	repo := NewInMemoryTaskRepository()
	ctx := context.Background()

	// Test empty repository
	tasks, err := repo.GetAll(ctx)
	if err != nil {
		t.Errorf("Error getting all tasks: %v", err)
	}

	if len(tasks) != 0 {
		t.Errorf("Expected 0 tasks, got %d", len(tasks))
	}

	// Add some tasks
	task1 := domain.NewTask("Task 1", "Description 1")
	task1.ID = "task-1"
	task2 := domain.NewTask("Task 2", "Description 2")
	task2.ID = "task-2"

	repo.Create(ctx, task1)
	repo.Create(ctx, task2)

	tasks, err = repo.GetAll(ctx)
	if err != nil {
		t.Errorf("Error getting all tasks: %v", err)
	}

	if len(tasks) != 2 {
		t.Errorf("Expected 2 tasks, got %d", len(tasks))
	}
}

func TestInMemoryTaskRepository_Update(t *testing.T) {
	repo := NewInMemoryTaskRepository()
	ctx := context.Background()

	// Test updating non-existent task
	task := domain.NewTask("Test Task", "Test Description")
	task.ID = "non-existent"

	err := repo.Update(ctx, task)
	if err == nil {
		t.Errorf("Expected error when updating non-existent task")
	}

	// Create and update task
	task.ID = "test-id"
	repo.Create(ctx, task)

	task.Name = "Updated Name"
	err = repo.Update(ctx, task)
	if err != nil {
		t.Errorf("Error updating task: %v", err)
	}

	retrieved, _ := repo.GetByID(ctx, "test-id")
	if retrieved.Name != "Updated Name" {
		t.Errorf("Expected updated name 'Updated Name', got %s", retrieved.Name)
	}
}

func TestInMemoryTaskRepository_Delete(t *testing.T) {
	repo := NewInMemoryTaskRepository()
	ctx := context.Background()

	// Test deleting non-existent task
	err := repo.Delete(ctx, "non-existent")
	if err == nil {
		t.Errorf("Expected error when deleting non-existent task")
	}

	// Create and delete task
	task := domain.NewTask("Test Task", "Test Description")
	task.ID = "test-id"
	repo.Create(ctx, task)

	err = repo.Delete(ctx, "test-id")
	if err != nil {
		t.Errorf("Error deleting task: %v", err)
	}

	_, err = repo.GetByID(ctx, "test-id")
	if err == nil {
		t.Errorf("Expected error when getting deleted task")
	}
}

func TestInMemoryTaskRepository_GetByStatus(t *testing.T) {
	repo := NewInMemoryTaskRepository()
	ctx := context.Background()

	// Create tasks with different statuses
	task1 := domain.NewTask("Task 1", "Description 1")
	task1.ID = "task-1"
	task1.UpdateStatus(domain.TaskStatusPending)

	task2 := domain.NewTask("Task 2", "Description 2")
	task2.ID = "task-2"
	task2.UpdateStatus(domain.TaskStatusRunning)

	task3 := domain.NewTask("Task 3", "Description 3")
	task3.ID = "task-3"
	task3.UpdateStatus(domain.TaskStatusCompleted)

	repo.Create(ctx, task1)
	repo.Create(ctx, task2)
	repo.Create(ctx, task3)

	// Test getting pending tasks
	pendingTasks, err := repo.GetByStatus(ctx, domain.TaskStatusPending)
	if err != nil {
		t.Errorf("Error getting pending tasks: %v", err)
	}

	if len(pendingTasks) != 1 {
		t.Errorf("Expected 1 pending task, got %d", len(pendingTasks))
	}

	if pendingTasks[0].ID != "task-1" {
		t.Errorf("Expected pending task ID 'task-1', got %s", pendingTasks[0].ID)
	}

	// Test getting running tasks
	runningTasks, err := repo.GetByStatus(ctx, domain.TaskStatusRunning)
	if err != nil {
		t.Errorf("Error getting running tasks: %v", err)
	}

	if len(runningTasks) != 1 {
		t.Errorf("Expected 1 running task, got %d", len(runningTasks))
	}
}
