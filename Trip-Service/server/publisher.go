package main

import (
	"Trip-Service/internal/dto"
	"Trip-Service/internal/helper/objectID"
	"encoding/json"
	"fmt"

	"github.com/streadway/amqp"
)

func main() {
	fmt.Println("Go RabbitMQ Tutorial")
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		fmt.Println("Failed Initializing Broker Connection")
		panic(err)
	}

	// Let's start by opening a channel to our RabbitMQ instance
	// over the connection we have already established
	ch, err := conn.Channel()
	if err != nil {
		fmt.Println(err)
	}
	defer ch.Close()

	// with this channel open, we can then start to interact
	// with the instance and declare Queues that we can publish and
	// subscribe to
	// q, err := ch.QueueDeclare(
	// 	"create_trip",
	// 	false,
	// 	false,
	// 	false,
	// 	false,
	// 	nil,
	// )
	// We can print out the status of our Queue here
	// this will information like the amount of messages on
	// the queue
	// fmt.Println(q)
	// Handle any errors if we were unable to create the queue
	// if err != nil {
	// 	fmt.Println(err)
	// }

	req := dto.CreateTripDTO{
		UserID:        "6145a9468e1b9ef6dbff6ac9",
		DriverID:      "6145a9468e1b9ef6dbff6ac9",
		LongitudeFrom: "123.456789",
		Price:         1235,
	}

	reqByte, _ := json.Marshal(req)

	// attempt to publish a message to the queue!
	err = ch.Publish(
		"trip",
		"create",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        reqByte,
		},
	)

	if err != nil {
		fmt.Println(err)
	}

	reqUpdate := dto.TripHistoryDTO{
		TripID: objectID.ReturnObjectID("64d99d338792438a01ee7667"),
		Status: "ON TRIP",
	}

	reqUByte, _ := json.Marshal(reqUpdate)

	// attempt to publish a message to the queue!
	err = ch.Publish(
		"trip",
		"update",
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        reqUByte,
		},
	)

	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Successfully Published Message to Queue")
}
