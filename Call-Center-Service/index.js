import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import callCenterRoute from './routes/call-center.route.js';
import { consumeFromQueue } from './services/rabbitmq.service.js';
import memberRoute from './routes/member.route.js';

dotenv.config();
const app = express();

mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to MongoDB');
    });

app.use(cors());
app.use(express.json());

// Routes
app.use('/v1/callcenter', callCenterRoute);
app.use('/v1/member', memberRoute);

app.listen(process.env.PORT || 8001, () => {
    console.log(`Server is running on port ${process.env.PORT || 8001}`);
});

try {
    // Start consuming messages from the RabbitMQ queue
    await consumeFromQueue('call_center', 'address_queue', 'call_center_key');
    console.log('Started consuming messages from the queue');
} catch (error) {
    console.error('Error consuming messages from the queue:', error);
}
