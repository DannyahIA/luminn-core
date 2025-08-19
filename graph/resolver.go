package graph

import (
	// Ensure this path is correct and contains User type
	"automation-hub/internal/application"
	"automation-hub/internal/infrastructure"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	TaskService     *application.TaskService
	WorkflowService *application.WorkflowService
	UserRepo        *infrastructure.UserRepository
	BankRepo        *infrastructure.BankRepository
	BankAccountRepo *infrastructure.BankAccountRepository
	TransactionRepo *infrastructure.TransactionRepository
	BankDataRepo    *infrastructure.BankDataRepository
	BankItemRepo    *infrastructure.BankItemRepository
}
