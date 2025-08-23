import { api } from '@utils/api';

export default {
    /**
     * Get team by slug with sub-teams and events
     */
    async getBySlug(orgSlug, teamSlug) {
        try {
            const response = await api.get(`public/teams/${orgSlug}/${teamSlug}`);
            return response;
        } catch (error) {
            console.error('Error fetching team:', error);
            throw error;
        }
    },

    /**
     * Get team basic info (used for breadcrumbs, etc.)
     */
    async getBasicInfo(orgSlug, teamSlug) {
        try {
            const response = await this.getBySlug(orgSlug, teamSlug);
            return {
                id: response.data.id,
                name: response.data.name,
                slug: response.data.slug,
                description: response.data.description,
                organization: response.data.organization,
                parent_team: response.data.parent_team
            };
        } catch (error) {
            console.error('Error fetching team basic info:', error);
            throw error;
        }
    }
};