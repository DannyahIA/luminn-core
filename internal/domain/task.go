// Package domain contains the core business entities and interfaces
package domain

import (
	"time"
)

// TaskStatus represents the possible states of a task
type TaskStatus string

const (
	TaskStatusPending   TaskStatus = "PENDING"
	TaskStatusRunning   TaskStatus = "RUNNING"
	TaskStatusCompleted TaskStatus = "COMPLETED"
	TaskStatusFailed    TaskStatus = "FAILED"
	TaskStatusCancelled TaskStatus = "CANCELLED"
)

// ParameterType represents the type of a parameter
type ParameterType string

const (
	ParameterTypeString  ParameterType = "STRING"
	ParameterTypeNumber  ParameterType = "NUMBER"
	ParameterTypeBoolean ParameterType = "BOOLEAN"
	ParameterTypeJSON    ParameterType = "JSON"
)

// Parameter represents a key-value parameter for tasks
type Parameter struct {
	Key   string        `json:"key"`
	Value string        `json:"value"`
	Type  ParameterType `json:"type"`
}

// Task represents an automation task in the system
type Task struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Status      TaskStatus  `json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	ExecutedAt  *time.Time  `json:"executed_at,omitempty"`
	Parameters  []Parameter `json:"parameters"`
}

// NewTask creates a new task with the given name and description
func NewTask(name, description string) *Task {
	now := time.Now()
	return &Task{
		Name:        name,
		Description: description,
		Status:      TaskStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
		Parameters:  make([]Parameter, 0),
	}
}

// UpdateStatus updates the task status and timestamp
func (t *Task) UpdateStatus(status TaskStatus) {
	t.Status = status
	t.UpdatedAt = time.Now()

	if status == TaskStatusRunning {
		now := time.Now()
		t.ExecutedAt = &now
	}
}

// AddParameter adds a parameter to the task
func (t *Task) AddParameter(key, value string, paramType ParameterType) {
	t.Parameters = append(t.Parameters, Parameter{
		Key:   key,
		Value: value,
		Type:  paramType,
	})
	t.UpdatedAt = time.Now()
}

// IsExecutable returns true if the task can be executed
func (t *Task) IsExecutable() bool {
	return t.Status == TaskStatusPending
}

// IsCompleted returns true if the task is in a final state
func (t *Task) IsCompleted() bool {
	return t.Status == TaskStatusCompleted ||
		t.Status == TaskStatusFailed ||
		t.Status == TaskStatusCancelled
}
