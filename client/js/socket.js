import { io } from 'socket.io-client';

export function createSocket(options) {
    var serverUrl = window.__SOCKET_SERVER_URL || '';

    var socket = io(serverUrl, Object.assign({
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
    }, options));

    socket.on('connect_error', function(err) {
        console.error('Socket connection error:', err.message);
    });

    socket.on('reconnect', function(attempt) {
        console.log('Reconnected after ' + attempt + ' attempts');
    });

    socket.on('reconnect_attempt', function(attempt) {
        console.log('Reconnection attempt ' + attempt);
    });

    socket.io.on('error', function(err) {
        console.error('Socket.IO transport error:', err.message);
    });

    return socket;
}
