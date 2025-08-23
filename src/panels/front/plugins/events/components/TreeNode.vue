<template>
    <li class="tree-node">
        <div class="team-card" @click="handleClick">
            <div class="team-content">
                <div class="team-icon">
                    <svg v-if="hasChildren" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="7" r="4"/>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    </svg>
                </div>
                
                <div class="team-info">
                    <h4 class="team-name">{{ team.name }}</h4>
                    <p v-if="team.description" class="team-description">{{ team.description }}</p>
                </div>
                
                <div class="team-stats" v-if="hasStats">
                    <span v-if="hasChildren" class="stat">
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
        
        <!-- Nested children as proper UL -->
        <ul v-if="hasChildren" class="tree-children">
            <TreeNode
                v-for="child in team.children"
                :key="child.id"
                :team="child"
                :organization-slug="organizationSlug"
                @click="$emit('click', $event)"
            />
        </ul>
    </li>
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

const hasChildren = computed(() => {
    return props.team.children && props.team.children.length > 0;
});

const hasStats = computed(() => {
    return hasChildren.value || props.team.events_count !== undefined;
});

const handleClick = () => {
    emit('click', props.team.slug);
};
</script>

<style scoped>
.tree-node {
    position: relative;
    list-style: none;
}

.tree-node::before {
    /* Vertical line for parent connection */
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 50%;
    width: 1px;
    background: #e5e7eb;
    z-index: 1;
}

.tree-node::after {
    /* Horizontal line to card */
    content: '';
    position: absolute;
    left: 20px;
    top: 32px;
    width: 20px;
    height: 1px;
    background: #e5e7eb;
    z-index: 1;
}

.tree-node:first-child::before {
    /* Remove top line for first child */
    top: 32px;
}

.tree-node:last-child::before {
    /* Remove bottom line for last child */
    bottom: calc(100% - 32px);
}

/* Root level nodes (direct children of tree-list) don't need lines */
.tree-list > .tree-node::before,
.tree-list > .tree-node::after {
    display: none;
}

.team-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin: 4px 0;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    z-index: 2;
    margin-left: 0;
}

.team-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
    background: #fafbff;
}

.team-content {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
    min-height: 60px;
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
}

.team-description {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
    line-height: 1.3;
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

/* Nested children */
.tree-children {
    list-style: none;
    margin: 0;
    padding: 0;
    margin-left: 40px; /* This creates the indentation */
    position: relative;
}

/* Root level styling */
.tree-list > .tree-node .team-card {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.tree-list > .tree-node .team-card:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.15);
}

.tree-list > .tree-node .team-icon {
    background: #dbeafe;
    color: #3b82f6;
}

/* Responsive */
@media (max-width: 768px) {
    .tree-children {
        margin-left: 24px;
    }
    
    .tree-node::before {
        left: 12px;
    }
    
    .tree-node::after {
        left: 12px;
        width: 12px;
    }
    
    .team-content {
        padding: 8px 12px;
        min-height: 50px;
    }
    
    .team-stats {
        display: none;
    }
}
</style>