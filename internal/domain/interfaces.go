package domain

import "context"

// TaskRepository defines the interface for task persistence operations
type TaskRepository interface {
	// Create stores a new task
	Create(ctx context.Context, task *Task) error

	// GetByID retrieves a task by its ID
	GetByID(ctx context.Context, id string) (*Task, error)

	// GetAll retrieves all tasks
	GetAll(ctx context.Context) ([]*Task, error)

	// Update updates an existing task
	Update(ctx context.Context, task *Task) error

	// Delete removes a task by its ID
	Delete(ctx context.Context, id string) error

	// GetByStatus retrieves tasks by status
	GetByStatus(ctx context.Context, status TaskStatus) ([]*Task, error)
}

// WorkflowRepository defines the interface for workflow persistence operations
type WorkflowRepository interface {
	// Create stores a new workflow
	Create(ctx context.Context, workflow *Workflow) error

	// GetByID retrieves a workflow by its ID
	GetByID(ctx context.Context, id string) (*Workflow, error)

	// GetAll retrieves all workflows
	GetAll(ctx context.Context) ([]*Workflow, error)

	// Update updates an existing workflow
	Update(ctx context.Context, workflow *Workflow) error

	// Delete removes a workflow by its ID
	Delete(ctx context.Context, id string) error

	// GetByStatus retrieves workflows by status
	GetByStatus(ctx context.Context, status WorkflowStatus) ([]*Workflow, error)
}

// TaskExecutor defines the interface for task execution
type TaskExecutor interface {
	// Execute runs a task with the given parameters
	Execute(ctx context.Context, task *Task) error

	// Cancel cancels a running task
	Cancel(ctx context.Context, taskID string) error

	// GetStatus returns the current status of a task execution
	GetStatus(ctx context.Context, taskID string) (TaskStatus, error)
}

// WorkflowExecutor defines the interface for workflow execution
type WorkflowExecutor interface {
	// Execute runs a workflow and all its tasks
	Execute(ctx context.Context, workflow *Workflow, tasks []*Task) error

	// Cancel cancels a running workflow
	Cancel(ctx context.Context, workflowID string) error

	// GetStatus returns the current status of a workflow execution
	GetStatus(ctx context.Context, workflowID string) (WorkflowStatus, error)
}

// EventPublisher defines the interface for publishing domain events
type EventPublisher interface {
	// PublishTaskStatusChanged publishes a task status change event
	PublishTaskStatusChanged(ctx context.Context, task *Task) error

	// PublishWorkflowStatusChanged publishes a workflow status change event
	PublishWorkflowStatusChanged(ctx context.Context, workflow *Workflow) error
}

// IDGenerator defines the interface for generating unique IDs
type IDGenerator interface {
	// Generate creates a new unique ID
	Generate() string
}
