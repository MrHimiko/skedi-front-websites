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


        <!-- Sub-teams Section with Tree View -->
        <div class="sub-teams-section" v-if="team.sub_teams && team.sub_teams.length > 0">
            <h2 class="section-title">Sub-teams</h2>
            <ul class="teams-tree">
                <TreeItem
                    v-for="subTeam in subTeamsHierarchy" 
                    :key="subTeam.id"
                    :team="subTeam"
                    :organization-slug="organizationSlug"
                    :level="0"
                    @click="goToTeam"
                />
            </ul>
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
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <h3>No Content Available</h3>
                    <p>This team doesn't have any sub-teams or events yet.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import teamService from '@front_events/js/team-service.js';
import TeamCard from '@front_events/components/TeamCard.vue';
import EventCard from '@front_events/components/EventCard.vue';
import TreeItem from '@front_events/components/TreeItem.vue';

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

// Computed - Build sub-teams hierarchy
const subTeamsHierarchy = computed(() => {
    if (!team.value?.sub_teams) return [];
    
    // Create a map for quick lookup
    const teamsMap = new Map();
    const rootTeams = [];
    
    // First pass: create all team objects
    team.value.sub_teams.forEach(subTeam => {
        teamsMap.set(subTeam.id, { ...subTeam, children: [] });
    });
    
    // Second pass: build hierarchy
    team.value.sub_teams.forEach(subTeam => {
        const teamNode = teamsMap.get(subTeam.id);
        
        if (subTeam.parent_team_id && subTeam.parent_team_id !== team.value.id) {
            // This sub-team has a parent that's also a sub-team
            const parent = teamsMap.get(subTeam.parent_team_id);
            if (parent) {
                parent.children.push(teamNode);
            } else {
                // Parent not found in sub-teams, treat as root
                rootTeams.push(teamNode);
            }
        } else {
            // This is a direct child of the current team
            rootTeams.push(teamNode);
        }
    });
    
    return rootTeams;
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
        
        if (response && response.success && response.data) {
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
    background-color: #fafafa;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Loading State */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    gap: 16px;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid #f3f4f6;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-container p {
    color: #6b7280;
    margin: 0;
    font-size: 14px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 24px;
}

.error-message {
    text-align: center;
    max-width: 400px;
    padding: 32px;
    background: #ffffff;
    border: 1px solid #fee2e2;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-message h2 {
    color: #dc2626;
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
}

.error-message p {
    color: #6b7280;
    margin: 0 0 24px;
    font-size: 14px;
    line-height: 1.5;
}

.retry-btn {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
}


/* Teams Tree Structure */
.teams-tree {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
}

.retry-btn:hover {
    background-color: #2563eb;
}

/* Team Content */
.team-content {
    max-width: 1200px;
    margin: 0 auto;
}

/* Breadcrumb */
.breadcrumb {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.breadcrumb-item {
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.breadcrumb-item:hover {
    color: #374151;
}

.breadcrumb-separator {
    color: #d1d5db;
    margin: 0 4px;
}

.breadcrumb-current {
    color: #111827;
    font-weight: 600;
}

/* Team Header */
.team-header {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px;
    color: #111827;
    line-height: 1.2;
}

.team-description {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 24px;
    line-height: 1.5;
}

.team-meta {
    display: flex;
    gap: 32px;
}

.meta-item {
    text-align: left;
}

.meta-item .count {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
}

.meta-item .label {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

/* Sections */
.section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px;
    color: #111827;
}

.sub-teams-section,
.events-section {
    margin-bottom: 32px;
}

.teams-grid,
.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 48px 24px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: #f3f4f6;
    border-radius: 50%;
    margin-bottom: 16px;
    color: #9ca3af;
}

.empty-content h3 {
    font-size: 18px;
    color: #374151;
    margin: 0 0 8px;
    font-weight: 600;
}

.empty-content p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
    .team-page {
        padding: 16px;
    }
    
    .team-header {
        padding: 24px;
    }
    
    .team-title {
        font-size: 24px;
    }
    
    .team-description {
        font-size: 14px;
    }
    
    .team-meta {
        gap: 20px;
        flex-direction: column;
    }
    
    .meta-item {
        text-align: center;
    }
    
    .teams-grid,
    .events-grid {
        grid-template-columns: 1fr;
    }
    
    .section-title {
        font-size: 18px;
    }
    
    .breadcrumb {
        font-size: 13px;
        flex-wrap: wrap;
    }
}
</style>