import amqp from 'amqplib';
import { saveCallCenter } from './callcenter.service.js';
import { generateAddress } from './location.service.js';
import { PluginManager } from '../plugins/index.js';

// export const sendToQueue = async (queueName, message) => {
//     try {
//         // Connect to RabbitMQ server
//         const connection = await amqp.connect(process.env.RABBITMQ_URL);

//         // Create a channel
//         const channel = await connection.createChannel();

//         // Assert a queue
//         await channel.assertQueue(queueName);

//         // Send message to queue
//         await channel.sendToQueue(
//             queueName,
//             Buffer.from(JSON.stringify(message))
//         );

//         console.log('Message sent to queue:', message);
//         await channel.close();
//         await connection.close();
//     } catch (error) {
//         console.error('Error sending message to queue:', error);
//     }
// };

// // S2
// export const consumeFromQueue = async (queueName) => {
//     try {
//         // Connect to RabbitMQ server
//         const connection = await amqp.connect(process.env.RABBITMQ_URL);

//         // Create a channel
//         const channel = await connection.createChannel();

//         // Assert a queue
//         await channel.assertQueue(queueName);

//         // Consume from queue
//         await channel.consume(queueName, async (message) => {
//             const data = JSON.parse(message.content.toString());
//             console.log(`Received message from ${queueName}`);

//             // Generate address
//             const address = generateAddress(
//                 data?.homeNo,
//                 data?.street,
//                 data?.ward,
//                 data?.district
//             );

//             // Get location from address
//             const location = await getLocationFromAddress(address);

//             const callCenter = await saveCallCenter({
//                 ...data,
//                 pickupAddress: address,
//                 lat: location?.lat,
//                 long: location?.lng
//             });
//             console.log('Call center saved to database:', callCenter);

//             channel.ack(message);
//         });

//         console.log('Consumer started');
//     } catch (error) {
//         console.error('Error consuming from queue:', error);
//     }
// };

export const sendToQueue = async (
    exchangeName,
    queueName,
    routingKey,
    message
) => {
    try {
        // Connect to RabbitMQ server
        const connection = await amqp.connect(process.env.RABBITMQ_URL);

        // Create a channel
        const channel = await connection.createChannel();

        // Assert an exchange
        await channel.assertExchange(exchangeName, 'topic', { durable: true });

        // Assert a queue
        await channel.assertQueue(queueName);

        // Bind queue to exchange
        await channel.bindQueue(queueName, exchangeName, routingKey);

        // Send message to exchange
        await channel.publish(
            exchangeName,
            routingKey,
            Buffer.from(JSON.stringify(message))
        );

        console.log('Message sent to exchange:', message);
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message to queue:', error);
    }
};

// S2
export const consumeFromQueue = async (exchangeName, queueName, routingKey) => {
    try {
        // Connect to RabbitMQ server
        const connection = await amqp.connect(process.env.RABBITMQ_URL);

        // Create a channel
        const channel = await connection.createChannel();

        // Assert a direct exchange
        await channel.assertExchange(exchangeName, 'topic', { durable: true });

        // Assert a queue
        await channel.assertQueue(queueName);

        // Bind queue to exchange
        await channel.bindQueue(queueName, exchangeName, routingKey);

        // Consume from queue
        await channel.consume(queueName, async (message) => {
            const data = JSON.parse(message.content.toString());
            console.log(`Received message from ${queueName}`);

            // Generate address
            const address = generateAddress(
                data?.homeNo,
                data?.street,
                data?.ward,
                data?.district
            );

            // Use location plug-in
            const locationPlugin = PluginManager.getPlugin('google_maps');

            // Get location from address
            const location = await locationPlugin.getLocationFromAddress(
                address
            );

            console.log('address', address);
            if (location) {
                console.log('location', location);
                const callCenter = await saveCallCenter({
                    ...data,
                    pickupAddress: address,
                    lat: location?.lat,
                    long: location?.lng
                });
                console.log('Call center saved to database:', callCenter);
            }

            channel.ack(message);
        });

        console.log('Consumer started');
    } catch (error) {
        console.error('Error consuming from queue:', error);
    }
};
