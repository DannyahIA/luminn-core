package domain

import (
	"time"
)

// WorkflowStatus represents the possible states of a workflow
type WorkflowStatus string

const (
	WorkflowStatusDraft     WorkflowStatus = "DRAFT"
	WorkflowStatusActive    WorkflowStatus = "ACTIVE"
	WorkflowStatusPaused    WorkflowStatus = "PAUSED"
	WorkflowStatusCompleted WorkflowStatus = "COMPLETED"
	WorkflowStatusFailed    WorkflowStatus = "FAILED"
)

// Workflow represents an automation workflow containing multiple tasks
type Workflow struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	TaskIDs     []string       `json:"task_ids"`
	Status      WorkflowStatus `json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// NewWorkflow creates a new workflow with the given name and description
func NewWorkflow(name, description string, taskIDs []string) *Workflow {
	now := time.Now()
	return &Workflow{
		Name:        name,
		Description: description,
		TaskIDs:     taskIDs,
		Status:      WorkflowStatusDraft,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// UpdateStatus updates the workflow status and timestamp
func (w *Workflow) UpdateStatus(status WorkflowStatus) {
	w.Status = status
	w.UpdatedAt = time.Now()
}

// AddTask adds a task ID to the workflow
func (w *Workflow) AddTask(taskID string) {
	w.TaskIDs = append(w.TaskIDs, taskID)
	w.UpdatedAt = time.Now()
}

// RemoveTask removes a task ID from the workflow
func (w *Workflow) RemoveTask(taskID string) {
	for i, id := range w.TaskIDs {
		if id == taskID {
			w.TaskIDs = append(w.TaskIDs[:i], w.TaskIDs[i+1:]...)
			w.UpdatedAt = time.Now()
			break
		}
	}
}

// IsExecutable returns true if the workflow can be executed
func (w *Workflow) IsExecutable() bool {
	return w.Status == WorkflowStatusDraft || w.Status == WorkflowStatusPaused
}

// IsCompleted returns true if the workflow is in a final state
func (w *Workflow) IsCompleted() bool {
	return w.Status == WorkflowStatusCompleted || w.Status == WorkflowStatusFailed
}

// HasTasks returns true if the workflow has tasks
func (w *Workflow) HasTasks() bool {
	return len(w.TaskIDs) > 0
}
