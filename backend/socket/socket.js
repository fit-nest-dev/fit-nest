import { Server } from "socket.io";
import http from "http";
import express from "express"
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000","http://localhost:3001" ,"https://fit-nest.onrender.com","http://localhost:5000"],
        methods: ["GET", "POST"],
    }
});

/**
 * Returns the socketId of a user given his userId
 * @param {string} recieverId - The userId of the user whose socketId is to be retrieved
 * @returns {string} The socketId of the user
 */
export const getRecieverSocketId = (recieverId) => {
    return userSocketMap[recieverId];
}
const userSocketMap = {};//{userId:socketId}
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId != "undefined") {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})
export { app, io, server };