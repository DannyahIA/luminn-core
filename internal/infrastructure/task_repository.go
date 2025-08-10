// Package infrastructure contains the concrete implementations of domain interfaces
package infrastructure

import (
	"context"
	"fmt"
	"sync"

	"automation-hub/internal/domain"
)

// InMemoryTaskRepository is an in-memory implementation of TaskRepository
type InMemoryTaskRepository struct {
	tasks map[string]*domain.Task
	mutex sync.RWMutex
}

// NewInMemoryTaskRepository creates a new in-memory task repository
func NewInMemoryTaskRepository() *InMemoryTaskRepository {
	return &InMemoryTaskRepository{
		tasks: make(map[string]*domain.Task),
	}
}

// Create stores a new task in memory
func (r *InMemoryTaskRepository) Create(ctx context.Context, task *domain.Task) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.tasks[task.ID]; exists {
		return fmt.Errorf("task with ID %s already exists", task.ID)
	}

	// Create a copy to avoid external modifications
	taskCopy := *task
	r.tasks[task.ID] = &taskCopy
	return nil
}

// GetByID retrieves a task by its ID
func (r *InMemoryTaskRepository) GetByID(ctx context.Context, id string) (*domain.Task, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	task, exists := r.tasks[id]
	if !exists {
		return nil, fmt.Errorf("task with ID %s not found", id)
	}

	// Return a copy to avoid external modifications
	taskCopy := *task
	return &taskCopy, nil
}

// GetAll retrieves all tasks
func (r *InMemoryTaskRepository) GetAll(ctx context.Context) ([]*domain.Task, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	tasks := make([]*domain.Task, 0, len(r.tasks))
	for _, task := range r.tasks {
		// Create copies to avoid external modifications
		taskCopy := *task
		tasks = append(tasks, &taskCopy)
	}

	return tasks, nil
}

// Update updates an existing task
func (r *InMemoryTaskRepository) Update(ctx context.Context, task *domain.Task) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.tasks[task.ID]; !exists {
		return fmt.Errorf("task with ID %s not found", task.ID)
	}

	// Create a copy to avoid external modifications
	taskCopy := *task
	r.tasks[task.ID] = &taskCopy
	return nil
}

// Delete removes a task by its ID
func (r *InMemoryTaskRepository) Delete(ctx context.Context, id string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.tasks[id]; !exists {
		return fmt.Errorf("task with ID %s not found", id)
	}

	delete(r.tasks, id)
	return nil
}

// GetByStatus retrieves tasks by status
func (r *InMemoryTaskRepository) GetByStatus(ctx context.Context, status domain.TaskStatus) ([]*domain.Task, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	var tasks []*domain.Task
	for _, task := range r.tasks {
		if task.Status == status {
			// Create a copy to avoid external modifications
			taskCopy := *task
			tasks = append(tasks, &taskCopy)
		}
	}

	return tasks, nil
}
