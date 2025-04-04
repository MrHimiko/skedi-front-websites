<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import InputComponent from '@form/input/view.vue';
import SelectComponent from '@form/select/view.vue';

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

const emit = defineEmits(['timeSelected', 'durationChanged', 'timezoneChanged']);

// Time format (12h or 24h)
const timeFormat = ref('12h');

// Get the currently selected duration
const selectedDuration = ref(30);

// User's timezone - make sure it's initialized to a valid value
const userTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

// List of popular timezones
const timezones = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'Europe/Budapest (Central European Time)', value: 'Europe/Budapest' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'Europe/Paris (Central European Time)', value: 'Europe/Paris' },
  { label: 'Europe/Berlin (Central European Time)', value: 'Europe/Berlin' },
  { label: 'Europe/Moscow (Moscow Time)', value: 'Europe/Moscow' },
  { label: 'America/New_York (Eastern Time)', value: 'America/New_York' },
  { label: 'America/Chicago (Central Time)', value: 'America/Chicago' },
  { label: 'America/Denver (Mountain Time)', value: 'America/Denver' },
  { label: 'America/Los_Angeles (Pacific Time)', value: 'America/Los_Angeles' },
  { label: 'Asia/Tokyo (Japan Standard Time)', value: 'Asia/Tokyo' },
  { label: 'Asia/Shanghai (China Standard Time)', value: 'Asia/Shanghai' },
  { label: 'Australia/Sydney (Australian Eastern Time)', value: 'Australia/Sydney' },
];

// Set initial duration based on event data
if (props.event && props.event.duration && props.event.duration.length > 0) {
  selectedDuration.value = props.event.duration[0].duration;
}

// Function to convert a UTC time to the selected timezone
// Enhanced time conversion function that tracks day changes
function convertUtcToTimezone(utcHours, utcMinutes, timezoneValue) {
  try {
    const timezone = timezoneValue || 'UTC';
    
    // Create a UTC date for the selected day with the given time
    const utcDate = new Date(Date.UTC(
      props.selectedDate.getFullYear(),
      props.selectedDate.getMonth(),
      props.selectedDate.getDate(),
      utcHours,
      utcMinutes
    ));
    
    // Store the UTC day for comparison
    const utcDay = utcDate.getUTCDate();
    
    // Format with the target timezone to get the local time
    const options = { 
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    
    // Get the full datetime string in the target timezone
    const localDateTimeStr = utcDate.toLocaleString('en-US', options);
    
    // Split into date and time
    const [datePart, timePart] = localDateTimeStr.split(', ');
    const [localMonth, localDay, localYear] = datePart.split('/').map(Number);
    const [localHours, localMinutes] = timePart.split(':').map(Number);
    
    // Create a date object for the local date to check day difference
    const localDate = new Date(localYear, localMonth - 1, localDay);
    const selectedDate = new Date(props.selectedDate);
    
    // Check if the day has changed
    const dayDifference = Math.floor(
      (localDate - new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())) 
      / (24 * 60 * 60 * 1000)
    );
    
    console.log(`Converting ${utcHours}:${utcMinutes} UTC to ${timezone}: ${localHours}:${localMinutes} (day diff: ${dayDifference})`);
    
    return {
      hour: localHours,
      minute: localMinutes,
      dayDifference
    };
  } catch (err) {
    console.error('Error in time conversion:', err);
    return { hour: utcHours, minute: utcMinutes, dayDifference: 0 };
  }
}

// Compute available time slots for selected date with timezone conversion
// Compute available time slots for selected date with timezone conversion
const availableTimesForSelectedDate = computed(() => {
  if (!props.selectedDate || !props.availableSlots) return [];
  
  const dateStr = props.selectedDate.toISOString().split('T')[0];
  const slots = props.availableSlots[dateStr] || [];
  
  if (slots.includes('loading')) return slots;
  
  // Get a valid timezone value
  const timezone = userTimezone.value || 'UTC';
  console.log('Current timezone for conversion:', timezone);
  
  // Convert UTC times to selected timezone
  return slots.map(timeString => {
    if (timeString === 'loading') return timeString;
    
    try {
      // Parse the time string (e.g., "09:30")
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Convert the time
      const localTime = convertUtcToTimezone(hours, minutes, timezone);
      
      // Format the time string
      const formattedTime = `${String(localTime.hour).padStart(2, '0')}:${String(localTime.minute).padStart(2, '0')}`;
      
      // Return object with time and display properties
      return {
        time: formattedTime,
        displayTime: formattedTime + (localTime.dayDifference > 0 ? ' (+1)' : (localTime.dayDifference < 0 ? ' (-1)' : '')),
        dayDifference: localTime.dayDifference,
        rawTime: timeString // Original UTC time
      };
    } catch (err) {
      console.error('Error converting time zone:', err, timeString);
      return {
        time: timeString,
        displayTime: timeString,
        dayDifference: 0,
        rawTime: timeString
      };
    }
  })
  .sort((a, b) => {
    // Sort by day difference first, then by time
    if (a.dayDifference !== b.dayDifference) {
      return a.dayDifference - b.dayDifference;
    }
    // For same day, sort by time
    return a.time.localeCompare(b.time);
  });
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
function selectTime(slot) {
  // If slot is a string (from the old format), use it directly
  const timeValue = typeof slot === 'string' ? slot : slot.time;
  emit('timeSelected', timeValue);
}

// Update the duration
function changeDuration(duration) {
  selectedDuration.value = duration;
  emit('durationChanged', duration);
}

// Update the timezone
function changeTimezone(event, value) {
  console.log('Timezone dropdown changed to:', value);
  userTimezone.value = value || 'UTC';
  emit('timezoneChanged', userTimezone.value);
  
  // Force the component to re-render by triggering a state update
  // This will make the computed property re-evaluate
  const temp = timeFormat.value;
  timeFormat.value = 'updating';
  setTimeout(() => {
    timeFormat.value = temp;
  }, 0);
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

// Set initial timezone
onMounted(() => {
  console.log('Component mounted, detected timezone:', userTimezone.value);
  emit('timezoneChanged', userTimezone.value);
});

// Watch for changes to userTimezone
watch(userTimezone, (newTimezone) => {
  console.log('Timezone watch triggered:', newTimezone);
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
      
      <!-- Timezone selector -->
      <div class="timezone-selector">
        <label>Timezone</label>
        <select v-model="userTimezone" @change="(e) => changeTimezone(e, e.target.value)" class="timezone-select">
          <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
            {{ tz.label }}
          </option>
        </select>
      </div>
      
      <!-- Current timezone debugging info -->
      <div class="current-timezone">
        Current timezone: {{ userTimezone }}
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
            v-for="slot in availableTimesForSelectedDate" 
            :key="slot.time"
            :class="['time-slot-button', { 
              'selected': selectedTime === slot.time,
              'next-day': slot.dayDifference > 0,
              'previous-day': slot.dayDifference < 0
            }]"
            @click="selectTime(slot.time)"
          >
            {{ formatTime(slot.time) }}
            <span v-if="slot.dayDifference !== 0" class="day-indicator">
              {{ slot.dayDifference > 0 ? '(next day)' : '(previous day)' }}
            </span>
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

.time-slot-button .day-indicator {
  display: inline-block;
  font-size: 11px;
  color: var(--text-tertiary);
  margin-left: 4px;
}

.time-slot-button.next-day {
  border-left: 3px solid #3b82f6; 
}

.time-slot-button.previous-day {
  border-left: 3px solid #8b5cf6; 
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

.timezone-selector {
  margin-top: 12px;
  margin-bottom: 12px;
}

.timezone-selector label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
}

.timezone-select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background-color: var(--background-1);
  color: var(--text-primary);
  font-size: 14px;
}

.current-timezone {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
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