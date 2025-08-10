package graph_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"automation-hub/graph"
	"automation-hub/internal/application"
	"automation-hub/internal/infrastructure"
)

// GraphQLRequest represents a GraphQL request
type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables,omitempty"`
}

// GraphQLResponse represents a GraphQL response
type GraphQLResponse struct {
	Data   map[string]interface{} `json:"data"`
	Errors []GraphQLError         `json:"errors,omitempty"`
}

// GraphQLError represents a GraphQL error
type GraphQLError struct {
	Message string        `json:"message"`
	Path    []interface{} `json:"path,omitempty"`
}

// setupTestServer creates a test server with in-memory dependencies
func setupTestServer() *httptest.Server {
	// Setup dependencies
	taskRepo := infrastructure.NewInMemoryTaskRepository()
	workflowRepo := infrastructure.NewInMemoryWorkflowRepository()
	taskExecutor := infrastructure.NewSimpleTaskExecutor()
	workflowExecutor := infrastructure.NewSimpleWorkflowExecutor(taskExecutor)
	eventPublisher := infrastructure.NewLogEventPublisher()
	idGenerator := infrastructure.NewUUIDGenerator()

	// Setup services
	taskService := application.NewTaskService(
		taskRepo,
		taskExecutor,
		eventPublisher,
		idGenerator,
	)

	workflowService := application.NewWorkflowService(
		workflowRepo,
		taskRepo,
		workflowExecutor,
		eventPublisher,
		idGenerator,
	)

	// Setup GraphQL server
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{
			TaskService:     taskService,
			WorkflowService: workflowService,
		},
	}))

	return httptest.NewServer(srv)
}

// executeGraphQLRequest executes a GraphQL request and returns the response
func executeGraphQLRequest(server *httptest.Server, req GraphQLRequest) (*GraphQLResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(server.URL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var graphqlResp GraphQLResponse
	err = json.NewDecoder(resp.Body).Decode(&graphqlResp)
	if err != nil {
		return nil, err
	}

	return &graphqlResp, nil
}

func TestHealthQuery(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	req := GraphQLRequest{
		Query: `query { health }`,
	}

	resp, err := executeGraphQLRequest(server, req)
	require.NoError(t, err)
	require.Empty(t, resp.Errors)

	health := resp.Data["health"].(string)
	assert.Equal(t, "OK", health)
}

func TestCreateTask(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	req := GraphQLRequest{
		Query: `
			mutation CreateTask($input: CreateTaskInput!) {
				createTask(input: $input) {
					id
					name
					description
					status
					parameters {
						key
						value
						type
					}
				}
			}
		`,
		Variables: map[string]interface{}{
			"input": map[string]interface{}{
				"name":        "Test Task",
				"description": "A test task",
				"parameters": []map[string]interface{}{
					{
						"key":   "param1",
						"value": "value1",
						"type":  "STRING",
					},
				},
			},
		},
	}

	resp, err := executeGraphQLRequest(server, req)
	require.NoError(t, err)
	require.Empty(t, resp.Errors)

	task := resp.Data["createTask"].(map[string]interface{})
	assert.NotEmpty(t, task["id"])
	assert.Equal(t, "Test Task", task["name"])
	assert.Equal(t, "A test task", task["description"])
	assert.Equal(t, "PENDING", task["status"])

	parameters := task["parameters"].([]interface{})
	assert.Len(t, parameters, 1)

	param := parameters[0].(map[string]interface{})
	assert.Equal(t, "param1", param["key"])
	assert.Equal(t, "value1", param["value"])
	assert.Equal(t, "STRING", param["type"])
}
