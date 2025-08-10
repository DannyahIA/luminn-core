package domain

import (
	"testing"
	"time"
)

func TestNewTask(t *testing.T) {
	name := "Test Task"
	description := "Test Description"

	task := NewTask(name, description)

	if task.Name != name {
		t.Errorf("Expected name %s, got %s", name, task.Name)
	}

	if task.Description != description {
		t.Errorf("Expected description %s, got %s", description, task.Description)
	}

	if task.Status != TaskStatusPending {
		t.Errorf("Expected status %s, got %s", TaskStatusPending, task.Status)
	}

	if task.ID != "" {
		t.Errorf("Expected empty ID, got %s", task.ID)
	}

	if len(task.Parameters) != 0 {
		t.Errorf("Expected empty parameters, got %d", len(task.Parameters))
	}

	// Check timestamps
	now := time.Now()
	if task.CreatedAt.After(now) {
		t.Errorf("CreatedAt should not be in the future")
	}

	if task.UpdatedAt.After(now) {
		t.Errorf("UpdatedAt should not be in the future")
	}
}

func TestTask_UpdateStatus(t *testing.T) {
	task := NewTask("Test", "Description")
	originalUpdatedAt := task.UpdatedAt

	// Sleep to ensure time difference
	time.Sleep(time.Millisecond)

	task.UpdateStatus(TaskStatusRunning)

	if task.Status != TaskStatusRunning {
		t.Errorf("Expected status %s, got %s", TaskStatusRunning, task.Status)
	}

	if task.ExecutedAt == nil {
		t.Errorf("ExecutedAt should be set when status is RUNNING")
	}

	if !task.UpdatedAt.After(originalUpdatedAt) {
		t.Errorf("UpdatedAt should be updated")
	}
}

func TestTask_AddParameter(t *testing.T) {
	task := NewTask("Test", "Description")

	task.AddParameter("key1", "value1", ParameterTypeString)

	if len(task.Parameters) != 1 {
		t.Errorf("Expected 1 parameter, got %d", len(task.Parameters))
	}

	param := task.Parameters[0]
	if param.Key != "key1" {
		t.Errorf("Expected key 'key1', got %s", param.Key)
	}

	if param.Value != "value1" {
		t.Errorf("Expected value 'value1', got %s", param.Value)
	}

	if param.Type != ParameterTypeString {
		t.Errorf("Expected type %s, got %s", ParameterTypeString, param.Type)
	}
}

func TestTask_IsExecutable(t *testing.T) {
	task := NewTask("Test", "Description")

	// Pending task should be executable
	if !task.IsExecutable() {
		t.Errorf("Pending task should be executable")
	}

	// Running task should not be executable
	task.UpdateStatus(TaskStatusRunning)
	if task.IsExecutable() {
		t.Errorf("Running task should not be executable")
	}

	// Completed task should not be executable
	task.UpdateStatus(TaskStatusCompleted)
	if task.IsExecutable() {
		t.Errorf("Completed task should not be executable")
	}
}

func TestTask_IsCompleted(t *testing.T) {
	task := NewTask("Test", "Description")

	// Pending task should not be completed
	if task.IsCompleted() {
		t.Errorf("Pending task should not be completed")
	}

	// Running task should not be completed
	task.UpdateStatus(TaskStatusRunning)
	if task.IsCompleted() {
		t.Errorf("Running task should not be completed")
	}

	// Completed task should be completed
	task.UpdateStatus(TaskStatusCompleted)
	if !task.IsCompleted() {
		t.Errorf("Completed task should be completed")
	}

	// Failed task should be completed
	task.UpdateStatus(TaskStatusFailed)
	if !task.IsCompleted() {
		t.Errorf("Failed task should be completed")
	}

	// Cancelled task should be completed
	task.UpdateStatus(TaskStatusCancelled)
	if !task.IsCompleted() {
		t.Errorf("Cancelled task should be completed")
	}
}
