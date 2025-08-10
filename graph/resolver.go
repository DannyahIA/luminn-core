package graph

import "automation-hub/internal/application"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	TaskService     *application.TaskService
	WorkflowService *application.WorkflowService
}
