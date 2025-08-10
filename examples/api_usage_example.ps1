# Automation Hub Core - PowerShell API Usage Example
# This script demonstrates how to interact with the GraphQL API using PowerShell

param(
    [string]$ApiUrl = "http://localhost:8080/query",
    [switch]$Verbose
)

# Configuration
$ContentType = "application/json"

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Blue
}

function Write-Result {
    param([string]$Message)
    Write-Host "[RESULT] $Message" -ForegroundColor Yellow
}

# Function to execute GraphQL query
function Invoke-GraphQLQuery {
    param(
        [string]$Query,
        [hashtable]$Variables = $null
    )
    
    $body = @{
        query = $Query
    }
    
    if ($Variables) {
        $body.variables = $Variables
    }
    
    $jsonBody = $body | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $ApiUrl -Method POST -ContentType $ContentType -Body $jsonBody
        return $response
    }
    catch {
        Write-Error "API request failed: $($_.Exception.Message)"
        return $null
    }
}

# Check API health
Write-Step "Checking API health..."
$healthQuery = "query { health }"
$healthResponse = Invoke-GraphQLQuery -Query $healthQuery

if ($healthResponse -and $healthResponse.data.health -eq "OK") {
    Write-Status "API is healthy!"
}
else {
    Write-Error "API is not responding correctly"
    if ($healthResponse.errors) {
        Write-Host ($healthResponse.errors | ConvertTo-Json -Depth 3)
    }
    exit 1
}

# Example 1: Create a task
Write-Step "Creating a new task..."
$createTaskQuery = @"
mutation CreateTask(`$input: CreateTaskInput!) {
    createTask(input: `$input) {
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
}
"@

$createTaskVariables = @{
    input = @{
        name = "PowerShell Example Task"
        description = "This is an example task created via PowerShell"
        parameters = @(
            @{
                key = "environment"
                value = "development"
                type = "STRING"
            },
            @{
                key = "timeout"
                value = "300"
                type = "NUMBER"
            },
            @{
                key = "enabled"
                value = "true"
                type = "BOOLEAN"
            }
        )
    }
}

$taskResponse = Invoke-GraphQLQuery -Query $createTaskQuery -Variables $createTaskVariables

if ($taskResponse -and $taskResponse.data.createTask.id) {
    $taskId = $taskResponse.data.createTask.id
    Write-Status "Task created successfully with ID: $taskId"
    if ($Verbose) {
        Write-Result ($taskResponse.data.createTask | ConvertTo-Json -Depth 3)
    }
}
else {
    Write-Error "Failed to create task"
    if ($taskResponse.errors) {
        Write-Host ($taskResponse.errors | ConvertTo-Json -Depth 3)
    }
    exit 1
}

# Example 2: Get all tasks
Write-Step "Retrieving all tasks..."
$getTasksQuery = @"
query {
    tasks {
        id
        name
        description
        status
        createdAt
        updatedAt
    }
}
"@

$tasksResponse = Invoke-GraphQLQuery -Query $getTasksQuery

if ($tasksResponse -and $tasksResponse.data.tasks) {
    $taskCount = $tasksResponse.data.tasks.Length
    Write-Status "Found $taskCount task(s)"
    if ($Verbose) {
        Write-Result ($tasksResponse.data.tasks | ConvertTo-Json -Depth 3)
    }
}

# Example 3: Get specific task
Write-Step "Retrieving specific task..."
$getTaskQuery = @"
query GetTask(`$id: ID!) {
    task(id: `$id) {
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
}
"@

$getTaskVariables = @{ id = $taskId }
$taskDetailResponse = Invoke-GraphQLQuery -Query $getTaskQuery -Variables $getTaskVariables

if ($taskDetailResponse -and $taskDetailResponse.data.task) {
    Write-Status "Task details retrieved"
    if ($Verbose) {
        Write-Result ($taskDetailResponse.data.task | ConvertTo-Json -Depth 3)
    }
}

# Example 4: Execute the task
Write-Step "Executing the task..."
$executeTaskQuery = @"
mutation ExecuteTask(`$id: ID!) {
    executeTask(id: `$id) {
        id
        name
        status
        executedAt
    }
}
"@

$executeTaskVariables = @{ id = $taskId }
$executeResponse = Invoke-GraphQLQuery -Query $executeTaskQuery -Variables $executeTaskVariables

if ($executeResponse -and $executeResponse.data.executeTask) {
    $executionStatus = $executeResponse.data.executeTask.status
    Write-Status "Task execution initiated. Status: $executionStatus"
    if ($Verbose) {
        Write-Result ($executeResponse.data.executeTask | ConvertTo-Json -Depth 3)
    }
}
else {
    Write-Error "Task execution failed"
    if ($executeResponse.errors) {
        Write-Host ($executeResponse.errors | ConvertTo-Json -Depth 3)
    }
}

# Example 5: Create a workflow
Write-Step "Creating a workflow..."
$createWorkflowQuery = @"
mutation CreateWorkflow(`$input: CreateWorkflowInput!) {
    createWorkflow(input: `$input) {
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
}
"@

$createWorkflowVariables = @{
    input = @{
        name = "PowerShell Example Workflow"
        description = "A workflow containing our example task"
        taskIds = @($taskId)
    }
}

$workflowResponse = Invoke-GraphQLQuery -Query $createWorkflowQuery -Variables $createWorkflowVariables

if ($workflowResponse -and $workflowResponse.data.createWorkflow.id) {
    $workflowId = $workflowResponse.data.createWorkflow.id
    Write-Status "Workflow created successfully with ID: $workflowId"
    if ($Verbose) {
        Write-Result ($workflowResponse.data.createWorkflow | ConvertTo-Json -Depth 3)
    }
}
else {
    Write-Error "Failed to create workflow"
    if ($workflowResponse.errors) {
        Write-Host ($workflowResponse.errors | ConvertTo-Json -Depth 3)
    }
}

# Example 6: Get all workflows
Write-Step "Retrieving all workflows..."
$getWorkflowsQuery = @"
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
}
"@

$workflowsResponse = Invoke-GraphQLQuery -Query $getWorkflowsQuery

if ($workflowsResponse -and $workflowsResponse.data.workflows) {
    $workflowCount = $workflowsResponse.data.workflows.Length
    Write-Status "Found $workflowCount workflow(s)"
    if ($Verbose) {
        Write-Result ($workflowsResponse.data.workflows | ConvertTo-Json -Depth 3)
    }
}

# Example 7: Update task
Write-Step "Updating the task..."
$updateTaskQuery = @"
mutation UpdateTask(`$input: UpdateTaskInput!) {
    updateTask(input: `$input) {
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
}
"@

$updateTaskVariables = @{
    input = @{
        id = $taskId
        name = "Updated PowerShell Example Task"
        description = "This task has been updated via PowerShell"
        parameters = @(
            @{
                key = "environment"
                value = "production"
                type = "STRING"
            },
            @{
                key = "timeout"
                value = "600"
                type = "NUMBER"
            }
        )
    }
}

$updateResponse = Invoke-GraphQLQuery -Query $updateTaskQuery -Variables $updateTaskVariables

if ($updateResponse -and $updateResponse.data.updateTask) {
    Write-Status "Task updated successfully"
    if ($Verbose) {
        Write-Result ($updateResponse.data.updateTask | ConvertTo-Json -Depth 3)
    }
}
else {
    Write-Error "Failed to update task"
    if ($updateResponse.errors) {
        Write-Host ($updateResponse.errors | ConvertTo-Json -Depth 3)
    }
}

Write-Step "PowerShell example script completed successfully!"
Write-Status "You can now check the GraphQL playground at http://localhost:8080 for more interactive exploration."
Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Cyan
Write-Host "  .\api_usage_example.ps1                    # Run with default settings" -ForegroundColor Gray
Write-Host "  .\api_usage_example.ps1 -Verbose           # Run with detailed output" -ForegroundColor Gray
Write-Host "  .\api_usage_example.ps1 -ApiUrl 'http://localhost:9000/query'  # Use different API URL" -ForegroundColor Gray
