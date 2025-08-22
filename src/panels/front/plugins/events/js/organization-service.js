import { api } from '@utils/api';

export default {
    /**
     * Get organization by slug with teams and events
     */
    async getBySlug(slug) {
        try {
            const response = await api.get(`public/organizations/${slug}`);
            return response;
        } catch (error) {
            console.error('Error fetching organization:', error);
            throw error;
        }
    },

    /**
     * Get organization basic info (used for breadcrumbs, etc.)
     */
    async getBasicInfo(slug) {
        try {
            const response = await this.getBySlug(slug);
            return {
                id: response.data.id,
                name: response.data.name,
                slug: response.data.slug,
                description: response.data.description,
                logo: response.data.logo,
                website: response.data.website
            };
        } catch (error) {
            console.error('Error fetching organization basic info:', error);
            throw error;
        }
    }
};