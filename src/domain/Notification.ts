export interface Notification {
    id: string;
    type: string; // e.g., 'ORDER_CONFIRMED', 'NEW_OFFER'
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    data: {
        // Contextual data, e.g., orderId or productId
        [key: string]: any; 
    }
}
