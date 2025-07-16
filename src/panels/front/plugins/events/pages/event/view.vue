<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@utils/api';

// Import Components
import EventInfo from './components/EventInfo.vue';
import CalendarView from './components/CalendarView.vue';
import TimeSlots from './components/TimeSlots.vue';
import BookingForm from './components/BookingForm.vue';
import ConfirmationView from './components/ConfirmationView.vue';
import bookingDataService from './js/booking-data-service';

const route = useRoute();
const organizationSlug = route.params.organizationSlug;
const eventSlug = route.params.eventSlug;

// Check if embedded
const isEmbedded = computed(() => route.query.embedded === 'true');
const embedTheme = computed(() => route.query.theme || 'light');
const hideHeader = computed(() => route.query.hideHeader === 'true');

// Define view state (CALENDAR, FORM, CONFIRMATION)
const viewState = ref('CALENDAR');

// State variables
const loading = ref(true);
const error = ref(null);
const organization = ref(null);
const event = ref(null);
const availableSlots = ref(null);
const selectedDate = ref(null);
const selectedTime = ref(null);
const selectedSlotData = ref(null);
const selectedDuration = ref(30);
const selectedTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone);

// Height observer for embedded mode
let resizeObserver = null;

// Send height updates when embedded
const sendHeightUpdate = () => {
    if (isEmbedded.value && window.parent) {
        const height = document.body.scrollHeight;
        window.parent.postMessage({
            type: 'skedi-resize',
            height: height,
            widgetId: window.location.search
        }, '*');
    }
};

// Setup embedded mode
onMounted(() => {
    if (isEmbedded.value) {
        // Add embedded class to body
        document.body.classList.add('skedi-embedded');
        if (embedTheme.value === 'dark') {
            document.body.classList.add('skedi-dark-theme');
        }
        
        // Initial height update
        setTimeout(sendHeightUpdate, 100);
        
        // Watch for height changes
        resizeObserver = new ResizeObserver(sendHeightUpdate);
        resizeObserver.observe(document.body);
        
        // Also send height on view state changes
        watch(viewState, () => {
            setTimeout(sendHeightUpdate, 100);
        });
    }
});

// Cleanup
onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    if (isEmbedded.value) {
        document.body.classList.remove('skedi-embedded', 'skedi-dark-theme');
    }
});

// Calculate timezone difference in hours between UTC and selected timezone
const getTimezoneOffset = (timezone) => {
    // Create a date in UTC
    const date = new Date();
    
    // Get local time zone offset in minutes (timezone offset is in minutes and opposite sign of what we want)
    const localOffset = date.getTimezoneOffset();
    
    // Get the time string in the specified timezone
    const options = { 
        timeZone: timezone,
        hour: 'numeric', 
        minute: 'numeric',
        hour12: false
    };
    
    const timeString = date.toLocaleString('en-US', options);
    const [hour, minute] = timeString.split(':').map(Number);
    
    // Get the same time in UTC
    const utcHour = date.getUTCHours();
    const utcMinute = date.getUTCMinutes();
    
    // Calculate the difference in hours (accounting for day wrap)
    let hourDifference = hour - utcHour;
    if (hourDifference > 12) hourDifference -= 24;
    if (hourDifference < -12) hourDifference += 24;
    
    console.log(`Timezone ${timezone} is ${hourDifference} hours from UTC`);
    return hourDifference;
};

// Calendar availability with timezone consideration
const calendarAvailability = computed(() => {
    if (!event.value || !event.value.schedule) {
        return [];
    }
    
    // Current month being viewed
    const currentMonth = selectedDate.value ? new Date(selectedDate.value) : new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Today's date for disabling past days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get timezone offset in hours
    const timezoneOffset = getTimezoneOffset(selectedTimezone.value);
    
    // Array to hold days and their availability
    const availability = [];
    
    // For each day in the month
    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
        // Skip past dates
        if (currentDate < today) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }
        
        // Get day of week
        const dayOfWeek = currentDate.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        // Check if this day or adjacent days are enabled in the schedule
        let isAvailable = false;
        
        // Current day
        const currentDayName = dayNames[dayOfWeek];
        const currentDayEnabled = event.value.schedule[currentDayName]?.enabled === true;
        
        // Previous day (for positive timezone offset / behind UTC like USA)
        const prevDayIndex = (dayOfWeek - 1 + 7) % 7;
        const prevDayName = dayNames[prevDayIndex];
        const prevDayEnabled = event.value.schedule[prevDayName]?.enabled === true;
        
        // Next day (for negative timezone offset / ahead of UTC like Japan)
        const nextDayIndex = (dayOfWeek + 1) % 7;
        const nextDayName = dayNames[nextDayIndex];
        const nextDayEnabled = event.value.schedule[nextDayName]?.enabled === true;
        
        // If timezone is behind UTC (positive offset like USA)
        if (timezoneOffset > 0 && prevDayEnabled) {
            // Check if previous day has late hours that would be in the current day in timezone
            const prevDayEndTime = event.value.schedule[prevDayName]?.end_time;
            if (prevDayEndTime) {
                const [endHour] = prevDayEndTime.split(':').map(Number);
                if (endHour >= 24 - timezoneOffset) {
                    isAvailable = true;
                }
            } else {
                // If no end time specified, assume it's just enabled
                isAvailable = true;
            }
        }
        
        // If timezone is ahead of UTC (negative offset like Japan)
        if (timezoneOffset < 0 && nextDayEnabled) {
            // Check if next day has early hours that would be in the current day in timezone
            const nextDayStartTime = event.value.schedule[nextDayName]?.start_time;
            if (nextDayStartTime) {
                const [startHour] = nextDayStartTime.split(':').map(Number);
                if (startHour <= Math.abs(timezoneOffset)) {
                    isAvailable = true;
                }
            } else {
                // If no start time specified, assume it's just enabled
                isAvailable = true;
            }
        }
        
        // The current day's schedule
        if (currentDayEnabled) {
            isAvailable = true;
        }
        
        availability.push({
            date: new Date(currentDate),
            available: isAvailable
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availability;
});

// Booking data
const bookingData = ref({
    name: '',
    email: '',
    notes: '',
    guests: [],
    timezone: selectedTimezone.value
});

// Handle date selection
const handleDateSelected = async (date) => {
    selectedDate.value = date;
    await fetchAvailableSlotsForDate(date);
};

// Handle time selection
const handleTimeSelected = (time, fullSlot = null) => {
    selectedTime.value = time;
    
    if (fullSlot) {
        selectedSlotData.value = fullSlot;
    } else {
        selectedSlotData.value = null;
    }
    
    viewState.value = 'FORM';
};

// Handle duration change
const handleDurationChanged = (duration) => {
    selectedDuration.value = duration;
    
    // If a date is already selected, reload slots with new duration
    if (selectedDate.value) {
        fetchAvailableSlotsForDate(selectedDate.value);
    }
};

// Handle timezone change
const handleTimezoneChanged = (timezone) => {
    selectedTimezone.value = timezone;
    bookingData.value.timezone = timezone;
    
    // If a date is already selected, reload slots with new timezone
    if (selectedDate.value) {
        fetchAvailableSlotsForDate(selectedDate.value);
    }
};

// Handle form submission
const handleFormSubmit = async (formData) => {
    // Add timezone and slot data to the form data
    formData.timezone = selectedTimezone.value;
    formData.slotData = selectedSlotData.value;
    bookingData.value = formData;
    
    // Show loading state
    loading.value = true;
    error.value = null;
    
    try {

        const response = await bookingDataService.createBooking(
            formData,
            event.value.id,
            organization.value.id
        );
        
        if (response.success) {
            // Store booking response data if needed
            console.log('Booking created successfully:', response.data);
            
            // Transition to confirmation view
            viewState.value = 'CONFIRMATION';
            
            // Notify parent window if embedded
            if (isEmbedded.value && window.parent) {
                window.parent.postMessage({
                    type: 'skedi-booking-complete',
                    bookingData: response.data,
                    widgetId: window.location.search
                }, '*');
            }
        } else {
            // Handle API error with more details
            console.error('API Error:', response);
            if (typeof response.message === 'object') {
                // Handle structured error messages
                const errorMessages = [];
                for (const key in response.message) {
                    errorMessages.push(`${key}: ${response.message[key]}`);
                }
                error.value = errorMessages.join('\n');
            } else {
                error.value = response.message || 'Failed to create booking. Please try again.';
            }
        }
    } catch (err) {
        console.error('Error creating booking:', err);
        error.value = err.message || 'An unexpected error occurred. Please try again.';
    } finally {
        loading.value = false;
    }
};

// Go back to calendar view
const handleBackToCalendar = () => {
    viewState.value = 'CALENDAR';
    selectedTime.value = null;
};

// Helper function to fetch available slots for a specific date
const fetchAvailableSlotsForDate = async (date) => {
    try {
        // Show loading state
        const formattedDate = date.toISOString().split('T')[0];
        const loadingSlots = {};
        loadingSlots[formattedDate] = ['loading'];
        availableSlots.value = loadingSlots;
        
        // Get the duration value
        let durationValue = selectedDuration.value || 30;
        
        console.log(`Fetching slots for date: ${formattedDate}, duration: ${durationValue}, timezone: ${selectedTimezone.value}`);

        // Get available slots for the specific date
        const slotsResponse = await bookingDataService.getAvailableSlots(
            eventSlug, 
            organizationSlug, 
            date, 
            durationValue, 
            selectedTimezone.value
        );
        
        if (!slotsResponse.success) {
            throw new Error(slotsResponse.message || 'Failed to fetch available slots');
        }
        
        // Process the API response
        if (slotsResponse.data && slotsResponse.data.slots && Array.isArray(slotsResponse.data.slots)) {
            // New API format - slots property with objects containing start/end times
            const slots = {};
            slots[formattedDate] = slotsResponse.data.slots;
            availableSlots.value = slots;
        } else {
            // Old API format or simple array of times
            const availableTimes = Array.isArray(slotsResponse.data) ? slotsResponse.data : [];
            
            // Structure the slots in a format the calendar component expects
            const slots = {};
            slots[formattedDate] = availableTimes;
            availableSlots.value = slots;
        }
        
        return availableSlots.value;
    } catch (err) {
        console.error('Error fetching slots for date:', err);
        
        // In case of error, set empty slots for the date
        const formattedDate = date.toISOString().split('T')[0];
        const slots = {};
        slots[formattedDate] = [];
        availableSlots.value = slots;
        
        return {};
    }
};

// Fetch event data on component mount
const fetchEventData = async () => {
    try {
        loading.value = true;
        error.value = null;
        
        // Get event details using the public endpoint
        const eventResponse = await api.get(`public/organizations/${organizationSlug}/events/${eventSlug}`);
        
        if (!eventResponse.success) {
            throw new Error(eventResponse.message || 'Failed to fetch event details');
        }
        
        // The event is directly in the data property
        event.value = eventResponse.data;
        
        // Set initial selected duration
        if (event.value?.duration?.length > 0) {
            selectedDuration.value = event.value.duration[0].duration;
        }
        
        // For organization, we can use the name from the URL slug until we need more details
        organization.value = {
            id: event.value.organization_id,
            slug: organizationSlug,
            name: event.value.organization_name || organizationSlug
        };
        
        loading.value = false;
    } catch (err) {
        console.error('Error fetching data:', err);
        error.value = err.message || 'An error occurred';
        loading.value = false;
    }
};

// Call the fetch function
fetchEventData();
</script>

<template>
    <div class="event-page" :class="{ 'embedded': isEmbedded, 'dark-theme': embedTheme === 'dark' }">
        <!-- Loading and error states -->
        <div v-if="loading" class="loading-container">
            <div class="loader"></div>
            <p>Loading event information...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
            <h2>Something went wrong</h2>
            <p>{{ error }}</p>
            <button @click="fetchEventData">Retry</button>
        </div>
        
        <!-- Main content when loaded -->
        <div v-else class="booking-content">
            <!-- Calendar view (default) -->
            <div v-if="viewState === 'CALENDAR'" class="booking-grid">
                <!-- Left column: Event Info -->
                <div class="booking-column event-info-column">
                    <EventInfo 
                        :event="event" 
                        :organization="organization"
                        :selectedDate="selectedDate"
                        :selectedTime="selectedTime"
                        :duration="selectedDuration"
                        :timezone="selectedTimezone"
                    />
                </div>
                
                <!-- Middle column: Calendar -->
                <div class="booking-column calendar-column">
                    <CalendarView 
                        :event="event"
                        @dateSelected="handleDateSelected"
                        :selectedDate="selectedDate"
                        :calendarAvailability="calendarAvailability"
                        :timezone="selectedTimezone"
                    />
                </div>
                
                <!-- Right column: Time Slots -->
                <div class="booking-column time-slots-column">
                    <TimeSlots 
                        :availableSlots="availableSlots"
                        :selectedDate="selectedDate"
                        :selectedTime="selectedTime"
                        :event="event"
                        @timeSelected="handleTimeSelected"
                        @durationChanged="handleDurationChanged"
                        @timezoneChanged="handleTimezoneChanged"
                    />
                </div>
            </div>
            
            <!-- Booking form -->
            <div v-else-if="viewState === 'FORM'" class="booking-form-container">
                <BookingForm
                    :event="event"
                    :organization="organization"
                    :selectedDate="selectedDate"
                    :selectedTime="selectedTime"
                    :duration="selectedDuration"
                    :timezone="selectedTimezone"
                    @submit="handleFormSubmit"
                    @back="handleBackToCalendar"
                />
            </div>
            
            <!-- Confirmation view -->
            <div v-else-if="viewState === 'CONFIRMATION'" class="confirmation-container">
                <ConfirmationView
                    :event="event"
                    :organization="organization"
                    :selectedDate="selectedDate"
                    :selectedTime="selectedTime"
                    :duration="selectedDuration"
                    :timezone="selectedTimezone"
                    :bookingData="bookingData"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.event-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--background-1);
    color: var(--text-primary);
    padding: 20px;
}

/* Embedded mode styles */
.event-page.embedded {
    min-height: auto;
    padding: 0;
    background-color: transparent;
}

.event-page.embedded .booking-content {
    max-width: 100%;
}

/* Dark theme support */
.event-page.dark-theme {
    background-color: #1a1a1a;
    color: #ffffff;
}

.event-page.dark-theme .booking-column {
    background-color: #2a2a2a;
    border-color: #3a3a3a;
}

.loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
}

.loader {
    border: 3px solid var(--background-2);
    border-radius: 50%;
    border-top: 3px solid var(--brand-blue);
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.booking-content {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.booking-grid {
    display: grid;
    grid-template-columns: 300px 1fr 250px;
    gap: 20px;
    min-height: 600px;
}

.booking-column {
    background-color: var(--background-0);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border);
}

.event-info-column {
    padding: 20px;
}

.calendar-column {
    max-height: 600px;
}

.time-slots-column {
    max-height: 600px;
    overflow-y: auto;
}

.booking-form-container,
.confirmation-container {
    background-color: var(--background-0);
    border-radius: 8px;
    padding: 30px;
    max-width: 900px;
    margin: 0 auto;
}

/* Mobile responsiveness */
@media (max-width: 1024px) {
    .booking-grid {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 15px;
    }
    
    .booking-column {
        max-height: none;
    }
}

/* Button styling */
button {
    background-color: var(--brand-blue);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
}

button:hover {
    background-color: #1a73e8;
}

/* Error styling */
.error-container h2 {
    color: var(--red-default);
    margin-bottom: 8px;
}

.error-container p {
    color: var(--text-secondary);
    margin-bottom: 20px;
}
</style>

<style>
/* Global styles for embedded mode - not scoped */
body.skedi-embedded {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow-x: hidden !important;
}

body.skedi-embedded .header-navigation,
body.skedi-embedded .footer,
body.skedi-embedded .sidebar {
    display: none !important;
}

body.skedi-dark-theme {
    background-color: #1a1a1a !important;
    color: #ffffff !important;
}
</style>