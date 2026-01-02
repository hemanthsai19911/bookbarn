import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketClient {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    connect(onConnected, onError) {
        const API_BASE = import.meta.env.VITE_API_BASE || 'https://bookbarn-production.up.railway.app';
        const WS_URL = `${API_BASE}/ws`;

        // Create client configuration
        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 0, // Disable automatic reconnection to handle it manually
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                // Only log non-heartbeat debug info to reduce noise
                if (str !== '>>> PING' && str !== '<<< PONG') {
                    // console.log('[WebSocket]', str); 
                }
            },
            onConnect: () => {
                console.log('âœ… WebSocket Connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                if (onConnected) onConnected();
            },
            onStompError: (frame) => {
                console.error('âŒ WebSocket Stomp Error:', frame.headers['message']);
                this.connected = false;
                if (onError) onError(frame);
            },
            onWebSocketClose: (evt) => {
                console.log('ðŸ”Œ WebSocket Disconnected');
                this.connected = false;

                // If the connection was closed cleanly or due to 403, we might want to stop
                // SockJS close event doesn't always expose status code easily in all browsers
                // but if we are here, we try to reconnect unless max attempts reached
                this.handleReconnect(onConnected, onError);
            },
        });

        try {
            this.client.activate();
        } catch (e) {
            console.error("WebSocket activation error:", e);
            if (onError) onError(e);
        }
    }

    handleReconnect(onConnected, onError) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`ðŸ”„ Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            // Exponential backoff
            const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

            setTimeout(() => {
                // Ensure we don't try to connect if we've been told to disconnect
                if (this.client && !this.client.active) {
                    this.connect(onConnected, onError);
                }
            }, delay);
        } else {
            console.error('âŒ Max reconnection attempts reached - Stopping WebSocket');
            // Notify the caller that connection failed permanently so they can fallback to polling
            if (onError) onError(new Error("Max reconnection attempts reached"));
        }
    }

    subscribe(destination, callback) {
        if (!this.client || !this.connected) {
            console.warn('âš ï¸ WebSocket not connected. Subscription will be queued.');
            // Queue subscription for when connection is established
            setTimeout(() => this.subscribe(destination, callback), 1000);
            return null;
        }

        const subscription = this.client.subscribe(destination, (message) => {
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        this.subscriptions.set(destination, subscription);
        console.log(`ðŸ“¡ Subscribed to: ${destination}`);
        return subscription;
    }

    unsubscribe(destination) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
            console.log(`ðŸ”• Unsubscribed from: ${destination}`);
        }
    }

    disconnect() {
        if (this.client) {
            // Unsubscribe from all
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();

            this.client.deactivate();
            this.connected = false;
            console.log('ðŸ‘‹ WebSocket Disconnected');
        }
    }

    isConnected() {
        return this.connected;
    }
}

// Singleton instance
const wsClient = new WebSocketClient();

export default wsClient;

