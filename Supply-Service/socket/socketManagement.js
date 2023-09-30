// WebSocketConnections.js

const activeConnections = new Map();

export const addConnection = (id, ws) => {
    activeConnections.set(id, ws);
};

export const removeConnection = (id) => {
    activeConnections.delete(id);
};

export const getConnection = (id) => {
    return activeConnections.get(id);
};