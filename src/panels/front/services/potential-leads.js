import { api } from '@utils/api';

export const PotentialLeadsService = {
    /**
     * Capture potential lead when email is entered
     */
    async captureLead(eventSlug, data) {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            const response = await api.post(`public/events/${eventSlug}/potential-lead`, {
                email: data.email,
                name: data.name || null,
                timezone: timezone,
                captured_at: new Date().toISOString()
            });

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