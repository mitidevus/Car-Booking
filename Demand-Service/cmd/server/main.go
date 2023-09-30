package main

import (
	"context"
	"demand-service/config"
	"demand-service/internal/api"
	"demand-service/internal/helper/logger"
	"log"

	"os"
	"sync"

	"go.uber.org/zap"
)

var once sync.Once

func main() {
	// TODO: resolver panic error application
	defer func() {
		if err := recover(); err != nil {
			zap.S().Errorf("Recover when start project err:%s", err)
			os.Exit(0)
		}
	}()

	// TODO: create global application context
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	// TODO: load environment file
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Panic("load  config err", err)
	}

	// TODO: sync once func
	once.Do(func() {
		logger.Newlogger(cfg.Logger)
	})

	// TODO: create server
	s, err := api.NewServer(ctx, cfg)
	if err != nil {
		log.Panic("new server error: ", err)
	}
	err = s.Register(ctx)
	if err != nil {
		log.Default().Panic(err)
	}

	// TODO: start http server
	if err := s.Serve(); err != nil {
		log.Panic("start application error: ", err)
	}
}
