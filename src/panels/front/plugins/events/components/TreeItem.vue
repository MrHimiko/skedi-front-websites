<template>
    <div class="tree-item" :style="{ marginLeft: `${level * 24}px` }">
        <!-- Team Card (Simplified) -->
        <div class="team-card" :class="teamClasses" @click="handleClick">
            <!-- Tree Lines -->
            <div v-if="level > 0" class="tree-lines">
                <div 
                    v-for="i in level" 
                    :key="i" 
                    class="tree-line"
                    :style="{ left: `${-24 * (level - i + 1) + 12}px` }"
                ></div>
                <div class="tree-connector"></div>
            </div>

            <div class="team-content">
                <div class="team-header">
                    <div class="team-icon">
                        <!-- Tree branch icon for parent teams -->
                        <svg v-if="hasChildren" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                        <!-- User icon for leaf teams -->
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="7" r="4"/>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        </svg>
                    </div>

                    <div class="team-info">
                        <h4 class="team-name">{{ team.name }}</h4>
                        <p v-if="team.description" class="team-description">{{ team.description }}</p>
                    </div>

                    <div class="team-stats">
                        <span v-if="team.children && team.children.length > 0" class="stat">
                            {{ team.children.length }} sub-team{{ team.children.length === 1 ? '' : 's' }}
                        </span>
                        <span v-if="team.events_count !== undefined" class="stat">
                            {{ team.events_count || 0 }} event{{ team.events_count === 1 ? '' : 's' }}
                        </span>
                    </div>

                    <div class="team-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recursive Children -->
        <div v-if="hasChildren" class="children">
            <TreeItem
                v-for="child in team.children"
                :key="child.id"
                :team="child"
                :organization-slug="organizationSlug"
                :level="level + 1"
                @click="handleClick"
            />
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
    level: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['click']);

// Computed
const hasChildren = computed(() => {
    return props.team.children && props.team.children.length > 0;
});

const teamClasses = computed(() => ({
    'is-root': props.level === 0,
    'is-child': props.level > 0,
    'has-children': hasChildren.value
}));

// Methods
const handleClick = () => {
    emit('click', props.team.slug);
};
</script>

<style scoped>
.tree-item {
    position: relative;
}

.team-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-height: 60px;
    display: flex;
    align-items: center;
}

.team-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
    background: #fafbff;
}

/* Root team styling */
.team-card.is-root {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    font-weight: 500;
}

.team-card.is-root:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.15);
}

/* Child team styling */
.team-card.is-child {
    border-color: #d1d5db;
    background: #fafafa;
}

.team-card.is-child:hover {
    border-color: #9ca3af;
    background: #f3f4f6;
}

/* Tree Lines */
.tree-lines {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
}

.tree-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #e5e7eb;
}

.tree-connector {
    position: absolute;
    left: -12px;
    top: 50%;
    width: 10px;
    height: 1px;
    background: #e5e7eb;
    transform: translateY(-50%);
}

.tree-connector::before {
    content: '';
    position: absolute;
    right: -2px;
    top: 50%;
    width: 4px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 50%;
    transform: translateY(-50%);
}

/* Team Content */
.team-content {
    flex: 1;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    min-height: 60px;
}

.team-header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.team-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #f3f4f6;
    border-radius: 6px;
    color: #6b7280;
    flex-shrink: 0;
}

.team-card.is-root .team-icon {
    background: #dbeafe;
    color: #3b82f6;
}

.team-card.is-child .team-icon {
    background: #f3f4f6;
    color: #9ca3af;
}

.team-info {
    flex: 1;
    min-width: 0;
}

.team-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 2px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.team-description {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.team-stats {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-right: 12px;
    text-align: right;
}

.stat {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
    white-space: nowrap;
}

.team-arrow {
    color: #d1d5db;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.team-card:hover .team-arrow {
    color: #9ca3af;
    transform: translateX(2px);
}

.team-card.is-root .team-arrow {
    color: #93c5fd;
}

.team-card.is-root:hover .team-arrow {
    color: #3b82f6;
}

/* Children container */
.children {
    /* No additional styling needed, margin handled by tree-item */
}

/* Responsive */
@media (max-width: 768px) {
    .team-card {
        min-height: 50px;
    }

    .team-content {
        padding: 8px 12px;
        min-height: 50px;
    }

    .team-name {
        font-size: 13px;
    }

    .team-description {
        font-size: 11px;
    }

    .team-stats {
        display: none; /* Hide stats on mobile for space */
    }

    .team-icon {
        width: 24px;
        height: 24px;
    }
}
</style>