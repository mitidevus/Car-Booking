import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import driverRoute from "./route/driverRoute.js";
import { createServer } from "http";
import { initializeWebSocketServer } from "./socket/driverSocket.js";
import { receiveDriverInfoFromQueue } from "./rabbitmq/sever.js";
import { initializeWebClientsSocketServer } from "./socket/clientRequest.js";
dotenv.config();
const app = express();

const connect = async() => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to MongoDB");
    } catch (error) {
        throw error;
    }
};

mongoose.connection.on("disconnect", () => {
    console.log("Database disconnected");
});

app.use(express.json());
app.use("/driver", driverRoute);


const server = createServer(app);
initializeWebSocketServer(server);


const clientServer = createServer(app)
initializeWebClientsSocketServer(clientServer)
clientServer.listen(8081, () => {})
server.listen(8080, () => {
    connect();
    console.log("Connected to backend");
});