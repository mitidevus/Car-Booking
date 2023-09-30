package rabbitmq

import (
	"Trip-Service/internal/common"
	"Trip-Service/internal/dto"
	"Trip-Service/internal/usecase"
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/streadway/amqp"
)

// Consumer for receiving AMPQ events
type Consumer struct {
	conn      *amqp.Connection
	queueName string
	IConsumer
}

func (consumer *Consumer) setup(exchangeName string) error {
	channel, err := consumer.conn.Channel()
	if err != nil {
		return err
	}
	return declareExchange(channel, exchangeName)
}

// NewConsumer returns a new Consumer
func NewConsumer(conn *amqp.Connection, queueName string, exchangeName string, iconsumer IConsumer) (Consumer, error) {
	consumer := Consumer{
		conn:      conn,
		queueName: queueName,
		IConsumer: iconsumer,
	}
	err := consumer.setup(exchangeName)
	if err != nil {
		return Consumer{}, err
	}

	return consumer, nil
}

// Listen will listen for all new Queue publications
// and print them to the console.
func (consumer *Consumer) Listen(topics []string, exchangeName string) error {

	ch, err := consumer.conn.Channel()
	if err != nil {
		return fmt.Errorf("cannot create channel %s", err)
	}
	defer ch.Close()

	q, err := declareQueue(ch, consumer.queueName)
	if err != nil {
		return fmt.Errorf("cannot create queue %s", err)
	}

	for _, s := range topics {
		err = ch.QueueBind(
			q.Name,
			s,
			exchangeName,
			false,
			nil,
		)

		if err != nil {
			return fmt.Errorf("cannot bind queue %s", err)
		}
	}

	msgs, err := ch.Consume(q.Name, "", true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("cannot read message %s", err)
	}

	forever := make(chan bool)
	go consumer.HandleMessage(msgs)

	log.Printf("[*] Waiting for message [Exchange, Queue][%s, %s]. To exit press CTRL+C", exchangeName, q.Name)
	<-forever
	return nil
}

type IConsumer interface {
	HandleMessage(msgs <-chan amqp.Delivery)
}

type CreateConsumer struct {
	tripUsecase usecase.TripUsecase
	tripHistory usecase.TripHistoryUsecase
}

func NewCreateConsumer(u *usecase.Usecase) *CreateConsumer {
	return &CreateConsumer{
		tripUsecase: u.TripUsecase,
		tripHistory: u.TripHistoryUsecase,
	}
}

func (c *CreateConsumer) HandleMessage(msgs <-chan amqp.Delivery) {

	for d := range msgs {

		var req dto.CreateTripDTO
		json.Unmarshal(d.Body, &req)

		trip, err := c.tripUsecase.CreateTrip(context.Background(), req)
		if err != nil {
			log.Println(err)
		}

		tripHistory := dto.CreateTripHistoryDTO{
			TripID: trip.ID,
			Status: common.TRIP_STATUS_CREATE,
		}

		_, err = c.tripHistory.CreateTripHistory(context.Background(), tripHistory)
		if err != nil {
			log.Println(err)
		}
	}
}

type UpdateConsumer struct {
	tripUsecase usecase.TripUsecase
	tripHistory usecase.TripHistoryUsecase
}

func NewUpdateConsumer(u *usecase.Usecase) *UpdateConsumer {
	return &UpdateConsumer{
		tripUsecase: u.TripUsecase,
		tripHistory: u.TripHistoryUsecase,
	}
}

func (c *UpdateConsumer) HandleMessage(msgs <-chan amqp.Delivery) {

	for d := range msgs {

		var req dto.CreateTripHistoryDTO
		json.Unmarshal(d.Body, &req)

		_, err := c.tripHistory.CreateTripHistory(context.Background(), req)
		if err != nil {
			log.Println(err)
		}
	}
}

type UpdateTripConsumer struct {
	tripUsecase usecase.TripUsecase
	tripHistory usecase.TripHistoryUsecase
}

func NewUpdateTripConsumer(u *usecase.Usecase) *UpdateTripConsumer {
	return &UpdateTripConsumer{
		tripUsecase: u.TripUsecase,
		tripHistory: u.TripHistoryUsecase,
	}
}

func (c *UpdateTripConsumer) HandleMessage(msgs <-chan amqp.Delivery) {

	for d := range msgs {

		var req dto.TripDTO
		json.Unmarshal(d.Body, &req)

		err := c.tripUsecase.UpdateTrip(context.Background(), req)
		if err != nil {
			log.Println(err)
		}
	}
}
