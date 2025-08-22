<template>
    <div class="organization-page">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading organization...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <div class="error-message">
                <h2>Organization Not Found</h2>
                <p>{{ error }}</p>
                <button @click="retry" class="retry-btn">Try Again</button>
            </div>
        </div>

        <!-- Organization Content -->
        <div v-else-if="organization" class="organization-content">
            <!-- Organization Header -->
            <div class="organization-header">
                <div class="organization-info">
                    <div class="logo-section" v-if="organization.logo">
                        <img :src="organization.logo" :alt="organization.name" class="org-logo">
                    </div>
                    <div class="text-section">
                        <h1 class="organization-title">{{ organization.name }}</h1>
                        <p v-if="organization.description" class="organization-description">
                            {{ organization.description }}
                        </p>
                        <div class="organization-meta">
                            <div class="meta-item">
                                <span class="count">{{ organization.teams?.length || 0 }}</span>
                                <span class="label">{{ organization.teams?.length === 1 ? 'Team' : 'Teams' }}</span>
                            </div>
                            <div class="meta-item">
                                <span class="count">{{ organization.events?.length || 0 }}</span>
                                <span class="label">{{ organization.events?.length === 1 ? 'Event' : 'Events' }}</span>
                            </div>
                        </div>
                        <a v-if="organization.website" :href="organization.website" target="_blank" class="website-link">
                            Visit Website →
                        </a>
                    </div>
                </div>
            </div>

            <!-- Teams Section -->
            <div class="teams-section" v-if="organization.teams && organization.teams.length > 0">
                <h2 class="section-title">Teams</h2>
                <div class="teams-grid">
                    <TeamCard
                        v-for="team in organization.teams"
                        :key="team.id"
                        :team="team"
                        :organization-slug="organizationSlug"
                        @click="goToTeam(team.slug)"
                    />
                </div>
            </div>

            <!-- Events Section -->
            <div class="events-section" v-if="organization.events && organization.events.length > 0">
                <h2 class="section-title">Organization Events</h2>
                <div class="events-grid">
                    <EventCard
                        v-for="event in organization.events"
                        :key="event.id"
                        :event="event"
                        :organization-slug="organizationSlug"
                        @click="goToEvent(event.slug)"
                    />
                </div>
            </div>

            <!-- Empty States -->
            <div v-if="(!organization.teams || organization.teams.length === 0) && (!organization.events || organization.events.length === 0)" class="empty-state">
                <div class="empty-content">
                    <h3>No Content Available</h3>
                    <p>This organization doesn't have any public teams or events yet.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import organizationService from '@front_events/js/organization-service.js';
import TeamCard from '@front_events/components/TeamCard.vue';
import EventCard from '@front_events/components/EventCard.vue';

const props = defineProps({
    organizationSlug: {
        type: String,
        required: true
    }
});

const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const organization = ref(null);

// Methods
const fetchOrganization = async () => {
    try {
        loading.value = true;
        error.value = null;

        const response = await organizationService.getBySlug(props.organizationSlug);
        
        if (response.success) {
            organization.value = response.data;
        } else {
            error.value = response.message || 'Failed to load organization';
        }
    } catch (err) {
        error.value = err.message || 'Failed to load organization';
        console.error('Error fetching organization:', err);
    } finally {
        loading.value = false;
    }
};

const retry = () => {
    fetchOrganization();
};

const goToTeam = (teamSlug) => {
    router.push({
        name: 'TeamPage',
        params: {
            organizationSlug: props.organizationSlug,
            teamSlug: teamSlug
        }
    });
};

const goToEvent = (eventSlug) => {
    router.push({
        name: 'EventPage',
        params: {
            organizationSlug: props.organizationSlug,
            eventSlug: eventSlug
        }
    });
};

// Lifecycle
onMounted(() => {
    fetchOrganization();
});
</script>

<style scoped>
.organization-page {
    min-height: 100vh;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

/* Loading State */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #fff;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.error-message {
    text-align: center;
    color: #ff6b6b;
    padding: 40px;
    border: 1px solid #ff6b6b;
    border-radius: 8px;
    background: rgba(255, 107, 107, 0.1);
}

.error-message h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
}

.error-message p {
    margin: 0 0 20px 0;
    opacity: 0.8;
}

.retry-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.retry-btn:hover {
    background: #ff5252;
}

/* Organization Header */
.organization-header {
    margin-bottom: 60px;
    padding: 40px 0;
    border-bottom: 1px solid #333;
}

.organization-info {
    display: flex;
    align-items: flex-start;
    gap: 30px;
}

.logo-section {
    flex-shrink: 0;
}

.org-logo {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #333;
}

.text-section {
    flex: 1;
}

.organization-title {
    font-size: 48px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 15px 0;
    line-height: 1.2;
}

.organization-description {
    font-size: 18px;
    color: #ccc;
    line-height: 1.6;
    margin: 0 0 25px 0;
    max-width: 600px;
}

.organization-meta {
    display: flex;
    gap: 40px;
    margin-bottom: 20px;
}

.meta-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.meta-item .count {
    font-size: 32px;
    font-weight: bold;
    color: #fff;
    line-height: 1;
}

.meta-item .label {
    font-size: 14px;
    color: #888;
    margin-top: 5px;
}

.website-link {
    display: inline-block;
    color: #4CAF50;
    text-decoration: none;
    font-weight: 500;
    padding: 8px 0;
    border-bottom: 1px solid transparent;
    transition: border-bottom-color 0.2s;
}

.website-link:hover {
    border-bottom-color: #4CAF50;
}

/* Sections */
.section-title {
    font-size: 32px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 30px 0;
}

.teams-section,
.events-section {
    margin-bottom: 60px;
}

/* Grids */
.teams-grid,
.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

/* Empty State */
.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    margin-top: 60px;
}

.empty-content {
    text-align: center;
    color: #666;
    max-width: 400px;
}

.empty-content h3 {
    font-size: 24px;
    color: #fff;
    margin: 0 0 15px 0;
}

.empty-content p {
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
    .organization-page {
        padding: 15px;
    }

    .organization-info {
        flex-direction: column;
        text-align: center;
    }

    .organization-title {
        font-size: 36px;
    }

    .organization-meta {
        justify-content: center;
        gap: 30px;
    }

    .teams-grid,
    .events-grid {
        grid-template-columns: 1fr;
    }

    .section-title {
        font-size: 28px;
    }
}
</style>