<script setup>
import { computed } from 'vue';

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
  }
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

// Format location info
const locationInfo = computed(() => {
  if (props.event.location_type === 'physical') {
    return props.event.location || 'In-person meeting';
  } else if (props.event.location_type === 'phone') {
    return 'Phone call';
  } else {
    return props.event.location || 'Skedi Meeting';
  }
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
        <i class="material-icons-outlined">
          {{ event.location_type === 'physical' ? 'location_on' : 'videocam' }}
        </i>
      </div>
      <span>{{ locationInfo }}</span>
    </div>
    
    <!-- Time zone -->
    <div class="event-detail" v-if="event.timezone">
      <div class="detail-icon">
        <i class="material-icons-outlined">public</i>
      </div>
      <span>{{ event.timezone }}</span>
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