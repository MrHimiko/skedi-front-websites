<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    event: {
        type: Object,
        required: true
    },
    organization: {
        type: Object,
        required: true
    },
    selectedDate: {
        type: Date,
        default: null
    },
    selectedTime: {
        type: String,
        default: null
    },
    duration: {
        type: Number,
        default: 30
    },
    timezone: {
        type: String,
        default: ''
    }
});

// Location type icons mapping - can be either Material Icons or SVG URLs
const locationIcons = {
    google_meet: {
        type: 'svg',
        value: 'https://global.divhunt.com/6dea696e910d70e2925a5c3e453a69ff_644.svg'
    },
    zoom: {
        type: 'svg',
        value: 'https://global.divhunt.com/3d293298387062da2256e7dd4415891e_652.svg'
    },
    phone: {
        type: 'material',
        value: 'phone'
    },
    physical: {
        type: 'material',
        value: 'location_on'
    },
    in_person: {
        type: 'material',
        value: 'place'
    },
    custom: {
        type: 'material',
        value: 'link'
    }
};

// Default icon for fallback
const defaultIcon = {
    type: 'material',
    value: 'videocam'
};

// Parse and format location info
const locationData = computed(() => {
    if (!props.event.location) {
        return {
            icon: defaultIcon,
            text: 'Skedi Meeting'
        };
    }

    // Check if location is a JSON string
    try {
        const locations = typeof props.event.location === 'string' 
            ? JSON.parse(props.event.location) 
            : props.event.location;
        
        // If it's an array, use the first location
        if (Array.isArray(locations) && locations.length > 0) {
            const location = locations[0];
            return {
                icon: locationIcons[location.type] || defaultIcon,
                text: location.display_name || 'Online Meeting'
            };
        }
        
        // If it's an object
        if (typeof locations === 'object' && locations.type) {
            return {
                icon: locationIcons[locations.type] || defaultIcon,
                text: locations.display_name || 'Online Meeting'
            };
        }
    } catch (e) {
        // If parsing fails, treat it as a simple string
    }

    // Fallback for simple string locations
    if (props.event.location_type === 'physical') {
        return {
            icon: locationIcons.physical,
            text: props.event.location
        };
    } else if (props.event.location_type === 'phone') {
        return {
            icon: locationIcons.phone,
            text: 'Phone call'
        };
    }

    return {
        icon: defaultIcon,
        text: props.event.location || 'Skedi Meeting'
    };
});

// Format the event duration
const formattedDuration = computed(() => {
    if (props.duration >= 60) {
        const hours = Math.floor(props.duration / 60);
        const minutes = props.duration % 60;
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${props.duration}m`;
});

// Get user's avatar or initials
const avatarInitial = computed(() => {
    if (props.organization.name) {
        return props.organization.name.charAt(0).toUpperCase();
    }
    return 'O';
});

// Format date to display (e.g. "Friday, March 21, 2025")
const formattedDate = computed(() => {
    if (!props.selectedDate) return '';
    
    return props.selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Format time range (e.g. "11:30 - 12:00")
const formattedTime = computed(() => {
    if (!props.selectedTime) return '';
    
    // Parse the start time (e.g., "11:30")
    const [startHour, startMinute] = props.selectedTime.split(':').map(Number);
    
    // Calculate end time by adding duration
    const endMinutes = startHour * 60 + startMinute + props.duration;
    const endHour = Math.floor(endMinutes / 60) % 24;
    const endMinute = endMinutes % 60;
    
    // Format both times as "HH:MM"
    const formattedStart = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    const formattedEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    
    return `${formattedStart} - ${formattedEnd}`;
});

// Display the current timezone
const displayTimezone = computed(() => {
    return props.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
});
</script>

<template>
    <div class="event-info-container">
        <!-- Organization avatar -->
        <div class="avatar">
            <span>{{ avatarInitial }}</span>
        </div>
        
        <!-- Organization name -->
        <div class="organization-name">
            {{ organization.name || organization.slug }}
        </div>
        
        <!-- Event name -->
        <h1 class="event-name">{{ event.name }}</h1>
        
        <!-- Duration -->
        <div class="event-detail">
            <div class="detail-icon">
                <i class="material-icons-outlined">schedule</i>
            </div>
            <span>{{ formattedDuration }}</span>
        </div>
        
        <!-- Location -->
        <div class="event-detail">
            <div class="detail-icon">
                <img 
                    v-if="locationData.icon.type === 'svg'" 
                    :src="locationData.icon.value" 
                    :alt="locationData.text" 
                    class="location-icon" 
                />
                <i 
                    v-else 
                    class="material-icons-outlined"
                >{{ locationData.icon.value }}</i>
            </div>
            <span>{{ locationData.text }}</span>
        </div>
        
        <!-- Time zone -->
        <div class="event-detail">
            <div class="detail-icon">
                <i class="material-icons-outlined">public</i>
            </div>
            <span>{{ displayTimezone }}</span>
        </div>
        
        <!-- Selected date and time (if any) -->
        <div v-if="selectedDate" class="selected-datetime">
            <div class="selected-date">
                <div class="detail-icon">
                    <i class="material-icons-outlined">event</i>
                </div>
                <span>{{ formattedDate }}</span>
            </div>
            
            <div v-if="selectedTime" class="selected-time">
                <div class="detail-icon">
                    <i class="material-icons-outlined">access_time</i>
                </div>
                <span>{{ formattedTime }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.event-info-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    animation: fadeIn 0.3s ease-in-out;
    background-color: var(--background-0);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 24px;
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--brand-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 500;
    color: var(--white);
}

.organization-name {
    font-size: 14px;
    color: var(--text-tertiary);
    margin-top: 8px;
}

.event-name {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
    line-height: 1.3;
}

.event-description {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 8px;
}

.event-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
}

.event-detail {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 14px;
}

.detail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--text-tertiary);
}

.location-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

.selected-datetime {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.selected-date, .selected-time {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--text-secondary);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>