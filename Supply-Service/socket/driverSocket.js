import { WebSocketServer } from "ws";
import { receiveDriverInfoFromQueue } from "../rabbitmq/sever.js"
import { sendMessageToQueue } from "../rabbitmq/user.js"
import axios from "axios"
import { createServer } from "http";
const QUEUE_NAME = "driverToUser";
import { findNearestDrivers, updateDriverDestination } from "../controller/driverController.js";
import { addConnection, removeConnection, getConnection } from "./socketManagement.js";
import { receiveMessageOnPort } from "worker_threads";
const handleUpdatePositionEvent = async(ws, eventData) => {
    if (eventData.type === "UpdatePosition") {
        const { driverId, latitude, longitude } = eventData.payload;
        const newDestination = {
            type: 'Point',
            coordinates: [longitude, latitude],
        }
        try {
            await updateDriverDestination(driverId, newDestination);
        } catch (error) {
            console.error("Error processing update position request:", error);
            ws.send(JSON.stringify({ type: "Error", payload: "Error updating position" }));
        }
    }
};
export { handleUpdatePositionEvent };
// On the server, simulate sending an "UpdatePosition" request after 20 seconds
// const simulateUpdateRequest = () => {
//     const updatePayload = {
//         type: "UpdatePosition",
//         payload: {
//             driverId: "64cc7653bdacadbd89161b39",
//             latitude: 12.345678,
//             longitude: 34.567890,
//         },
//     };

//     ws.clients.forEach((client) => {
//         client.send(JSON.stringify(updatePayload));
//     });

//     setTimeout(simulateUpdateRequest, 20000);
// };


// simulateUpdateRequest();

const handleBookingEvent = async(ws, eventData) => {
    if (eventData.type === "Booking") {
        const { longitude, latitude } = eventData.payload;
        try {
            const nearestDrivers = await findNearestDrivers(longitude, latitude);
            const driverInfoArray = nearestDrivers.map((driver) => ({
                driverId: driver.driverId,
                avatar: driver.driverAvatar,
                name: driver.name,
                carType: driver.vehicleType,
                carPlate: driver.vehiclePlate,
                bookingID: "CarABC"
            }));
            if (driverInfoArray.length > 0) {
                ws.send(JSON.stringify(driverInfoArray));
                const chooseDriver = driverInfoArray[0]
                addConnection(chooseDriver.driverId, ws)
                    // removeConnection(chooseDriver.driverId)
                const connection = getConnection(chooseDriver.driverId);
                if (connection) {
                    console.log(`Driver ${chooseDriver.driverId} accepted the request`)
                    const message = {
                        type: 'request_accepted',
                        data: data
                    };

                    connection.send(JSON.stringify(message));
                    sendMessageToQueue("trip", "create", data);
                    receiveDriverInfoFromQueue("trip", "create")
                } else {
                    console.log("User define booking")
                }
                handleUpdateHistory(receivedPayload, "Start")
                handleUpdateHistory(receivedPayload, "On-going")
                handleUpdateHistory(receivedPayload, "End")
            } else {
                ws.send(JSON.stringify({ type: 'NearestDriver', payload: null }));
            }

        } catch (error) {
            console.error("Error processing booking request:", error);
            ws.send(JSON.stringify({ type: 'Error', payload: "Error processing booking request" }));
        }
    }


};

export { handleBookingEvent };
const handleUpdateHistory = async(payload, status) => {
    try {
        const tripId = payload.data._id;

        const tripHistory = {
            id: tripId,
            status: status,
        };


        setTimeout(async() => {
            await sendMessageToQueue("trip", "update", tripHistory);
            console.log('Trip history update sent to queue:', tripHistory);
            if (status === "End") {
                removeConnection(payload.driverId)
                console.log("Done trip")
            }
        }, 2000);
    } catch (error) {
        console.error('Error handling update history:', error);
    }
};

// Simulate receiving a payload and calling the handleUpdateHistory function
const receivedPayload = {
    status_code: 'ACCEPT',
    message: 'successfully',
    code: '00',
    data: {
        _id: '64dc32f9f32de10dcdc1ef3e',
        userId: '6145a9468e1b9ef6dbff6acb',
        driverId: '6145a9468e1b9ef6dbff6acb',
        longitudeFrom: '123.456789',
        latitudeFrom: '12.345678',
        addressFrom: '123 Main St, City A',
        longitudeTo: '987.654321',
        latitudeTo: '98.765432',
        addressTo: '456 Elm St, City B',
        price: 127000,
        status: 'CREATED',
        tripHistories: null
    }
};




const handleBookingEventClients = async(eventData) => {
    if (eventData.status === "Booking") {
        try {
            const bookingInfo = receiveDriverInfoFromQueue("driverToUser")
            ws.send(JSON.stringify(bookingInfo))
        } catch (error) {
            console.error("Driver define booking request:", error);
        }
    }
};
export { handleBookingEventClients }
const handleCancelEvent = async(ws, eventData) => {
    if (eventData.type === "Cancel") {

    }
}
const data = {
    userId: "6145a9468e1b9ef6dbff6aca",
    driverId: "6145a9468e1b9ef6dbff6acb",
    longitudeFrom: "123.456789",
    latitudeFrom: "12.345678",
    addressFrom: "123 Main St, City A",
    longitudeTo: "987.654321",
    latitudeTo: "98.765432",
    addressTo: "456 Elm St, City B",
    price: 127000
};
const handleRequestAccepted = async(data) => {
    if (!data || !data.driverId) {
        return;
    }

    const driverId = data.driverId;

    console.log(`Driver ${driverId} accepted the request`);

    // Send the message to the user's WebSocket connection
    const connection = getConnection(driverId);
    if (connection) {
        const message = {
            type: 'request_accepted',
            data: data
        };

        connection.send(JSON.stringify(message));
    }
}

export { handleRequestAccepted }
export const initializeWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });
    wss.on("connection", (ws) => {
        console.log(`A new driver connected`);
        // Event handler for receiving messages from the client
        ws.on("message", (message) => {
            try {
                const eventData = JSON.parse(message);
                handleBookingEvent(ws, eventData);
                // handleRequestAccepted(data)
                handleUpdatePositionEvent(ws, eventData);
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        // Event handler for closing the connection
        ws.on("close", () => {
            console.log("Driver disconnected");
        });
    });
};