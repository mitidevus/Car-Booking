import amqp from "amqplib";

const QUEUE_NAME = "driverToUser";



export const receiveDriverInfoFromQueue = async(exchangeName, routingKey) => {
    return new Promise(async(resolve, reject) => {
        try {
            const connection = await amqp.connect('amqp://localhost');
            const channel = await connection.createChannel();

            // Assert the exchange and queue with the specified name
            await channel.assertExchange(exchangeName, "topic", { durable: true });
            const queueResult = await channel.assertQueue("", { exclusive: true });
            await channel.bindQueue(queueResult.queue, exchangeName, routingKey);
            const receivedMessages = [];
            channel.consume(queueResult.queue, async(msg) => {
                if (msg) {
                    console.log("Data recieved and process")
                    const content = msg.content.toString();
                    channel.ack(msg);
                    console.log(JSON.stringify(content))
                } else {
                    console.log('Nothing');
                }
            });

            // After a certain amount of time or based on some condition, resolve the promise with receivedMessages
            setTimeout(() => {
                connection.close();
                resolve(receivedMessages);
            }, 1000); // Close the connection after 10 seconds (adjust as needed)
        } catch (error) {
            console.error('Error receiving driver info:', error);
            reject(error);
        }
    });
};


// receiveDriverInfoFromQueue("trip", "create")



// Call the function to start receiving driver info
// receiveDriverInfoFromQueue();