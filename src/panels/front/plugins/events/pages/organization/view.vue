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
                <div class="header-content">
                    <div class="organization-info">
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

            <!-- Teams Section with Hierarchy -->
            <div class="teams-section" v-if="organization.teams && organization.teams.length > 0">
                <h2 class="section-title">Teams</h2>
                <ul class="teams-tree">
                    <TreeItem
                        v-for="team in teamsHierarchy" 
                        :key="team.id"
                        :team="team"
                        :organization-slug="organizationSlug"
                        :level="0"
                        @click="goToTeam"
                    />
                </ul>
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
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                            <path d="M3 7l9 6 9-6"/>
                        </svg>
                    </div>
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
import TreeItem from '@front_events/components/TreeItem.vue';
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

// Computed - Build team hierarchy
const teamsHierarchy = computed(() => {
    if (!organization.value?.teams) return [];
    
    // Create a map for quick lookup
    const teamsMap = new Map();
    const rootTeams = [];
    
    // First pass: create all team objects
    organization.value.teams.forEach(team => {
        teamsMap.set(team.id, { ...team, children: [] });
    });
    
    // Second pass: build hierarchy
    organization.value.teams.forEach(team => {
        const teamNode = teamsMap.get(team.id);
        
        if (team.parent_team_id) {
            // This is a sub-team
            const parent = teamsMap.get(team.parent_team_id);
            if (parent) {
                parent.children.push(teamNode);
            }
        } else {
            // This is a root team
            rootTeams.push(teamNode);
        }
    });
    
    return rootTeams;
});

// Methods
const fetchOrganization = async () => {
    try {
        loading.value = true;
        error.value = null;

        console.log('Fetching organization with slug:', props.organizationSlug);

        const response = await organizationService.getBySlug(props.organizationSlug);
        
        console.log('Organization API response:', response);
        
        if (response && response.success && response.data) {
            organization.value = response.data;
            console.log('Organization set:', organization.value);
        } else {
            console.error('Invalid response structure:', response);
            error.value = 'Invalid response from server';
        }
    } catch (err) {
        console.error('Error fetching organization:', err);
        error.value = err.message || 'Failed to load organization';
        
        // If it's a server error, show a more user-friendly message
        if (err.message && err.message.includes('Invalid response')) {
            error.value = 'Server temporarily unavailable. Please try again.';
        }
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

.retry-btn:hover {
    background-color: #2563eb;
}

/* Organization Content */
.organization-content {
    max-width: 1200px;
    margin: 0 auto;
}

/* Organization Header */
.organization-header {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.organization-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px;
    color: #111827;
    line-height: 1.2;
}

.organization-description {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 24px;
    line-height: 1.5;
}

.organization-meta {
    display: flex;
    gap: 32px;
    margin-bottom: 20px;
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

.website-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    transition: color 0.2s;
}

.website-link:hover {
    color: #2563eb;
}

/* Sections */
.section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px;
    color: #111827;
}

.teams-section,
.events-section {
    margin-bottom: 32px;
}

/* Teams Tree Structure */
.teams-tree {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
}

.team-tree-item {
    position: relative;
}

.team-tree-item.has-children {
    margin-bottom: 8px;
}

.sub-teams {
    margin-top: 16px;
    position: relative;
    margin-left: 20px;
}

.tree-line {
    position: absolute;
    left: -20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e5e7eb;
    border-radius: 2px;
}

.sub-teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    position: relative;
}

.sub-team-item {
    position: relative;
}

.tree-connector {
    position: absolute;
    left: -20px;
    top: 50%;
    width: 16px;
    height: 2px;
    background: #e5e7eb;
    border-radius: 2px;
    transform: translateY(-50%);
}

.tree-connector::before {
    content: '';
    position: absolute;
    right: -2px;
    top: 50%;
    width: 6px;
    height: 6px;
    background: #e5e7eb;
    border-radius: 50%;
    transform: translateY(-50%);
}

/* Events Grid */
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
    .organization-page {
        padding: 16px;
    }
    
    .organization-header {
        padding: 24px;
    }
    
    .organization-title {
        font-size: 24px;
    }
    
    .organization-description {
        font-size: 14px;
    }
    
    .organization-meta {
        gap: 20px;
        flex-direction: column;
    }
    
    .meta-item {
        text-align: center;
    }
    
    .sub-teams {
        margin-left: 16px;
    }
    
    .tree-line {
        left: -16px;
    }
    
    .tree-connector {
        left: -16px;
        width: 12px;
    }
    
    .sub-teams-grid,
    .events-grid {
        grid-template-columns: 1fr;
    }
    
    .section-title {
        font-size: 18px;
    }
}
</style>