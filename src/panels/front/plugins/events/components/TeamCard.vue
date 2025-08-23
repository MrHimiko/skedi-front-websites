<template>
    <div class="team-card" @click="handleClick" :class="{ 'is-parent': isParent, 'is-child': isChild }">
        <div class="team-card-content">
            <div class="team-header">
                <div class="team-icon">
                    <!-- Parent team icon (team with sub-teams) -->
                    <svg v-if="isParent" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <!-- Child team icon (sub-team) -->
                    <svg v-else-if="isChild" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="10" cy="7" r="4"/>
                        <circle cx="18" cy="7" r="2"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    </svg>
                    <!-- Regular team icon -->
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <h3 class="team-name">
                    <span v-if="isChild" class="team-prefix">└ </span>
                    {{ team.name }}
                </h3>
            </div>
            
            <div class="team-description">
                <p v-if="team.description">{{ truncateDescription(team.description) }}</p>
                <p v-else class="no-description">No description available</p>
            </div>

            <div class="team-stats" v-if="hasStats">
                <div class="stat-item" v-if="team.sub_teams_count !== undefined">
                    <span class="stat-value">{{ team.sub_teams_count || 0 }}</span>
                    <span class="stat-label">Sub-teams</span>
                </div>
                <div class="stat-item" v-if="team.events_count !== undefined">
                    <span class="stat-value">{{ team.events_count || 0 }}</span>
                    <span class="stat-label">Events</span>
                </div>
                <!-- Show children count for parent teams -->
                <div class="stat-item" v-if="isParent && team.children">
                    <span class="stat-value">{{ team.children.length }}</span>
                    <span class="stat-label">Sub-teams</span>
                </div>
            </div>

            <!-- Hierarchy indicator for parent teams -->
            <div v-if="isParent" class="hierarchy-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"/>
                </svg>
                <span>Has Sub-teams</span>
            </div>

            <div class="team-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    team: {
        type: Object,
        required: true
    },
    organizationSlug: {
        type: String,
        required: true
    },
    isParent: {
        type: Boolean,
        default: false
    },
    isChild: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['click']);

// Computed
const hasStats = computed(() => {
    return props.team.sub_teams_count !== undefined || 
           props.team.events_count !== undefined || 
           (props.isParent && props.team.children);
});

// Methods
const handleClick = () => {
    emit('click');
};

const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 80 ? description.substring(0, 80) + '...' : description;
};
</script>

<style scoped>
.team-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    height: auto;
    min-height: 120px;
    display: flex;
    flex-direction: column;
}

.team-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
}

/* Parent team styling - teams with sub-teams */
.team-card.is-parent {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
}

.team-card.is-parent:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1);
}

.team-card.is-parent .team-icon {
    background: #dbeafe;
    color: #3b82f6;
}

/* Child team styling - sub-teams */
.team-card.is-child {
    border-style: dashed;
    border-color: #d1d5db;
    background: #fafafa;
    transform: scale(0.95);
    min-height: 100px;
}

.team-card.is-child:hover {
    border-color: #9ca3af;
    background: #f3f4f6;
    transform: scale(0.95) translateY(-1px);
}

.team-card.is-child .team-icon {
    background: #f3f4f6;
    color: #9ca3af;
}

.team-card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

.team-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.team-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #f3f4f6;
    border-radius: 8px;
    color: #6b7280;
    flex-shrink: 0;
}

.team-card:hover .team-icon {
    background: #e5e7eb;
    color: #374151;
}

.team-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    line-height: 1.3;
    flex: 1;
    display: flex;
    align-items: center;
}

.team-prefix {
    color: #9ca3af;
    margin-right: 4px;
    font-family: monospace;
    font-weight: 400;
}

.team-description {
    margin-bottom: 12px;
    flex: 1;
}

.team-description p {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
}

.team-description .no-description {
    color: #9ca3af;
    font-style: italic;
}

.team-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    line-height: 1;
}

.stat-label {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

.hierarchy-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 6px;
    margin-bottom: 8px;
    align-self: flex-start;
}

.hierarchy-badge span {
    font-size: 11px;
    color: #3b82f6;
    font-weight: 500;
}

.hierarchy-badge svg {
    color: #3b82f6;
}

.team-arrow {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #d1d5db;
    transition: all 0.2s ease;
}

.team-card:hover .team-arrow {
    color: #9ca3af;
    transform: translateX(2px);
}

.team-card.is-parent .team-arrow {
    color: #93c5fd;
}

.team-card.is-parent:hover .team-arrow {
    color: #3b82f6;
}

/* Responsive */
@media (max-width: 768px) {
    .team-card {
        padding: 16px;
        min-height: 100px;
    }

    .team-card.is-child {
        min-height: 90px;
    }

    .team-name {
        font-size: 15px;
    }

    .team-stats {
        gap: 12px;
    }

    .stat-value {
        font-size: 14px;
    }

    .hierarchy-badge {
        padding: 3px 6px;
    }

    .hierarchy-badge span {
        font-size: 10px;
    }
}
</style>