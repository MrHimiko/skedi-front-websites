<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  selectedDate: {
    type: Date,
    default: null
  }
});

const emit = defineEmits(['dateSelected']);

// Current month being viewed
const currentMonth = ref(new Date());

// Compute the month and year label (e.g. "March 2025")
const monthYearLabel = computed(() => {
  const options = { month: 'long', year: 'numeric' };
  return currentMonth.value.toLocaleDateString('en-US', options);
});

// Days of the week labels
const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Compute days in the current month for display
const daysInMonth = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const date = new Date(year, month, 1);
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, date: null });
  }
  
  // Add days of the month
  while (date.getMonth() === month) {
    const dayObj = {
      day: date.getDate(),
      date: new Date(date),
      isToday: isToday(date),
      hasSlots: hasAvailableSlots(date)
    };
    days.push(dayObj);
    date.setDate(date.getDate() + 1);
  }
  
  return days;
});

// Navigate to previous month
function previousMonth() {
  const newMonth = new Date(currentMonth.value);
  newMonth.setMonth(newMonth.getMonth() - 1);
  currentMonth.value = newMonth;
}

// Navigate to next month
function nextMonth() {
  const newMonth = new Date(currentMonth.value);
  newMonth.setMonth(newMonth.getMonth() + 1);
  currentMonth.value = newMonth;
}

// Check if a date is today
function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// Check if a date has available slots based on the event schedule
function hasAvailableSlots(date) {
  // First check if the date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return false;
  }
  
  // Check if the day is enabled in the event schedule
  if (props.event && props.event.schedule) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    const daySchedule = props.event.schedule[dayName];
    
    // If this day has a schedule and is enabled, it's available
    return daySchedule && daySchedule.enabled === true;
  }
  
  // If there's no schedule info, default to allow any day
  return true;
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Select a date
function selectDate(date) {
  if (!date) return;
  
  // Check if this day is enabled in the schedule
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];
  const daySchedule = props.event.schedule && props.event.schedule[dayName];
  
  // If the day is disabled in the schedule, don't process it
  if (daySchedule && daySchedule.enabled === false) {
    console.log(`Day ${dayName} is disabled in the schedule`);
    return;
  }
  
  emit('dateSelected', date);
}

// Find next available day
function findNextAvailableDay(startDate) {
  const maxDaysToCheck = 30; // Limit search to prevent infinite loops
  const date = new Date(startDate);
  
  for (let i = 1; i <= maxDaysToCheck; i++) {
    date.setDate(date.getDate() + 1);
    if (hasAvailableSlots(date)) {
      return date;
    }
  }
  
  return null; // No available days found in the next 30 days
}

// Select initial date on mount
onMounted(() => {
  // If there's already a selected date, use that month
  if (props.selectedDate) {
    currentMonth.value = new Date(props.selectedDate);
  } else {
    // Otherwise, select today's date if it's available, or the next available day
    const today = new Date();
    
    if (hasAvailableSlots(today)) {
      selectDate(today);
    } else {
      const nextAvailableDay = findNextAvailableDay(today);
      if (nextAvailableDay) {
        selectDate(nextAvailableDay);
        // Update current month if next available day is in a different month
        if (nextAvailableDay.getMonth() !== today.getMonth() ||
            nextAvailableDay.getFullYear() !== today.getFullYear()) {
          currentMonth.value = new Date(nextAvailableDay);
        }
      }
    }
  }
});

// Update the current month view when selected date changes to a different month
watch(() => props.selectedDate, (newDate) => {
  if (newDate && 
     (newDate.getMonth() !== currentMonth.value.getMonth() || 
      newDate.getFullYear() !== currentMonth.value.getFullYear())) {
    currentMonth.value = new Date(newDate);
  }
});
</script>

<template>
  <div class="calendar-container">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="month-nav">
        <button @click="previousMonth" class="nav-button">
          <i class="material-icons-outlined">chevron_left</i>
        </button>
        <h2 class="month-label">{{ monthYearLabel }}</h2>
        <button @click="nextMonth" class="nav-button">
          <i class="material-icons-outlined">chevron_right</i>
        </button>
      </div>
    </div>
    
    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Weekday Headers -->
      <div v-for="day in weekdays" :key="day" class="weekday-header">
        {{ day }}
      </div>
      
      <!-- Calendar Days -->
      <div 
        v-for="(dayObj, index) in daysInMonth" 
        :key="index"
        :class="[
          'calendar-day', 
          { 'empty': !dayObj.day },
          { 'today': dayObj.isToday },
          { 'selected': selectedDate && dayObj.date && isSameDay(selectedDate, dayObj.date) },
          { 'has-slots': dayObj.hasSlots },
          { 'disabled': dayObj.day && !dayObj.hasSlots }
        ]"
        @click="dayObj.day && dayObj.hasSlots && selectDate(dayObj.date)"
      >
        <div class="day-number">{{ dayObj.day }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  background-color: var(--background-0);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
}

.calendar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.month-label {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: var(--text-primary);
}

.nav-button {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: var(--background-2);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--background-1);
  flex: 1;
  padding: 4px;
}

.weekday-header {
  text-align: center;
  padding: 12px 0;
  font-weight: 600;
  font-size: 12px;
  color: var(--text-tertiary);
}

.calendar-day {
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-0);
  cursor: pointer;
  position: relative;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.day-number {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary);
}

.empty {
  background-color: var(--background-1);
  cursor: default;
}

.today {
  border: 1px solid var(--brand-blue);
}

.selected {
  background-color: var(--brand-blue);
  border: none;
}

.selected .day-number {
  color: white;
  font-weight: 600;
}

.has-slots:hover {
  background-color: var(--background-2);
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--background-2);
  position: relative;
}

.disabled::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(0, 0, 0, 0.05) 5px,
    rgba(0, 0, 0, 0.05) 10px
  );
  pointer-events: none;
  border-radius: 4px;
}
</style>