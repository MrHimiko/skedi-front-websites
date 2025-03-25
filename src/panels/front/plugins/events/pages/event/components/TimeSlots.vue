<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  availableSlots: {
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
  event: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['timeSelected', 'durationChanged']);

// Time format (12h or 24h)
const timeFormat = ref('12h');

// Get the currently selected duration
const selectedDuration = ref(30);

// Set initial duration based on event data
if (props.event && props.event.duration && props.event.duration.length > 0) {
  selectedDuration.value = props.event.duration[0].duration;
}

// Compute available time slots for selected date
const availableTimesForSelectedDate = computed(() => {
  if (!props.selectedDate || !props.availableSlots) return [];
  
  const dateStr = props.selectedDate.toISOString().split('T')[0];
  const slots = props.availableSlots[dateStr] || [];
  
  return slots;
});

// Format time based on selected format (12h or 24h)
function formatTime(timeString) {
  if (timeString === 'loading') return 'Loading...';
  
  try {
    const [hour, minute] = timeString.split(':').map(Number);
    
    if (timeFormat.value === '24h') {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    }
  } catch (err) {
    console.error('Error formatting time:', err, timeString);
    return timeString;
  }
}

// Toggle time format between 12h and 24h
function toggleTimeFormat() {
  timeFormat.value = timeFormat.value === '12h' ? '24h' : '12h';
}

// Select a time slot
function selectTime(time) {
  emit('timeSelected', time);
}

// Update the duration
function changeDuration(duration) {
  selectedDuration.value = duration;
  emit('durationChanged', duration);
}

// Get the formatted date header
const formattedDateHeader = computed(() => {
  if (!props.selectedDate) return 'Select a date';
  
  return props.selectedDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
});
</script>

<template>
  <div class="time-slots">
    <!-- Time slots header -->
    <div class="time-slots-header">
      <div class="time-header-content">
        <h3 class="date-heading">{{ formattedDateHeader }}</h3>
        
        <button @click="toggleTimeFormat" class="format-toggle">
          {{ timeFormat }}
        </button>
      </div>
      
      <!-- Duration selector (if multiple durations are available) -->
      <div v-if="event.duration && event.duration.length > 1" class="duration-selector">
        <div class="duration-options">
          <button 
            v-for="option in event.duration" 
            :key="option.duration"
            :class="['duration-option', { active: selectedDuration === option.duration }]"
            @click="changeDuration(option.duration)"
          >
            {{ option.duration }} min
          </button>
        </div>
      </div>
    </div>
    
    <div class="time-slots-content">
      <!-- Loading state -->
      <div v-if="selectedDate && availableTimesForSelectedDate.includes('loading')" class="time-slots-loading">
        <div class="loader"></div>
        <p>Loading available times...</p>
      </div>
      
      <!-- No slots available -->
      <div v-else-if="selectedDate && availableTimesForSelectedDate.length === 0" class="no-slots-message">
        <p>There's no available times for this date</p>
      </div>
      
      <!-- No date selected -->
      <div v-else-if="!selectedDate" class="select-date-message">
        <p>Please select a date to view available time slots</p>
      </div>
      
      <!-- Time slots grid -->
      <div v-else class="time-slots-grid">
        <button 
          v-for="time in availableTimesForSelectedDate" 
          :key="time"
          :class="['time-slot-button', { selected: selectedTime === time }]"
          @click="selectTime(time)"
        >
          {{ formatTime(time) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-slots {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--background-0);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.time-slots-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.time-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-heading {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.format-toggle {
  background: var(--background-2);
  border: none;
  color: var(--text-primary);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  text-transform: uppercase;
}

.duration-selector {
  margin-top: 12px;
}

.duration-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.duration-option {
  padding: 6px 12px;
  background: var(--background-1);
  border: 1px solid var(--border);
  border-radius: 16px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.duration-option.active {
  background: var(--brand-blue);
  color: var(--white);
  border-color: var(--brand-blue);
}

.time-slots-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.time-slot-button {
  background-color: var(--background-1);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 4px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.time-slot-button:hover {
  background-color: var(--background-2);
}

.time-slot-button.selected {
  background-color: var(--brand-blue);
  border-color: var(--brand-blue);
  color: var(--white);
}

.time-slots-loading, 
.no-slots-message,
.select-date-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  height: 100%;
  color: var(--text-tertiary);
}

.time-slots-loading .loader {
  border: 3px solid var(--background-2);
  border-radius: 50%;
  border-top: 3px solid var(--brand-blue);
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>