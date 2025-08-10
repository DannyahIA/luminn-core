package infrastructure

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"automation-hub/internal/domain"
)

// LogEventPublisher is a simple implementation that logs events
type LogEventPublisher struct{}

// NewLogEventPublisher creates a new log event publisher
func NewLogEventPublisher() *LogEventPublisher {
	return &LogEventPublisher{}
}

// PublishTaskStatusChanged publishes a task status change event by logging it
func (p *LogEventPublisher) PublishTaskStatusChanged(ctx context.Context, task *domain.Task) error {
	fmt.Printf("[EVENT] Task status changed - ID: %s, Status: %s, Timestamp: %s\n",
		task.ID, task.Status, time.Now().Format(time.RFC3339))
	return nil
}

// PublishWorkflowStatusChanged publishes a workflow status change event by logging it
func (p *LogEventPublisher) PublishWorkflowStatusChanged(ctx context.Context, workflow *domain.Workflow) error {
	fmt.Printf("[EVENT] Workflow status changed - ID: %s, Status: %s, Timestamp: %s\n",
		workflow.ID, workflow.Status, time.Now().Format(time.RFC3339))
	return nil
}

// UUIDGenerator generates unique IDs using a simple UUID-like approach
type UUIDGenerator struct {
	rng *rand.Rand
}

// NewUUIDGenerator creates a new UUID generator
func NewUUIDGenerator() *UUIDGenerator {
	return &UUIDGenerator{
		rng: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

// Generate creates a new unique ID
func (g *UUIDGenerator) Generate() string {
	// Simple UUID-like generation (not cryptographically secure)
	// Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		g.rng.Uint32(),
		g.rng.Uint32()&0xffff,
		g.rng.Uint32()&0xffff,
		g.rng.Uint32()&0xffff,
		g.rng.Uint64()&0xffffffffffff,
	)
}
