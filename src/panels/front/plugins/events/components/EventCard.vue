<template>
    <div class="event-card" @click="handleClick">
        <div class="event-card-content">
            <div class="event-header">
                <h3 class="event-name">{{ event.name }}</h3>
                <div class="event-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
                    </svg>
                </div>
            </div>
            
            <div class="event-description" v-if="event.description">
                <p>{{ truncateDescription(event.description) }}</p>
            </div>

            <div class="event-details">
                <div class="detail-item" v-if="event.duration">
                    <div class="detail-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <span class="detail-text">{{ formatDuration(event.duration) }}</span>
                </div>
                
                <div class="detail-item" v-if="event.created_at">
                    <div class="detail-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <span class="detail-text">{{ formatDate(event.created_at) }}</span>
                </div>
            </div>

            <div class="event-footer">
                <div class="book-button">
                    <span>Book Now</span>
                    <div class="book-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    event: {
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
    return description.length > 120 ? description.substring(0, 120) + '...' : description;
};

const formatDuration = (duration) => {
    if (!duration) return '';
    
    // Handle different duration formats
    if (typeof duration === 'number') {
        return `${duration} min`;
    }
    
    if (typeof duration === 'object' && duration.default) {
        return `${duration.default} min`;
    }
    
    return duration.toString();
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
};
</script>

<style scoped>
.event-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 160px;
}

.event-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
}

.event-card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

.event-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.event-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #f0f9ff;
    border-radius: 8px;
    color: #3b82f6;
    flex-shrink: 0;
}

.event-card:hover .event-icon {
    background: #dbeafe;
    color: #2563eb;
}

.event-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    line-height: 1.3;
    flex: 1;
}

.event-description {
    margin-bottom: 16px;
    flex: 1;
}

.event-description p {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
}

.event-details {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-icon {
    color: #9ca3af;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.detail-text {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
}

.event-footer {
    margin-top: auto;
}

.book-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    color: #475569;
    font-weight: 500;
    font-size: 13px;
    transition: all 0.2s ease;
}

.event-card:hover .book-button {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #334155;
}

.book-arrow {
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    color: #94a3b8;
}

.event-card:hover .book-arrow {
    transform: translateX(2px);
    color: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
    .event-card {
        padding: 16px;
        min-height: 140px;
    }

    .event-name {
        font-size: 15px;
    }

    .event-details {
        margin-bottom: 12px;
        gap: 4px;
    }

    .detail-text {
        font-size: 11px;
    }

    .book-button {
        padding: 8px 12px;
        font-size: 12px;
    }
}
</style>