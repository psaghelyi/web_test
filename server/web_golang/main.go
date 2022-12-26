
package main

import (
	"context"
	"log"
	"fmt"
	"math/rand"
	"net/http"
	"os/signal"
	"syscall"
	"time"
	"strconv"

	"github.com/gin-gonic/gin"
)

func main() {
	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Default With the Logger and Recovery middleware already attached
	// use gin.New() if you want to skip middlewares
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello from GoLang - Gin Server")
	})

	router.GET("/wait", func(c *gin.Context) {
		param_ms := c.DefaultQuery("ms", "200")
		wait_ms, _ := strconv.ParseInt(param_ms, 0, 32)
		time.Sleep(time.Duration(rand.Int63n(wait_ms)) * time.Millisecond)
		c.String(http.StatusOK, param_ms)
	})

	router.GET("/relay", func(c *gin.Context) {
		start := time.Now()
		_, err := http.Get("http://echo:8080")
		elapsed := time.Since(start)
		
		if err != nil {
			fmt.Printf("error making http request: %s\n", err)
		}

		c.String(http.StatusOK, elapsed.String())
	})

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	// Initializing the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Listen for the interrupt signal.
	<-ctx.Done()

	// Restore default behavior on the interrupt signal and notify user of shutdown.
	stop()
	log.Println("shutting down gracefully, press Ctrl+C again to force")

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}

	log.Println("Server exiting")
}
