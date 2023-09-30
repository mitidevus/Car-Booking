package api

import (
	"Trip-Service/config"
	customerApi "Trip-Service/internal/api/customer"
	"Trip-Service/internal/helper"
	mongoRepository "Trip-Service/internal/repository/mongo"
	"Trip-Service/internal/storage"
	"Trip-Service/internal/usecase"
	"Trip-Service/pkg/rabbitmq"
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/streadway/amqp"
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
	corsConfig.AllowOrigins = []string{"*"}
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
	mongo_store, redis_store := storage.InitStorage(ctx, s.config)

	mongoRepo := mongoRepository.InitialRepository(ctx, mongo_store)

	usecase, err := usecase.InitUseCase(ctx, s.config, mongoRepo, redis_store)
	if err != nil {
		return err
	}

	err = s.registerConsumer(usecase)
	if err != nil {
		log.Println(err)
	}

	s.registerGin(ctx, usecase)
	return nil
}

func (s *Server) registerGin(ctx context.Context, usecase *usecase.Usecase) {
	// TODO: register admin api
	// adminRouter := adminApi.NewAdminApi(ctx, s.config, s.routerV1, usecase)
	// adminRouter.SetupRouter()

	//TODO: register user api
	customerRouter := customerApi.NewCustomerApi(ctx, s.config, s.routerV1, usecase)
	customerRouter.SetupRouter()
}

func (s *Server) registerConsumer(u *usecase.Usecase) error {
	//Create Consumer
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672")
	if err != nil {
		log.Println(err)
		return err
	}

	createTripConsumer, err := rabbitmq.NewConsumer(conn, "create_trip", "trip", rabbitmq.NewCreateConsumer(u))
	if err != nil {
		log.Println(err)
		return err
	}

	go func() {
		err := createTripConsumer.Listen([]string{"create"}, "trip")
		if err != nil {
			log.Println(err)
		}
	}()

	updateTripConsumer, err := rabbitmq.NewConsumer(conn, "update_trip", "trip", rabbitmq.NewUpdateConsumer(u))
	if err != nil {
		log.Println(err)
		return err
	}

	go func() {
		err := updateTripConsumer.Listen([]string{"update"}, "trip")
		if err != nil {
			log.Println(err)
		}
	}()

	updateTripByCallCenterConsumer, err := rabbitmq.NewConsumer(conn, "update_trip_call_center", "trip", rabbitmq.NewUpdateTripConsumer(u))
	if err != nil {
		log.Println(err)
		return err
	}

	go func() {
		err := updateTripByCallCenterConsumer.Listen([]string{"update_call_center"}, "trip")
		if err != nil {
			log.Println(err)
		}
	}()

	return nil
}

func (s *Server) Serve() error {

	// gin
	address := fmt.Sprintf(":%d", s.config.HTTPAddress)

	s.httpServer = &http.Server{
		Handler: s.router,
		Addr:    address,
	}

	//go ServeWebsocket()

	log.Println("Start server at port: ", s.config.HTTPAddress)
	return s.httpServer.ListenAndServe()
}
