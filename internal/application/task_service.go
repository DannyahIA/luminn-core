// Package application contains the use cases and application services
package application

import (
	"context"
	"fmt"

	"automation-hub/internal/domain"
)

// TaskService handles task-related use cases
type TaskService struct {
	taskRepo     domain.TaskRepository
	taskExecutor domain.TaskExecutor
	eventPub     domain.EventPublisher
	idGen        domain.IDGenerator
}

// NewTaskService creates a new TaskService instance
func NewTaskService(
	taskRepo domain.TaskRepository,
	taskExecutor domain.TaskExecutor,
	eventPub domain.EventPublisher,
	idGen domain.IDGenerator,
) *TaskService {
	return &TaskService{
		taskRepo:     taskRepo,
		taskExecutor: taskExecutor,
		eventPub:     eventPub,
		idGen:        idGen,
	}
}

// CreateTaskInput represents the input for creating a task
type CreateTaskInput struct {
	Name        string
	Description string
	Parameters  []ParameterInput
}

// ParameterInput represents a parameter input
type ParameterInput struct {
	Key   string
	Value string
	Type  domain.ParameterType
}

// UpdateTaskInput represents the input for updating a task
type UpdateTaskInput struct {
	ID          string
	Name        *string
	Description *string
	Status      *domain.TaskStatus
	Parameters  []ParameterInput
}

// CreateTask creates a new task
func (s *TaskService) CreateTask(ctx context.Context, input CreateTaskInput) (*domain.Task, error) {
	task := domain.NewTask(input.Name, input.Description)
	task.ID = s.idGen.Generate()

	// Add parameters
	for _, param := range input.Parameters {
		task.AddParameter(param.Key, param.Value, param.Type)
	}

	if err := s.taskRepo.Create(ctx, task); err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return task, nil
}

// GetTask retrieves a task by ID
func (s *TaskService) GetTask(ctx context.Context, id string) (*domain.Task, error) {
	task, err := s.taskRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get task: %w", err)
	}
	return task, nil
}

// GetAllTasks retrieves all tasks
func (s *TaskService) GetAllTasks(ctx context.Context) ([]*domain.Task, error) {
	tasks, err := s.taskRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all tasks: %w", err)
	}
	return tasks, nil
}

// UpdateTask updates an existing task
func (s *TaskService) UpdateTask(ctx context.Context, input UpdateTaskInput) (*domain.Task, error) {
	task, err := s.taskRepo.GetByID(ctx, input.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get task for update: %w", err)
	}

	// Update fields if provided
	if input.Name != nil {
		task.Name = *input.Name
	}
	if input.Description != nil {
		task.Description = *input.Description
	}
	if input.Status != nil {
		oldStatus := task.Status
		task.UpdateStatus(*input.Status)

		// Publish status change event if status changed
		if oldStatus != *input.Status {
			if err := s.eventPub.PublishTaskStatusChanged(ctx, task); err != nil {
				// Log error but don't fail the update
				fmt.Printf("Failed to publish task status change event: %v\n", err)
			}
		}
	}

	// Update parameters if provided
	if len(input.Parameters) > 0 {
		task.Parameters = make([]domain.Parameter, 0, len(input.Parameters))
		for _, param := range input.Parameters {
			task.AddParameter(param.Key, param.Value, param.Type)
		}
	}

	if err := s.taskRepo.Update(ctx, task); err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return task, nil
}

// DeleteTask deletes a task by ID
func (s *TaskService) DeleteTask(ctx context.Context, id string) error {
	if err := s.taskRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}
	return nil
}

// ExecuteTask executes a task
func (s *TaskService) ExecuteTask(ctx context.Context, id string) (*domain.Task, error) {
	task, err := s.taskRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get task for execution: %w", err)
	}

	if !task.IsExecutable() {
		return nil, fmt.Errorf("task %s is not executable (current status: %s)", id, task.Status)
	}

	// Update status to running
	task.UpdateStatus(domain.TaskStatusRunning)
	if err := s.taskRepo.Update(ctx, task); err != nil {
		return nil, fmt.Errorf("failed to update task status to running: %w", err)
	}

	// Publish status change event
	if err := s.eventPub.PublishTaskStatusChanged(ctx, task); err != nil {
		fmt.Printf("Failed to publish task status change event: %v\n", err)
	}

	// Execute the task
	if err := s.taskExecutor.Execute(ctx, task); err != nil {
		// Update status to failed
		task.UpdateStatus(domain.TaskStatusFailed)
		if updateErr := s.taskRepo.Update(ctx, task); updateErr != nil {
			return nil, fmt.Errorf("task execution failed and failed to update status: %v (original error: %w)", updateErr, err)
		}

		// Publish status change event
		if pubErr := s.eventPub.PublishTaskStatusChanged(ctx, task); pubErr != nil {
			fmt.Printf("Failed to publish task status change event: %v\n", pubErr)
		}

		return task, fmt.Errorf("task execution failed: %w", err)
	}

	// Update status to completed
	task.UpdateStatus(domain.TaskStatusCompleted)
	if err := s.taskRepo.Update(ctx, task); err != nil {
		return nil, fmt.Errorf("failed to update task status to completed: %w", err)
	}

	// Publish status change event
	if err := s.eventPub.PublishTaskStatusChanged(ctx, task); err != nil {
		fmt.Printf("Failed to publish task status change event: %v\n", err)
	}

	return task, nil
}

// GetTasksByStatus retrieves tasks by status
func (s *TaskService) GetTasksByStatus(ctx context.Context, status domain.TaskStatus) ([]*domain.Task, error) {
	tasks, err := s.taskRepo.GetByStatus(ctx, status)
	if err != nil {
		return nil, fmt.Errorf("failed to get tasks by status: %w", err)
	}
	return tasks, nil
}
