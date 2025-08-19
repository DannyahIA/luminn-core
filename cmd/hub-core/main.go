// Package main is the entry point for the Automation Hub Core application
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/sirupsen/logrus"

	"automation-hub/graph"
	"automation-hub/internal/application"
	"automation-hub/internal/config"
	"automation-hub/internal/infrastructure"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Setup logging
	setupLogging(cfg.Logging)

	logrus.Info("Starting Automation Hub Core...")

	// Initialize dependencies
	deps := initializeDependencies()

	// Setup GraphQL server
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{
			TaskService:     deps.TaskService,
			WorkflowService: deps.WorkflowService,
		},
	}))

	// Setup HTTP router
	router := chi.NewRouter()

	// Middleware
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.RequestID)
	router.Use(middleware.Timeout(60 * time.Second))

	// Routes
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	// Health check endpoint
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Start server
	serverAddr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	logrus.Infof("Starting HTTP server on %s", serverAddr)
	logrus.Infof("GraphQL playground available at http://%s", serverAddr)

	server := &http.Server{
		Addr:         serverAddr,
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
	}

	// Start server in a goroutine
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down server...")

	// Create a deadline for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		logrus.Fatalf("Server forced to shutdown: %v", err)
	}

	logrus.Info("Server exited")
}

// Dependencies holds all application dependencies
type Dependencies struct {
	TaskService     *application.TaskService
	WorkflowService *application.WorkflowService
	BankRepo        *infrastructure.BankRepository
	UserRepo        *infrastructure.UserRepository
	ProductRepo     *infrastructure.ProductRepository
	TransactionRepo *infrastructure.TransactionRepository
	BankItemRepo    *infrastructure.BankItemRepository
	BankDataRepo    *infrastructure.BankDataRepository
	BankAccountRepo *infrastructure.BankAccountRepository
}

// initializeDependencies initializes all application dependencies
func initializeDependencies() *Dependencies {
	// Infrastructure layer
	taskRepo := infrastructure.NewInMemoryTaskRepository()
	workflowRepo := infrastructure.NewInMemoryWorkflowRepository()
	taskExecutor := infrastructure.NewSimpleTaskExecutor()
	workflowExecutor := infrastructure.NewSimpleWorkflowExecutor(taskExecutor)
	eventPublisher := infrastructure.NewLogEventPublisher()
	idGenerator := infrastructure.NewUUIDGenerator()

	// Application layer
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

	return &Dependencies{
		TaskService:     taskService,
		WorkflowService: workflowService,
	}
}

// setupLogging configures the logging system
func setupLogging(cfg config.LoggingConfig) {
	// Set log level
	level, err := logrus.ParseLevel(cfg.Level)
	if err != nil {
		logrus.Warn("Invalid log level, using info")
		level = logrus.InfoLevel
	}
	logrus.SetLevel(level)

	// Set log format
	if cfg.Format == "json" {
		logrus.SetFormatter(&logrus.JSONFormatter{})
	} else {
		logrus.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}
}
