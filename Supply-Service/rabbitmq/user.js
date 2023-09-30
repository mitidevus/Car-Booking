import amqp from "amqplib";


export const sendMessageToQueue = async(exchangeName, routingKey, message) => {
    try {
        const connection = await amqp.connect("amqp://localhost");
        // if (connection) {
        //     console.log("success")
        // }
        const channel = await connection.createChannel();

        // Assert the exchange with the specified name
        await channel.assertExchange(exchangeName, "topic", { durable: false });

        // Publish the message to the exchange with the routing key
        channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)));
        console.log("Send to trip complete")
            // Close the connection after a timeout
        setTimeout(() => connection.close(), 10000);
    } catch (error) {
        console.error("Error sending message:", error);
    }
};
// sendMessageToQueue("trip", "create", "64d5f3a6ea89f36d7573af07")