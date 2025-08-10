#!/bin/bash

# Automation Hub Core - Example API Usage Script
# This script demonstrates how to interact with the GraphQL API

# Configuration
API_URL="http://localhost:8080/query"
CONTENT_TYPE="application/json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_result() {
    echo -e "${YELLOW}[RESULT]${NC} $1"
}

# Function to execute GraphQL query
execute_query() {
    local query="$1"
    local variables="$2"
    
    if [ -n "$variables" ]; then
        payload="{\"query\": \"$query\", \"variables\": $variables}"
    else
        payload="{\"query\": \"$query\"}"
    fi
    
    curl -s -X POST "$API_URL" \
        -H "Content-Type: $CONTENT_TYPE" \
        -d "$payload" | jq '.'
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_error "jq is required but not installed. Please install jq first."
    exit 1
fi

# Check if the API is running
print_step "Checking API health..."
health_response=$(execute_query "query { health }")
health_status=$(echo "$health_response" | jq -r '.data.health // "ERROR"')

if [ "$health_status" = "OK" ]; then
    print_status "API is healthy!"
else
    print_error "API is not responding correctly"
    echo "$health_response"
    exit 1
fi

# Example 1: Create a task
print_step "Creating a new task..."
create_task_query='
mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
        id
        name
        description
        status
        createdAt
        parameters {
            key
            value
            type
        }
    }
}'

create_task_variables='{
    "input": {
        "name": "Example Task",
        "description": "This is an example task created via API",
        "parameters": [
            {
                "key": "environment",
                "value": "development",
                "type": "STRING"
            },
            {
                "key": "timeout",
                "value": "300",
                "type": "NUMBER"
            },
            {
                "key": "enabled",
                "value": "true",
                "type": "BOOLEAN"
            }
        ]
    }
}'

task_response=$(execute_query "$create_task_query" "$create_task_variables")
task_id=$(echo "$task_response" | jq -r '.data.createTask.id')

if [ "$task_id" != "null" ] && [ -n "$task_id" ]; then
    print_status "Task created successfully with ID: $task_id"
    print_result "$task_response"
else
    print_error "Failed to create task"
    echo "$task_response"
    exit 1
fi

# Example 2: Get all tasks
print_step "Retrieving all tasks..."
get_tasks_query='
query {
    tasks {
        id
        name
        description
        status
        createdAt
        updatedAt
    }
}'

tasks_response=$(execute_query "$get_tasks_query")
task_count=$(echo "$tasks_response" | jq '.data.tasks | length')

print_status "Found $task_count task(s)"
print_result "$tasks_response"

# Example 3: Get specific task
print_step "Retrieving specific task..."
get_task_query='
query GetTask($id: ID!) {
    task(id: $id) {
        id
        name
        description
        status
        createdAt
        updatedAt
        parameters {
            key
            value
            type
        }
    }
}'

get_task_variables="{\"id\": \"$task_id\"}"
task_detail_response=$(execute_query "$get_task_query" "$get_task_variables")

print_status "Task details retrieved"
print_result "$task_detail_response"

# Example 4: Execute the task
print_step "Executing the task..."
execute_task_query='
mutation ExecuteTask($id: ID!) {
    executeTask(id: $id) {
        id
        name
        status
        executedAt
    }
}'

execute_task_variables="{\"id\": \"$task_id\"}"
execute_response=$(execute_query "$execute_task_query" "$execute_task_variables")
execution_status=$(echo "$execute_response" | jq -r '.data.executeTask.status')

if [ "$execution_status" = "COMPLETED" ] || [ "$execution_status" = "RUNNING" ]; then
    print_status "Task execution initiated. Status: $execution_status"
    print_result "$execute_response"
else
    print_error "Task execution failed"
    echo "$execute_response"
fi

# Example 5: Create a workflow
print_step "Creating a workflow..."
create_workflow_query='
mutation CreateWorkflow($input: CreateWorkflowInput!) {
    createWorkflow(input: $input) {
        id
        name
        description
        status
        createdAt
        tasks {
            id
            name
            status
        }
    }
}'

create_workflow_variables="{
    \"input\": {
        \"name\": \"Example Workflow\",
        \"description\": \"A workflow containing our example task\",
        \"taskIds\": [\"$task_id\"]
    }
}"

workflow_response=$(execute_query "$create_workflow_query" "$create_workflow_variables")
workflow_id=$(echo "$workflow_response" | jq -r '.data.createWorkflow.id')

if [ "$workflow_id" != "null" ] && [ -n "$workflow_id" ]; then
    print_status "Workflow created successfully with ID: $workflow_id"
    print_result "$workflow_response"
else
    print_error "Failed to create workflow"
    echo "$workflow_response"
fi

# Example 6: Get all workflows
print_step "Retrieving all workflows..."
get_workflows_query='
query {
    workflows {
        id
        name
        description
        status
        createdAt
        tasks {
            id
            name
            status
        }
    }
}'

workflows_response=$(execute_query "$get_workflows_query")
workflow_count=$(echo "$workflows_response" | jq '.data.workflows | length')

print_status "Found $workflow_count workflow(s)"
print_result "$workflows_response"

# Example 7: Update task
print_step "Updating the task..."
update_task_query='
mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
        id
        name
        description
        status
        updatedAt
        parameters {
            key
            value
            type
        }
    }
}'

update_task_variables="{
    \"input\": {
        \"id\": \"$task_id\",
        \"name\": \"Updated Example Task\",
        \"description\": \"This task has been updated via API\",
        \"parameters\": [
            {
                \"key\": \"environment\",
                \"value\": \"production\",
                \"type\": \"STRING\"
            },
            {
                \"key\": \"timeout\",
                \"value\": \"600\",
                \"type\": \"NUMBER\"
            }
        ]
    }
}"

update_response=$(execute_query "$update_task_query" "$update_task_variables")
updated_name=$(echo "$update_response" | jq -r '.data.updateTask.name')

if [ "$updated_name" != "null" ]; then
    print_status "Task updated successfully"
    print_result "$update_response"
else
    print_error "Failed to update task"
    echo "$update_response"
fi

print_step "Example script completed successfully!"
print_status "You can now check the GraphQL playground at http://localhost:8080 for more interactive exploration."
