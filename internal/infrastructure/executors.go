package infrastructure

import (
	"context"
	"fmt"
	"time"

	"automation-hub/internal/domain"
)

// SimpleTaskExecutor is a basic implementation of TaskExecutor
type SimpleTaskExecutor struct {
	runningTasks map[string]bool
}

// NewSimpleTaskExecutor creates a new simple task executor
func NewSimpleTaskExecutor() *SimpleTaskExecutor {
	return &SimpleTaskExecutor{
		runningTasks: make(map[string]bool),
	}
}

// Execute runs a task with the given parameters
func (e *SimpleTaskExecutor) Execute(ctx context.Context, task *domain.Task) error {
	e.runningTasks[task.ID] = true
	defer delete(e.runningTasks, task.ID)

	// Simulate task execution time
	select {
	case <-time.After(time.Second * 2): // Simulate 2 seconds of work
		// Task completed successfully
		return nil
	case <-ctx.Done():
		return fmt.Errorf("task execution cancelled: %w", ctx.Err())
	}
}

// Cancel cancels a running task
func (e *SimpleTaskExecutor) Cancel(ctx context.Context, taskID string) error {
	if !e.runningTasks[taskID] {
		return fmt.Errorf("task %s is not running", taskID)
	}

	delete(e.runningTasks, taskID)
	return nil
}

// GetStatus returns the current status of a task execution
func (e *SimpleTaskExecutor) GetStatus(ctx context.Context, taskID string) (domain.TaskStatus, error) {
	if e.runningTasks[taskID] {
		return domain.TaskStatusRunning, nil
	}

	// If not running, we can't determine status from executor alone
	// This would typically query the task repository
	return domain.TaskStatusPending, nil
}

// SimpleWorkflowExecutor is a basic implementation of WorkflowExecutor
type SimpleWorkflowExecutor struct {
	taskExecutor     domain.TaskExecutor
	runningWorkflows map[string]bool
}

// NewSimpleWorkflowExecutor creates a new simple workflow executor
func NewSimpleWorkflowExecutor(taskExecutor domain.TaskExecutor) *SimpleWorkflowExecutor {
	return &SimpleWorkflowExecutor{
		taskExecutor:     taskExecutor,
		runningWorkflows: make(map[string]bool),
	}
}

// Execute runs a workflow and all its tasks
func (e *SimpleWorkflowExecutor) Execute(ctx context.Context, workflow *domain.Workflow, tasks []*domain.Task) error {
	e.runningWorkflows[workflow.ID] = true
	defer delete(e.runningWorkflows, workflow.ID)

	// Execute tasks sequentially
	for _, task := range tasks {
		if !task.IsExecutable() {
			// Skip non-executable tasks but continue with others
			continue
		}

		// Execute the task
		if err := e.taskExecutor.Execute(ctx, task); err != nil {
			return fmt.Errorf("failed to execute task %s in workflow %s: %w", task.ID, workflow.ID, err)
		}

		// Check if context was cancelled
		select {
		case <-ctx.Done():
			return fmt.Errorf("workflow execution cancelled: %w", ctx.Err())
		default:
			// Continue to next task
		}
	}

	return nil
}

// Cancel cancels a running workflow
func (e *SimpleWorkflowExecutor) Cancel(ctx context.Context, workflowID string) error {
	if !e.runningWorkflows[workflowID] {
		return fmt.Errorf("workflow %s is not running", workflowID)
	}

	delete(e.runningWorkflows, workflowID)
	return nil
}

// GetStatus returns the current status of a workflow execution
func (e *SimpleWorkflowExecutor) GetStatus(ctx context.Context, workflowID string) (domain.WorkflowStatus, error) {
	if e.runningWorkflows[workflowID] {
		return domain.WorkflowStatusActive, nil
	}

	// If not running, we can't determine status from executor alone
	// This would typically query the workflow repository
	return domain.WorkflowStatusDraft, nil
}
