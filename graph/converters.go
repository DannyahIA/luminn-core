package graph

import (
	"automation-hub/graph/model"
	"automation-hub/internal/application"
	"automation-hub/internal/domain"
)

// convertDomainTaskToGraphQL converts a domain Task to GraphQL model
func convertDomainTaskToGraphQL(task *domain.Task) *model.Task {
	if task == nil {
		return nil
	}

	var description *string
	if task.Description != "" {
		description = &task.Description
	}

	if task.ExecutedAt != nil {
	}

	parameters := make([]*model.Parameter, len(task.Parameters))
	for i, param := range task.Parameters {
		parameters[i] = &model.Parameter{
			Key:   param.Key,
			Value: param.Value,
			Type:  model.ParameterType(param.Type),
		}
	}

	return &model.Task{
		ID:          task.ID,
		Name:        task.Name,
		Description: description,
		Status:      model.TaskStatus(task.Status),
		CreatedAt:   task.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		// Os campos UpdatedAt, ExecutedAt e Parameters não existem em model.Task
	}
}

// convertDomainWorkflowToGraphQL converts a domain Workflow to GraphQL model
func convertDomainWorkflowToGraphQL(workflow *domain.Workflow, tasks []*domain.Task) *model.Workflow {
	if workflow == nil {
		return nil
	}

	var description *string
	if workflow.Description != "" {
		description = &workflow.Description
	}

	graphqlTasks := make([]*model.Task, len(tasks))
	for i, task := range tasks {
		graphqlTasks[i] = convertDomainTaskToGraphQL(task)
	}

	return &model.Workflow{
		ID:          workflow.ID,
		Name:        workflow.Name,
		Description: description,
		Tasks:       graphqlTasks,
		Status:      model.WorkflowStatus(workflow.Status),
		CreatedAt:   workflow.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   workflow.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// convertGraphQLCreateTaskInputToApplication converts GraphQL input to application input
func convertGraphQLCreateTaskInputToApplication(input model.CreateTaskInput) application.CreateTaskInput {
	description := ""
	if input.Description != nil {
		description = *input.Description
	}

	parameters := make([]application.ParameterInput, 0)
	if input.Parameters != nil {
		parameters = make([]application.ParameterInput, len(input.Parameters))
		for i, param := range input.Parameters {
			parameters[i] = application.ParameterInput{
				Key:   param.Key,
				Value: param.Value,
				Type:  domain.ParameterType(param.Type),
			}
		}
	}

	return application.CreateTaskInput{
		Name:        input.Name,
		Description: description,
		Parameters:  parameters,
	}
}

// convertGraphQLUpdateTaskInputToApplication converts GraphQL update input to application input
func convertGraphQLUpdateTaskInputToApplication(input model.UpdateTaskInput) application.UpdateTaskInput {
	var status *domain.TaskStatus
	if input.Status != nil {
		domainStatus := domain.TaskStatus(*input.Status)
		status = &domainStatus
	}

	parameters := make([]application.ParameterInput, 0)
	if input.Parameters != nil {
		parameters = make([]application.ParameterInput, len(input.Parameters))
		for i, param := range input.Parameters {
			parameters[i] = application.ParameterInput{
				Key:   param.Key,
				Value: param.Value,
				Type:  domain.ParameterType(param.Type),
			}
		}
	}

	return application.UpdateTaskInput{
		ID:          input.ID,
		Name:        input.Name,
		Description: input.Description,
		Status:      status,
		Parameters:  parameters,
	}
}

// convertGraphQLCreateWorkflowInputToApplication converts GraphQL input to application input
func convertGraphQLCreateWorkflowInputToApplication(input model.CreateWorkflowInput) application.CreateWorkflowInput {
	description := ""
	if input.Description != nil {
		description = *input.Description
	}

	return application.CreateWorkflowInput{
		Name:        input.Name,
		Description: description,
		TaskIDs:     input.TaskIds,
	}
}
