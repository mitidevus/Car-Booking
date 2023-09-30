// Create a WebSocket connection
import { WebSocketServer } from "ws";
import { receiveDriverInfoFromQueue } from "../rabbitmq/sever.js";
import { sendMessageToQueue } from "../rabbitmq/user.js";
import { addConnection, removeConnection, getConnection } from "./socketManagement.js";
const activeConnections = new Map();


const QUEUE_NAME = "driverToUser"
const handleBookingEventClients = async(ws, eventData) => {
    if (eventData.type === "Accept") {
        try {
            const result = await sendMessageToQueue("trip", "create", );
            ws.send(JSON.stringify(result))
        } catch (error) {
            console.error("Driver define booking request:", error);
        }
    }
};
export { handleBookingEventClients }
// Function to send the cancel booking request
// const sendCancelBookingRequest = () => {
//     const cancelBookingEvent = {
//         type: "CancelBooking",
//         payload: {
//             bookingId: "your-booking-id",
//         },
//     };


//     ws.send(JSON.stringify(cancelBookingEvent));
// };
// ws.onmessage = (event) => {
//     const eventData = JSON.parse(event.data);

//     if (eventData.type === "BookingCanceled") {
//         const { bookingId } = eventData.payload;
//         // Display a message to the user indicating the booking has been canceled
//         console.log(`Booking ${bookingId} has been canceled.`);
//     }
// };

// // Call the function to send the cancel booking request
// sendCancelBookingRequest();
export const initializeWebClientsSocketServer = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log(`A new client connected`);

        ws.on("message", (message) => {
            try {
                const eventData = JSON.parse(message);
                if (eventData.type === "identify") {
                    // Extract userId from the identify message
                    const userId = eventData.userId;
                    if (!userId) {
                        console.log("User ID not found. Closing connection.");
                        ws.close();
                        return;
                    }

                    // Add the connection to the map
                    addConnection(userId, ws);
                    console.log(`User ${userId} connected`);

                } else {
                    handleMessage(ws, eventData);
                }
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        // Event handler for closing the connection
        ws.on("close", () => {
            console.log("Client disconnected");

            // Find and remove the connection from the map
            const userId = findUserIdByConnection(ws);
            if (userId) {
                removeConnection(userId);
                console.log(`User ${userId} disconnected`);
            }
        });
    });
};

function findUserIdByConnection(connection) {
    for (const [userId, ws] of activeConnections) {
        if (ws === connection) {
            return userId;
        }
    }
    return null;
}

function handleMessage(ws, eventData) {
    // Find userId based on WebSocket connection
    const userId = findUserIdByConnection(ws);
    if (!userId) {
        console.log("User not identified. Ignoring message.");
        return;
    }

    // You can implement your own logic here
    // For example, send a message to a specific user based on userId
    const connection = getConnection(userId);
    if (connection) {
        connection.send(JSON.stringify(eventData));
    }
}