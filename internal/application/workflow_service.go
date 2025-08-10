package application

import (
	"context"
	"fmt"

	"automation-hub/internal/domain"
)

// WorkflowService handles workflow-related use cases
type WorkflowService struct {
	workflowRepo     domain.WorkflowRepository
	taskRepo         domain.TaskRepository
	workflowExecutor domain.WorkflowExecutor
	eventPub         domain.EventPublisher
	idGen            domain.IDGenerator
}

// NewWorkflowService creates a new WorkflowService instance
func NewWorkflowService(
	workflowRepo domain.WorkflowRepository,
	taskRepo domain.TaskRepository,
	workflowExecutor domain.WorkflowExecutor,
	eventPub domain.EventPublisher,
	idGen domain.IDGenerator,
) *WorkflowService {
	return &WorkflowService{
		workflowRepo:     workflowRepo,
		taskRepo:         taskRepo,
		workflowExecutor: workflowExecutor,
		eventPub:         eventPub,
		idGen:            idGen,
	}
}

// CreateWorkflowInput represents the input for creating a workflow
type CreateWorkflowInput struct {
	Name        string
	Description string
	TaskIDs     []string
}

// CreateWorkflow creates a new workflow
func (s *WorkflowService) CreateWorkflow(ctx context.Context, input CreateWorkflowInput) (*domain.Workflow, error) {
	// Validate that all task IDs exist
	for _, taskID := range input.TaskIDs {
		if _, err := s.taskRepo.GetByID(ctx, taskID); err != nil {
			return nil, fmt.Errorf("task %s not found: %w", taskID, err)
		}
	}

	workflow := domain.NewWorkflow(input.Name, input.Description, input.TaskIDs)
	workflow.ID = s.idGen.Generate()

	if err := s.workflowRepo.Create(ctx, workflow); err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	return workflow, nil
}

// GetWorkflow retrieves a workflow by ID
func (s *WorkflowService) GetWorkflow(ctx context.Context, id string) (*domain.Workflow, error) {
	workflow, err := s.workflowRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow: %w", err)
	}
	return workflow, nil
}

// GetAllWorkflows retrieves all workflows
func (s *WorkflowService) GetAllWorkflows(ctx context.Context) ([]*domain.Workflow, error) {
	workflows, err := s.workflowRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all workflows: %w", err)
	}
	return workflows, nil
}

// GetWorkflowTasks retrieves all tasks for a workflow
func (s *WorkflowService) GetWorkflowTasks(ctx context.Context, workflowID string) ([]*domain.Task, error) {
	workflow, err := s.workflowRepo.GetByID(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow: %w", err)
	}

	tasks := make([]*domain.Task, 0, len(workflow.TaskIDs))
	for _, taskID := range workflow.TaskIDs {
		task, err := s.taskRepo.GetByID(ctx, taskID)
		if err != nil {
			return nil, fmt.Errorf("failed to get task %s: %w", taskID, err)
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

// ExecuteWorkflow executes a workflow and all its tasks
func (s *WorkflowService) ExecuteWorkflow(ctx context.Context, id string) (*domain.Workflow, error) {
	workflow, err := s.workflowRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow for execution: %w", err)
	}

	if !workflow.IsExecutable() {
		return nil, fmt.Errorf("workflow %s is not executable (current status: %s)", id, workflow.Status)
	}

	if !workflow.HasTasks() {
		return nil, fmt.Errorf("workflow %s has no tasks to execute", id)
	}

	// Get all tasks
	tasks, err := s.GetWorkflowTasks(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow tasks: %w", err)
	}

	// Update status to active
	workflow.UpdateStatus(domain.WorkflowStatusActive)
	if err := s.workflowRepo.Update(ctx, workflow); err != nil {
		return nil, fmt.Errorf("failed to update workflow status to active: %w", err)
	}

	// Publish status change event
	if err := s.eventPub.PublishWorkflowStatusChanged(ctx, workflow); err != nil {
		fmt.Printf("Failed to publish workflow status change event: %v\n", err)
	}

	// Execute the workflow
	if err := s.workflowExecutor.Execute(ctx, workflow, tasks); err != nil {
		// Update status to failed
		workflow.UpdateStatus(domain.WorkflowStatusFailed)
		if updateErr := s.workflowRepo.Update(ctx, workflow); updateErr != nil {
			return nil, fmt.Errorf("workflow execution failed and failed to update status: %v (original error: %w)", updateErr, err)
		}

		// Publish status change event
		if pubErr := s.eventPub.PublishWorkflowStatusChanged(ctx, workflow); pubErr != nil {
			fmt.Printf("Failed to publish workflow status change event: %v\n", pubErr)
		}

		return workflow, fmt.Errorf("workflow execution failed: %w", err)
	}

	// Update status to completed
	workflow.UpdateStatus(domain.WorkflowStatusCompleted)
	if err := s.workflowRepo.Update(ctx, workflow); err != nil {
		return nil, fmt.Errorf("failed to update workflow status to completed: %w", err)
	}

	// Publish status change event
	if err := s.eventPub.PublishWorkflowStatusChanged(ctx, workflow); err != nil {
		fmt.Printf("Failed to publish workflow status change event: %v\n", err)
	}

	return workflow, nil
}

// AddTaskToWorkflow adds a task to an existing workflow
func (s *WorkflowService) AddTaskToWorkflow(ctx context.Context, workflowID, taskID string) (*domain.Workflow, error) {
	// Validate that the task exists
	if _, err := s.taskRepo.GetByID(ctx, taskID); err != nil {
		return nil, fmt.Errorf("task %s not found: %w", taskID, err)
	}

	workflow, err := s.workflowRepo.GetByID(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow: %w", err)
	}

	workflow.AddTask(taskID)

	if err := s.workflowRepo.Update(ctx, workflow); err != nil {
		return nil, fmt.Errorf("failed to update workflow: %w", err)
	}

	return workflow, nil
}

// RemoveTaskFromWorkflow removes a task from an existing workflow
func (s *WorkflowService) RemoveTaskFromWorkflow(ctx context.Context, workflowID, taskID string) (*domain.Workflow, error) {
	workflow, err := s.workflowRepo.GetByID(ctx, workflowID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow: %w", err)
	}

	workflow.RemoveTask(taskID)

	if err := s.workflowRepo.Update(ctx, workflow); err != nil {
		return nil, fmt.Errorf("failed to update workflow: %w", err)
	}

	return workflow, nil
}
