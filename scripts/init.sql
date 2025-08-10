-- Automation Hub Database Initialization Script

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT tasks_status_check CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Create task_parameters table
CREATE TABLE IF NOT EXISTS task_parameters (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'STRING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_parameters_type_check CHECK (type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
    UNIQUE(task_id, key)
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT workflows_status_check CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED'))
);

-- Create workflow_tasks table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(workflow_id, task_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_task_parameters_task_id ON task_parameters(task_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow_id ON workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_task_id ON workflow_tasks(task_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO tasks (id, name, description, status) VALUES 
    ('sample-task-1', 'Sample Task 1', 'This is a sample task for testing', 'PENDING'),
    ('sample-task-2', 'Sample Task 2', 'Another sample task', 'COMPLETED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO task_parameters (task_id, key, value, type) VALUES 
    ('sample-task-1', 'param1', 'value1', 'STRING'),
    ('sample-task-1', 'param2', '42', 'NUMBER'),
    ('sample-task-2', 'enabled', 'true', 'BOOLEAN')
ON CONFLICT (task_id, key) DO NOTHING;

INSERT INTO workflows (id, name, description, status) VALUES 
    ('sample-workflow-1', 'Sample Workflow', 'A sample workflow for testing', 'DRAFT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_tasks (workflow_id, task_id, order_index) VALUES 
    ('sample-workflow-1', 'sample-task-1', 1),
    ('sample-workflow-1', 'sample-task-2', 2)
ON CONFLICT (workflow_id, task_id) DO NOTHING;
