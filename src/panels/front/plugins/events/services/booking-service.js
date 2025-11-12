import { api } from '@utils/api';

export default {
    /**
     * Get booking by token
     */
    async getByToken(token) {
        try {
            const response = await api.get(`public/bookings/${token}`);
            return response;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    /**
     * Cancel booking by token
     */
    async cancelByToken(token, reason) {
        try {
            const response = await api.post(`public/bookings/${token}/cancel`, {
                reason: reason
            });
            return response;
        } catch (error) {
            console.error('Error canceling booking:', error);
            throw error;
        }
    }
};