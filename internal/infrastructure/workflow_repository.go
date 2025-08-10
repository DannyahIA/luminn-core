package infrastructure

import (
	"context"
	"fmt"
	"sync"

	"automation-hub/internal/domain"
)

// InMemoryWorkflowRepository is an in-memory implementation of WorkflowRepository
type InMemoryWorkflowRepository struct {
	workflows map[string]*domain.Workflow
	mutex     sync.RWMutex
}

// NewInMemoryWorkflowRepository creates a new in-memory workflow repository
func NewInMemoryWorkflowRepository() *InMemoryWorkflowRepository {
	return &InMemoryWorkflowRepository{
		workflows: make(map[string]*domain.Workflow),
	}
}

// Create stores a new workflow in memory
func (r *InMemoryWorkflowRepository) Create(ctx context.Context, workflow *domain.Workflow) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.workflows[workflow.ID]; exists {
		return fmt.Errorf("workflow with ID %s already exists", workflow.ID)
	}

	// Create a copy to avoid external modifications
	workflowCopy := *workflow
	// Copy task IDs slice
	workflowCopy.TaskIDs = make([]string, len(workflow.TaskIDs))
	copy(workflowCopy.TaskIDs, workflow.TaskIDs)

	r.workflows[workflow.ID] = &workflowCopy
	return nil
}

// GetByID retrieves a workflow by its ID
func (r *InMemoryWorkflowRepository) GetByID(ctx context.Context, id string) (*domain.Workflow, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	workflow, exists := r.workflows[id]
	if !exists {
		return nil, fmt.Errorf("workflow with ID %s not found", id)
	}

	// Return a copy to avoid external modifications
	workflowCopy := *workflow
	// Copy task IDs slice
	workflowCopy.TaskIDs = make([]string, len(workflow.TaskIDs))
	copy(workflowCopy.TaskIDs, workflow.TaskIDs)

	return &workflowCopy, nil
}

// GetAll retrieves all workflows
func (r *InMemoryWorkflowRepository) GetAll(ctx context.Context) ([]*domain.Workflow, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	workflows := make([]*domain.Workflow, 0, len(r.workflows))
	for _, workflow := range r.workflows {
		// Create copies to avoid external modifications
		workflowCopy := *workflow
		// Copy task IDs slice
		workflowCopy.TaskIDs = make([]string, len(workflow.TaskIDs))
		copy(workflowCopy.TaskIDs, workflow.TaskIDs)

		workflows = append(workflows, &workflowCopy)
	}

	return workflows, nil
}

// Update updates an existing workflow
func (r *InMemoryWorkflowRepository) Update(ctx context.Context, workflow *domain.Workflow) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.workflows[workflow.ID]; !exists {
		return fmt.Errorf("workflow with ID %s not found", workflow.ID)
	}

	// Create a copy to avoid external modifications
	workflowCopy := *workflow
	// Copy task IDs slice
	workflowCopy.TaskIDs = make([]string, len(workflow.TaskIDs))
	copy(workflowCopy.TaskIDs, workflow.TaskIDs)

	r.workflows[workflow.ID] = &workflowCopy
	return nil
}

// Delete removes a workflow by its ID
func (r *InMemoryWorkflowRepository) Delete(ctx context.Context, id string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.workflows[id]; !exists {
		return fmt.Errorf("workflow with ID %s not found", id)
	}

	delete(r.workflows, id)
	return nil
}

// GetByStatus retrieves workflows by status
func (r *InMemoryWorkflowRepository) GetByStatus(ctx context.Context, status domain.WorkflowStatus) ([]*domain.Workflow, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	var workflows []*domain.Workflow
	for _, workflow := range r.workflows {
		if workflow.Status == status {
			// Create a copy to avoid external modifications
			workflowCopy := *workflow
			// Copy task IDs slice
			workflowCopy.TaskIDs = make([]string, len(workflow.TaskIDs))
			copy(workflowCopy.TaskIDs, workflow.TaskIDs)

			workflows = append(workflows, &workflowCopy)
		}
	}

	return workflows, nil
}
