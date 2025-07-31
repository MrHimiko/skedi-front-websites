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
    },
    calendarAvailability: {
        type: Array,
        default: () => []
    },
    timezone: {
        type: String,
        default: ''
    },
    // ADD THIS NEW PROP
    skipAutoSelect: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['dateSelected']);

// Current month being viewed
const currentMonth = ref(new Date());

// Flag to prevent duplicate initialization
const isInitialized = ref(false);

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
        // Create a fixed date at noon to avoid timezone issues
        const fixedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            12 // Set to noon to avoid timezone issues
        );
        
        // Check if this day is available based on the calendarAvailability prop
        let hasSlots = hasAvailableSlots(date);
        
        const dayObj = {
            day: date.getDate(),
            date: fixedDate,
            isToday: isToday(date),
            hasSlots: hasSlots
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

// Check if a date has available slots based on calendarAvailability
function hasAvailableSlots(date) {
    // First check if the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
        return false;
    }
    
    // Check in calendarAvailability if we have data for this date
    const matchingAvailability = props.calendarAvailability.find(item => {
        return item.date && 
               item.date.getDate() === date.getDate() &&
               item.date.getMonth() === date.getMonth() &&
               item.date.getFullYear() === date.getFullYear();
    });
    
    if (matchingAvailability) {
        return matchingAvailability.available;
    }
    
    // If no specific availability info, check the schedule directly
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
    
    console.log('=== CalendarView selectDate START ===');
    console.log('Selecting date:', date.toISOString().split('T')[0]);
    console.log('props.selectedDate:', props.selectedDate?.toISOString().split('T')[0]);
    console.log('props.skipAutoSelect:', props.skipAutoSelect);
    
    // Create a fixed date at noon to avoid timezone issues
    const selectedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12
    );
    
    // Check if this day is enabled in the schedule
    if (hasAvailableSlots(selectedDate)) {
        console.log('CalendarView: EMITTING dateSelected');
        emit('dateSelected', selectedDate);
    } else {
        console.log('CalendarView: Date has no available slots');
    }
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

// Watch for timezone changes to update the calendar display
watch(() => props.timezone, () => {
    // No additional action needed, the parent component handles availability calculation
});

// Select initial date on mount
// Complete onMounted function for CalendarView.vue
onMounted(() => {
    console.log('=== CalendarView onMounted START ===');
    console.log('isInitialized:', isInitialized.value);
    console.log('props.skipAutoSelect:', props.skipAutoSelect);
    console.log('props.selectedDate:', props.selectedDate);
    
    // Prevent duplicate initialization
    if (isInitialized.value) {
        console.log('Already initialized, returning');
        return;
    }
    isInitialized.value = true;
    
    // Add a small delay to ensure all props are properly set
    setTimeout(() => {
        console.log('=== CalendarView onMounted setTimeout ===');
        console.log('props.skipAutoSelect:', props.skipAutoSelect);
        console.log('props.selectedDate:', props.selectedDate);
        
        // If skipAutoSelect is true or there's already a selected date, just update the month view
        if (props.skipAutoSelect || props.selectedDate) {
            console.log('SKIPPING auto-select because:');
            console.log('- skipAutoSelect:', props.skipAutoSelect);
            console.log('- selectedDate exists:', !!props.selectedDate);
            
            if (props.selectedDate) {
                currentMonth.value = new Date(props.selectedDate);
                console.log('Updated currentMonth to:', currentMonth.value.toISOString().split('T')[0]);
            }
            return;
        }
        
        console.log('PROCEEDING with auto-select - no date pre-selected');
        
        // Only auto-select if no date is selected yet
        const today = new Date();
        console.log('Checking if today has slots:', today.toISOString().split('T')[0]);
        
        if (hasAvailableSlots(today)) {
            console.log('Today has available slots, selecting it');
            // Create a fixed version of today at noon
            const fixedToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                12
            );
            selectDate(fixedToday);
        } else {
            console.log('Today has no slots, looking for next available day');
            const nextAvailableDay = findNextAvailableDay(today);
            
            if (nextAvailableDay) {
                console.log('Found next available day:', nextAvailableDay.toISOString().split('T')[0]);
                selectDate(nextAvailableDay);
                
                // Update current month if next available day is in a different month
                if (nextAvailableDay.getMonth() !== today.getMonth() ||
                    nextAvailableDay.getFullYear() !== today.getFullYear()) {
                    currentMonth.value = new Date(nextAvailableDay);
                    console.log('Updated month view to:', currentMonth.value.toISOString().split('T')[0]);
                }
            } else {
                console.log('No available days found in the next 30 days');
            }
        }
    }, 0);
});


// Update the current month view when selected date changes
watch(() => props.selectedDate, (newDate) => {
    if (newDate) {
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
            
            <!-- Optional: Show current timezone -->
            <div v-if="timezone" class="calendar-timezone">
                {{ timezone }}
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
    position: relative;
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
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
}

.nav-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-button:hover {
    background-color: var(--background-2);
}

.nav-button i {
    font-size: 20px;
}

.calendar-timezone {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-tertiary);
    text-align: center;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: var(--border);
    padding: 1px;
    flex: 1;
}

.weekday-header {
    background-color: var(--background-0);
    padding: 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-tertiary);
}

.calendar-day {
    background-color: var(--background-0);
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
}

.calendar-day.empty {
    cursor: default;
}

.calendar-day.has-slots:hover {
    background-color: var(--background-1);
}

.calendar-day.selected {
    background-color: var(--brand-blue)!important;
}

.calendar-day.selected .day-number {
    color: var(--white);
}

.calendar-day.today .day-number {
    font-weight: 700;
}

.calendar-day.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.calendar-day.disabled:hover {
    background-color: var(--background-0);
}

.day-number {
    font-size: 14px;
    color: var(--text-primary);
}

.calendar-day.today::after {
    content: '';
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background-color: var(--brand-blue);
    border-radius: 50%;
}

.calendar-day.selected.today::after {
    background-color: var(--white);
}
</style>