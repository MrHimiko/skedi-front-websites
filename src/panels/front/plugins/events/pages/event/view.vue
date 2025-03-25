<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@utils/api';

// Import Components
import EventInfo from './components/EventInfo.vue';
import CalendarView from './components/CalendarView.vue';
import TimeSlots from './components/TimeSlots.vue';
import BookingForm from './components/BookingForm.vue';
import ConfirmationView from './components/ConfirmationView.vue';

const route = useRoute();
const organizationSlug = route.params.organizationSlug;
const eventSlug = route.params.eventSlug;

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
const selectedDuration = ref(30);

// Booking data
const bookingData = ref({
  name: '',
  email: '',
  notes: '',
  guests: []
});

// Handle date selection
const handleDateSelected = async (date) => {
  selectedDate.value = date;
  await fetchAvailableSlotsForDate(date);
};

// Handle time selection
const handleTimeSelected = (time) => {
  selectedTime.value = time;
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

// Handle form submission
const handleFormSubmit = (formData) => {
  bookingData.value = formData;
  
  // Here you would typically call your API to save the booking
  // For now, just transition to confirmation view
  viewState.value = 'CONFIRMATION';
  
  // In the future, you would do something like:
  /*
  api.post('bookings', {
    organizationId: organization.value.id,
    eventId: event.value.id,
    date: selectedDate.value.toISOString().split('T')[0],
    time: selectedTime.value,
    duration: selectedDuration.value,
    ...formData
  }).then(() => {
    viewState.value = 'CONFIRMATION';
  }).catch(err => {
    error.value = err.message;
  });
  */
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
    
    // Check if this day is enabled in the schedule
    if (event.value && event.value.schedule) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[date.getDay()];
      const daySchedule = event.value.schedule[dayName];
      
      // If the day is disabled in the schedule, return empty slots
      if (daySchedule && daySchedule.enabled === false) {
        console.log(`Day ${dayName} is disabled in the schedule - not fetching slots`);
        const slots = {};
        slots[formattedDate] = [];
        availableSlots.value = slots;
        return slots;
      }
    }
    
    // Get the duration value
    let durationValue = selectedDuration.value || 30;
    
    console.log(`Fetching slots for date: ${formattedDate}, duration: ${durationValue}`);
    
    // Get available slots for the specific date
    const slotsResponse = await api.get(
      `public/organizations/${organizationSlug}/events/${eventSlug}/available-slots?date=${formattedDate}&duration=${durationValue}`
    );
    
    if (!slotsResponse.success) {
      throw new Error(slotsResponse.message || 'Failed to fetch available slots');
    }
    
    // Process the slots to extract the time part from the datetime
    // The API returns an array of objects with start and end properties
    const availableTimes = slotsResponse.data.map(slot => {
      // Extract just the time part from the datetime string
      // Format: "2025-03-20 09:00:00" -> "09:00"
      let startTime;
      
      if (typeof slot === 'string') {
        // If the slot is already a string, use it directly
        startTime = slot;
      } else if (slot.start) {
        // If it's an object with a start property
        const timePart = slot.start.split(' ')[1];
        startTime = timePart ? timePart.substring(0, 5) : '00:00';
      } else {
        // Fallback for unexpected format
        startTime = '00:00';
      }
      
      return startTime;
    });
    
    console.log('Available times:', availableTimes);
    
    // Structure the slots in a format the calendar component expects
    const slots = {};
    slots[formattedDate] = availableTimes;
    availableSlots.value = slots;
    
    return slots;
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
          />
        </div>
        
        <!-- Middle column: Calendar -->
        <div class="booking-column calendar-column">
          <CalendarView 
            :event="event"
            @dateSelected="handleDateSelected"
            :selectedDate="selectedDate"
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
  max-width: 800px;
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