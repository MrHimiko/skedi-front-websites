<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter  } from 'vue-router';
import { api } from '@utils/api';

// Import Components
import EventInfo from './components/EventInfo.vue';
import CalendarView from './components/CalendarView.vue';
import TimeSlots from './components/TimeSlots.vue';
import BookingForm from './components/BookingForm.vue';
import ConfirmationView from './components/ConfirmationView.vue';
import bookingDataService from './js/booking-data-service';

const route = useRoute();
const router = useRouter();
const organizationSlug = route.params.organizationSlug;
const eventSlug = route.params.eventSlug;

// Define view state (CALENDAR, FORM, CONFIRMATION)
const viewState = ref('CALENDAR');

// State variables
const loading = ref(true);
const error = ref(null);
const organization = ref(null);
const event = ref(null);
const availableSlots = ref({});
const selectedDate = ref(null);
const selectedTime = ref(null);
const selectedSlotData = ref(null);
const selectedDuration = ref(30);
const selectedTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone);

// Debouncing and caching variables
let fetchDebounceTimer = null;
const slotsCache = ref({});
const initialLoadComplete = ref(false);

// Add flag to track if we're loading from initial-load
const isInitialLoadData = ref(false);

// Create cache key generator
const getCacheKey = (date, duration, timezone) => {
    const dateStr = date.toISOString().split('T')[0];
    return `${dateStr}_${duration}_${timezone}`;
};

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
    const availability = [];
    
    // Check next 30 days for availability
    const today = new Date();
    const currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek];
        
        // Check if this day is enabled in the schedule
        const daySchedule = event.value.schedule[dayName];
        const isEnabled = daySchedule && daySchedule.enabled === true;
        
        // Check if we have slots data for this date
        const hasSlots = availableSlots.value[dateStr] && availableSlots.value[dateStr].length > 0;
        
        availability.push({
            date: new Date(currentDate),
            available: isEnabled || hasSlots
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
    console.log('=== handleDateSelected START ===');
    console.log('Called with date:', date.toISOString().split('T')[0]);
    console.log('initialLoadComplete:', initialLoadComplete.value);
    console.log('Current selectedDate:', selectedDate.value?.toISOString().split('T')[0]);
    console.log('availableSlots:', Object.keys(availableSlots.value));
    
    // Log the call stack to see where this is being called from
    console.trace('handleDateSelected call stack');
    
    // Skip if initial load is not complete yet
    if (!initialLoadComplete.value) {
        console.log('SKIPPING - initial load not complete');
        return;
    }
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if this is the same date that's already selected and has slots
    if (selectedDate.value && isSameDay(selectedDate.value, date)) {
        if (availableSlots.value[dateStr] && availableSlots.value[dateStr].length > 0) {
            console.log('SKIPPING - Same date already has slots');
            return;
        }
    }
    
    // Check if we already have slots for this date
    if (availableSlots.value[dateStr] && 
        availableSlots.value[dateStr].length > 0 && 
        !availableSlots.value[dateStr].includes('loading')) {
        console.log('SKIPPING - Slots already available for this date');
        selectedDate.value = date;
        return;
    }
    
    console.log('PROCEEDING to update selected date and fetch slots');
    selectedDate.value = date;
    
    // Clear any pending fetch
    if (fetchDebounceTimer) {
        clearTimeout(fetchDebounceTimer);
    }
    
    // Debounce the API call
    fetchDebounceTimer = setTimeout(async () => {
        console.log('=== DEBOUNCED fetchAvailableSlotsForDate CALL ===');
        await fetchAvailableSlotsForDate(date);
    }, 100);
};


// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
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
    slotsCache.value = {}; // Clear all cache
    
    // If a date is already selected, reload slots with new duration
    if (selectedDate.value) {
        fetchAvailableSlotsForDate(selectedDate.value);
    }
};

// Handle timezone change
const handleTimezoneChanged = (timezone) => {
    selectedTimezone.value = timezone;
    bookingData.value.timezone = timezone;
    slotsCache.value = {}; // Clear all cache
    
    // If a date is already selected, reload slots with new timezone
    if (selectedDate.value) {
        fetchAvailableSlotsForDate(selectedDate.value);
    }
};

// Handle form submission
const bookingResponse = ref(null);
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
            // Store booking response data
            bookingResponse.value = response.data;
            console.log('Booking created successfully:', response.data);
            
            // Redirect to manage booking page if token exists
            if (response.data.booking_token) {
                router.push(`/manage/${response.data.booking_token}`);
            } else {
                // Fallback to old confirmation view if no token
                viewState.value = 'CONFIRMATION';
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

// Helper function to fetch available slots for a specific date with caching
const fetchAvailableSlotsForDate = async (date) => {
    try {
        const formattedDate = date.toISOString().split('T')[0];
        let durationValue = selectedDuration.value || 30;
        
        // Check cache first
        const cacheKey = getCacheKey(date, durationValue, selectedTimezone.value);
        if (slotsCache.value[cacheKey]) {
            console.log(`Using cached slots for ${formattedDate}`);
            availableSlots.value = slotsCache.value[cacheKey];
            return availableSlots.value;
        }
        
        // Show loading state
        const loadingSlots = {};
        loadingSlots[formattedDate] = ['loading'];
        availableSlots.value = loadingSlots;
        
        console.log(`Fetching slots for date: ${formattedDate}, duration: ${durationValue}, timezone: ${selectedTimezone.value}`);

        // Get available slots for the specific date using the service
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
        let slots = {};
        if (slotsResponse.data && slotsResponse.data.slots && Array.isArray(slotsResponse.data.slots)) {
            // New API format - slots property with objects containing start/end times
            slots[formattedDate] = slotsResponse.data.slots;
        } else {
            // Old API format or simple array of times
            const availableTimes = Array.isArray(slotsResponse.data) ? slotsResponse.data : [];
            slots[formattedDate] = availableTimes;
        }
        
        // Cache the result
        slotsCache.value[cacheKey] = slots;
        availableSlots.value = slots;
        
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
const calendarReady = ref(false);

// Fetch event data AND initial slots with combined endpoint
const fetchEventData = async () => {
    try {
        loading.value = true;
        error.value = null;
        
        // Try the combined initial-load endpoint first
        try {
            const response = await api.get(
                `public/organizations/${organizationSlug}/events/${eventSlug}/initial-load?timezone=${encodeURIComponent(selectedTimezone.value)}&duration=${selectedDuration.value}`
            );
            
            if (response.success && response.data.event && response.data.initial_slots) {
                console.log('Using combined initial-load endpoint');
                
                // Extract event data
                event.value = response.data.event;
                
                // Set initial selected duration
                if (event.value?.duration?.length > 0) {
                    selectedDuration.value = event.value.duration[0].duration;
                }
                
                // Set organization data
                organization.value = {
                    id: event.value.organization_id,
                    slug: organizationSlug,
                    name: event.value.organization_name || organizationSlug
                };
                
                // Set initial available slots if provided
                if (response.data.initial_slots && response.data.initial_slots.date) {
                    const initialDate = new Date(response.data.initial_slots.date + 'T12:00:00');
                    selectedDate.value = initialDate;
                    
                    // Set the slots
                    const slots = {};
                    slots[response.data.initial_slots.date] = response.data.initial_slots.slots;
                    availableSlots.value = slots;
                    
                    // Cache the initial slots
                    const cacheKey = getCacheKey(
                        initialDate, 
                        parseInt(response.data.initial_slots.duration), 
                        response.data.initial_slots.timezone
                    );
                    slotsCache.value[cacheKey] = slots;
                    
                    console.log('Initial load complete - date and slots pre-loaded');
                }
                
                loading.value = false;
                initialLoadComplete.value = true;
                // Now allow CalendarView to mount
                calendarReady.value = true;
                
                return; // Successfully loaded with combined endpoint
            }
        } catch (combinedError) {
            console.log('Combined endpoint not available, falling back to separate calls');
        }
        
        // Fallback: Use separate API calls
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
        
        // Set organization data
        organization.value = {
            id: event.value.organization_id,
            slug: organizationSlug,
            name: event.value.organization_name || organizationSlug
        };
        
        loading.value = false;
        initialLoadComplete.value = true;
        // Allow CalendarView to mount and auto-select in fallback mode
        calendarReady.value = true;
        
    } catch (err) {
        console.error('Error fetching data:', err);
        error.value = err.message || 'An error occurred';
        loading.value = false;
        initialLoadComplete.value = true;
        calendarReady.value = true; // Allow mounting even on error
    }
};


// Call the fetch function
fetchEventData();
</script>

<!-- KEEP YOUR ORIGINAL TEMPLATE AND STYLES EXACTLY AS THEY ARE -->
<template>
    <div class="event-page">
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
                        v-if="calendarReady && event"
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
            
            <!-- Booking form view -->
            <div v-if="viewState === 'FORM'" class="booking-form-container">
                <BookingForm 
                    :event="event"
                    :organization="organization"
                    :selectedDate="selectedDate"
                    :selectedTime="selectedTime"
                    :selectedSlot="selectedSlotData"
                    :duration="selectedDuration"
                    :timezone="selectedTimezone"
                    @submit="handleFormSubmit"
                    @back="handleBackToCalendar"
                />
            </div>
            
            <!-- Confirmation view -->
            <div v-if="viewState === 'CONFIRMATION'" class="confirmation-container">
                <ConfirmationView 
                    :event="event"
                    :organization="organization"
                    :bookingData="bookingData"
                    :selectedDate="selectedDate"
                    :selectedTime="selectedTime"
                    :duration="selectedDuration"
                    :timezone="selectedTimezone"
                    :booking="bookingResponse"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.event-page {
    min-height: 100vh;
    background-color: var(--background-1);
}

/* Loading state */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 40px;
}

.loader {
    border: 3px solid var(--background-3);
    border-radius: 50%;
    border-top: 3px solid var(--brand-blue);
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-container p {
    color: var(--text-secondary);
    font-size: 16px;
}

/* Error state */
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 40px;
    text-align: center;
}

.error-container h2 {
    color: var(--text-primary);
    margin-bottom: 16px;
}

.error-container p {
    color: var(--text-secondary);
    margin-bottom: 24px;
    max-width: 500px;
}

.error-container button {
    background-color: var(--brand-blue);
    color: var(--white);
    border: none;
    padding: 10px 24px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.error-container button:hover {
    background-color: var(--brand-blue-dark);
}

/* Main booking content */
.booking-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
}

/* Booking grid layout */
.booking-grid {
    display: grid;
    grid-template-columns: 250px 1fr 250px ;
    gap: 24px;
    height: calc(100vh - 48px);
    min-height: 600px;
}

.booking-column {
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* Form and confirmation containers */
.booking-form-container,
.confirmation-container {
    max-width: 800px;
    margin: 0 auto;
}



@media (max-width: 991px) {
    .booking-grid {
        grid-template-columns: 1fr;
        height: auto;
        min-height: 0;
    }
    
    .booking-column {
        max-height: none;
    }
    
    .calendar-column {
        order: 2;
    }
    
    .time-slots-column {
        order: 3;
        min-height: 400px;
    }
    
    .event-info-column {
        order: 1;
    }
}

@media (max-width: 640px) {
    .booking-content {
        padding: 16px;
    }
    
    .booking-grid {
        gap: 12px;
    }
}
</style>