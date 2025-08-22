<template>
    <div class="team-page">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading team...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <div class="error-message">
                <h2>Team Not Found</h2>
                <p>{{ error }}</p>
                <button @click="retry" class="retry-btn">Try Again</button>
            </div>
        </div>

        <!-- Team Content -->
        <div v-else-if="team" class="team-content">
            <!-- Breadcrumb Navigation -->
            <nav class="breadcrumb">
                <router-link :to="`/${organizationSlug}`" class="breadcrumb-item">
                    {{ team.organization?.name }}
                </router-link>
                <span class="breadcrumb-separator">→</span>
                <span v-if="team.parent_team" class="breadcrumb-item">
                    {{ team.parent_team.name }}
                </span>
                <span v-if="team.parent_team" class="breadcrumb-separator">→</span>
                <span class="breadcrumb-current">{{ team.name }}</span>
            </nav>

            <!-- Team Header -->
            <div class="team-header">
                <div class="team-info">
                    <h1 class="team-title">{{ team.name }}</h1>
                    <p v-if="team.description" class="team-description">
                        {{ team.description }}
                    </p>
                    <div class="team-meta">
                        <div class="meta-item">
                            <span class="count">{{ team.sub_teams?.length || 0 }}</span>
                            <span class="label">{{ team.sub_teams?.length === 1 ? 'Sub-team' : 'Sub-teams' }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="count">{{ team.events?.length || 0 }}</span>
                            <span class="label">{{ team.events?.length === 1 ? 'Event' : 'Events' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sub-teams Section -->
            <div class="sub-teams-section" v-if="team.sub_teams && team.sub_teams.length > 0">
                <h2 class="section-title">Sub-teams</h2>
                <div class="teams-grid">
                    <TeamCard
                        v-for="subTeam in team.sub_teams"
                        :key="subTeam.id"
                        :team="subTeam"
                        :organization-slug="organizationSlug"
                        @click="goToTeam(subTeam.slug)"
                    />
                </div>
            </div>

            <!-- Events Section -->
            <div class="events-section" v-if="team.events && team.events.length > 0">
                <h2 class="section-title">Team Events</h2>
                <div class="events-grid">
                    <EventCard
                        v-for="event in team.events"
                        :key="event.id"
                        :event="event"
                        :organization-slug="organizationSlug"
                        @click="goToEvent(event.slug)"
                    />
                </div>
            </div>

            <!-- Empty States -->
            <div v-if="(!team.sub_teams || team.sub_teams.length === 0) && (!team.events || team.events.length === 0)" class="empty-state">
                <div class="empty-content">
                    <h3>No Content Available</h3>
                    <p>This team doesn't have any sub-teams or events yet.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import teamService from '../../js/team-service.js';
import TeamCard from '../../components/TeamCard.vue';
import EventCard from '../../components/EventCard.vue';

const props = defineProps({
    organizationSlug: {
        type: String,
        required: true
    },
    teamSlug: {
        type: String,
        required: true
    }
});

const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const team = ref(null);

// Methods
const fetchTeam = async () => {
    try {
        loading.value = true;
        error.value = null;

        const response = await teamService.getBySlug(props.organizationSlug, props.teamSlug);
        
        if (response.success) {
            team.value = response.data;
        } else {
            error.value = response.message || 'Failed to load team';
        }
    } catch (err) {
        error.value = err.message || 'Failed to load team';
        console.error('Error fetching team:', err);
    } finally {
        loading.value = false;
    }
};

const retry = () => {
    fetchTeam();
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
    fetchTeam();
});
</script>

<style scoped>
.team-page {
    min-height: 100vh;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

/* Breadcrumb */
.breadcrumb {
    margin-bottom: 30px;
    padding: 15px 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 14px;
}

.breadcrumb-item {
    color: #888;
    text-decoration: none;
    transition: color 0.2s;
}

.breadcrumb-item:hover {
    color: #fff;
}

.breadcrumb-separator {
    color: #666;
    margin: 0 5px;
}

.breadcrumb-current {
    color: #fff;
    font-weight: 500;
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

/* Team Header */
.team-header {
    margin-bottom: 60px;
    padding: 40px 0;
    border-bottom: 1px solid #333;
}

.team-info {
    max-width: 800px;
}

.team-title {
    font-size: 48px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 15px 0;
    line-height: 1.2;
}

.team-description {
    font-size: 18px;
    color: #ccc;
    line-height: 1.6;
    margin: 0 0 25px 0;
    max-width: 600px;
}

.team-meta {
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

/* Sections */
.section-title {
    font-size: 32px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 30px 0;
}

.sub-teams-section,
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
    .team-page {
        padding: 15px;
    }

    .breadcrumb {
        font-size: 13px;
    }

    .team-title {
        font-size: 36px;
    }

    .team-meta {
        justify-content: flex-start;
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