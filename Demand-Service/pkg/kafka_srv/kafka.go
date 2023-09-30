package kafka_srv

import (
	"demand-service/config"
	"log"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func NewKafkaProducer(c *config.Config) (*kafka.Producer, error) {
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": c.Kafka.Server})
	return producer, err
}

func NewKafkaConsumer(c *config.Config, group string) (*kafka.Consumer, error) {
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  c.Kafka.Server,
		"group.id":           group,
		"auto.offset.reset":  "latest",
		"enable.auto.commit": false,
	})
	return consumer, err
}

func NewKafkaConsumerAuditLog(c *config.Config, group string) (*kafka.Consumer, error) {
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  c.Kafka.AuditLogServer,
		"group.id":           group,
		"auto.offset.reset":  kafka.OffsetBeginning.String(),
		"enable.auto.commit": false,
	})
	return consumer, err
}

func SendMessage(producer *kafka.Producer, topic string, message string) {
	// Produce messages to topic (asynchronously)
	err := producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          []byte(message),
	}, nil)

	if err != nil {
		log.Default().Printf("SendMessage.err: %v", err)
	} else {
		log.Default().Printf("Sent message: %v --- topic: %v", message, topic)
	}

}

func ConsumerHandler(consumer *kafka.Consumer, fn func(ev kafka.Event), channel chan *kafka.Consumer) {
	defer func() {
		if r := recover(); r != nil {
			channel <- consumer
		}
	}()
	defer consumer.Close()
	run := true

	for run {
		select {
		default:
			ev := consumer.Poll(100)
			if ev == nil {
				continue
			}
			fn(ev)
		}
	}
}
