package api

import (
	"context"
	"demand-service/config"
	customerApi "demand-service/internal/api/customer"
	"demand-service/internal/helper"
	mongoRepository "demand-service/internal/repository/mongo"
	"demand-service/internal/storage"
	"demand-service/internal/usecase"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	httpServer *http.Server
	config     *config.Config
	router     *gin.Engine
	routerV1   *gin.RouterGroup
}

func NewServer(ctx context.Context, config *config.Config) (*Server, error) {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(helper.SetupLog())
	// Set up CORS middleware with custom configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = config.Domains
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	router.Use(func(ctx *gin.Context) {
		log.Println("===========================================")
		log.Println("X-Real-IP", ctx.Request.Header.Get("X-Real-IP"))
		log.Println("X-Forwarded-For", ctx.Request.Header.Get("X-Forwarded-For"))
		log.Println("User-Agent", ctx.Request.Header.Get("User-Agent"))
		log.Println("===========================================")
		ctx.Next()
	})

	routerV1 := router.Group("/v1")

	s := &Server{
		router:   router,
		config:   config,
		routerV1: routerV1,
	}

	return s, nil
}

func (s *Server) Register(ctx context.Context) error {
	// TODO: initial storage
	mongo_store := storage.InitStorage(ctx, s.config)

	mongoRepo := mongoRepository.InitialRepository(ctx, mongo_store)

	usecase, err := usecase.InitUseCase(ctx, s.config, mongoRepo)
	if err != nil {
		return err
	}

	s.registerGin(ctx, usecase)
	return nil
}

func (s *Server) registerGin(ctx context.Context, usecase *usecase.Usecase) {
	// TODO: register admin api
	// adminRouter := adminApi.NewAdminApi(ctx, s.config, s.routerV1, usecase)
	// adminRouter.SetupRouter()

	// TODO: register user api
	customerRouter := customerApi.NewCustomerApi(ctx, s.config, s.routerV1, usecase)
	customerRouter.SetupRouter()
}

func (s *Server) Serve() error {

	// gin
	address := fmt.Sprintf(":%d", s.config.HTTPAddress)

	s.httpServer = &http.Server{
		Handler: s.router,
		Addr:    address,
	}

	log.Println("Start server at port: ", s.config.HTTPAddress)
	return s.httpServer.ListenAndServe()
}
