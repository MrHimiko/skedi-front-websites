// In the frontend where you capture potential leads (e.g., when user enters email in booking form)

import { api } from '@utils/api';

export const PotentialLeadsService = {
    /**
     * Capture potential lead when email is entered
     * @param {number} organizationId - Organization ID from initial load
     * @param {number} eventId - Event ID from initial load
     * @param {object} data - Lead data (email, name, etc.)
     */
    async captureLead(organizationId, eventId, data) {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            const response = await api.post(
                `organizations/${organizationId}/events/${eventId}/potential-lead`,
                {
                    email: data.email,
                    name: data.name || null,
                    timezone: timezone,
                    captured_at: new Date().toISOString()
                }
            );

            if (response && response.success) {
                console.log('Potential lead captured successfully');
            }
            
            return response;
        } catch (error) {
            // Don't throw - fail silently to not interrupt booking flow
            console.error('Failed to capture potential lead:', error);
            return null;
        }
    }
};

