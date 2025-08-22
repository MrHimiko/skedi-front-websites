<template>
    <div class="team-card" @click="handleClick">
        <div class="team-card-content">
            <div class="team-header">
                <h3 class="team-name">{{ team.name }}</h3>
                <div class="team-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.011 3.011 0 0 0 16.06 6h-4.12c-1.31 0-2.47.84-2.88 2.06L6.5 16H9v6h2v-6h2v6h7z"/>
                        <circle cx="6" cy="4" r="2"/>
                        <path d="M10 18v2h4v-2h-4z"/>
                    </svg>
                </div>
            </div>
            
            <div class="team-description" v-if="team.description">
                <p>{{ truncateDescription(team.description) }}</p>
            </div>

            <div class="team-stats">
                <div class="stat-item" v-if="team.sub_teams_count !== undefined">
                    <span class="stat-value">{{ team.sub_teams_count || 0 }}</span>
                    <span class="stat-label">Sub-teams</span>
                </div>
                <div class="stat-item" v-if="team.events_count !== undefined">
                    <span class="stat-value">{{ team.events_count || 0 }}</span>
                    <span class="stat-label">Events</span>
                </div>
            </div>

            <div class="team-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
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
    }
});

const emit = defineEmits(['click']);

// Methods
const handleClick = () => {
    emit('click');
};

const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
};
</script>

<style scoped>
.team-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.team-card:hover {
    background: #222;
    border-color: #4CAF50;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.15);
}

.team-card-content {
    position: relative;
    z-index: 1;
}

.team-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.team-name {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    line-height: 1.3;
    flex: 1;
    margin-right: 10px;
}

.team-icon {
    color: #4CAF50;
    flex-shrink: 0;
    opacity: 0.7;
}

.team-description {
    margin-bottom: 20px;
}

.team-description p {
    color: #ccc;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
}

.team-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    line-height: 1;
}

.stat-label {
    font-size: 12px;
    color: #888;
    margin-top: 2px;
}

.team-arrow {
    position: absolute;
    top: 24px;
    right: 24px;
    color: #666;
    transition: all 0.3s ease;
}

.team-card:hover .team-arrow {
    color: #4CAF50;
    transform: translateX(3px);
}

/* Responsive */
@media (max-width: 768px) {
    .team-card {
        padding: 20px;
    }

    .team-name {
        font-size: 18px;
    }

    .team-stats {
        gap: 15px;
    }

    .stat-value {
        font-size: 16px;
    }
}
</style>