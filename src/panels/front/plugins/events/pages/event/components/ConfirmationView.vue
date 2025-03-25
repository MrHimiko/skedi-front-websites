<script setup>
import { computed } from 'vue';
import ButtonComponent from '@form/button/view.vue';

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
    required: true
  },
  selectedTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  bookingData: {
    type: Object,
    required: true
  }
});

// Format date to display (e.g. "Friday, March 21, 2025")
const formattedDate = computed(() => {
  return props.selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
});

// Format time range (e.g. "11:30 AM - 12:00 PM")
const formattedTime = computed(() => {
  // Parse the start time (e.g., "11:30")
  const [startHour, startMinute] = props.selectedTime.split(':').map(Number);
  
  // Calculate end time by adding duration
  const endMinutes = startHour * 60 + startMinute + props.duration;
  const endHour = Math.floor(endMinutes / 60) % 24;
  const endMinute = endMinutes % 60;
  
  // Format both times with AM/PM
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
  };
  
  const formattedStart = formatTime(startHour, startMinute);
  const formattedEnd = formatTime(endHour, endMinute);
  
  return `${formattedStart} - ${formattedEnd}`;
});

// Format timezone
const formattedTimezone = computed(() => {
  return props.event.timezone || 'Central European Standard Time';
});

// Current date in ISO format for the <time> element
const isoDate = computed(() => {
  return props.selectedDate.toISOString();
});

// Additional functions to handle calendar actions (to be implemented)
function addToGoogleCalendar() {
  // Implementation for adding to Google Calendar
  window.open(generateGoogleCalendarUrl(), '_blank');
}

function addToOutlookCalendar() {
  // Implementation for adding to Outlook
  window.open(generateOutlookCalendarUrl(), '_blank');
}

function addToOffice365Calendar() {
  // Implementation for adding to Office 365
  window.open(generateOffice365CalendarUrl(), '_blank');
}

function downloadICS() {
  // Implementation for downloading .ics file
  const icsFileUrl = generateICSUrl();
  
  // Create and trigger download
  const link = document.createElement('a');
  link.href = icsFileUrl;
  link.download = `${props.event.name.replace(/\s+/g, '-')}-${props.selectedDate.toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper functions to generate calendar links (placeholder implementations)
function generateGoogleCalendarUrl() {
  // This is a simplified implementation - would need proper URL encoding in production
  const startDate = props.selectedDate.toISOString().replace(/-|:|\.\d+/g, '');
  
  // Calculate end time
  const [startHour, startMinute] = props.selectedTime.split(':').map(Number);
  const endDate = new Date(props.selectedDate);
  endDate.setHours(startHour);
  endDate.setMinutes(startMinute + props.duration);
  const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(props.event.name)}&dates=${startDate}/${endDateStr}&details=${encodeURIComponent('Meeting scheduled via Skedi')}`;
}

function generateOutlookCalendarUrl() {
  // Placeholder - would need actual implementation
  return '#';
}

function generateOffice365CalendarUrl() {
  // Placeholder - would need actual implementation
  return '#';
}

function generateICSUrl() {
  // Placeholder - would need actual implementation
  return '#';
}
</script>

<template>
  <div class="confirmation-view">
    <div class="confirmation-icon">
      <div class="success-icon">
        <i class="material-icons-outlined">check</i>
      </div>
    </div>
    
    <h1 class="confirmation-title">This meeting is scheduled</h1>
    <p class="confirmation-description">We sent an email with a calendar invitation with the details to everyone.</p>
    
    <div class="confirmation-details">
      <div class="detail-row">
        <div class="detail-label">What</div>
        <div class="detail-value">{{ event.name }} between {{ organization.name || 'Host' }} and {{ bookingData.name }}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">When</div>
        <div class="detail-value">
          <time :datetime="isoDate">{{ formattedDate }}</time>
          <div>{{ formattedTime }} ({{ formattedTimezone }})</div>
        </div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Who</div>
        <div class="detail-value">
          <div class="detail-user">
            <span class="detail-user-name">{{ organization.name || 'Host' }}</span>
            <span class="detail-user-tag">Host</span>
          </div>
          <div class="detail-user-email">host@example.com</div>
          
          <div class="detail-user">
            <span class="detail-user-name">{{ bookingData.name }}</span>
          </div>
          <div class="detail-user-email">{{ bookingData.email }}</div>
        </div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Where</div>
        <div class="detail-value">
          <a href="#" class="detail-link">
            {{ event.location || 'Skedi Meeting' }}
            <i class="material-icons-outlined link-icon">open_in_new</i>
          </a>
        </div>
      </div>
      
      <!-- Optional notes section -->
      <div class="detail-row" v-if="bookingData.notes">
        <div class="detail-label">Notes</div>
        <div class="detail-value detail-notes">{{ bookingData.notes }}</div>
      </div>
    </div>
    
    <div class="confirmation-actions">
      <div class="action-label">Need to make a change?</div>
      <div class="action-buttons">
        <button class="action-button">Reschedule</button>
        <span class="action-separator">or</span>
        <button class="action-button">Cancel</button>
      </div>
    </div>
    
    <div class="calendar-options">
      <div class="calendar-label">Add to calendar</div>
      <div class="calendar-buttons">
        <button @click="addToGoogleCalendar" class="calendar-button">
          <i class="material-icons-outlined">event</i>
        </button>
        <button @click="addToOutlookCalendar" class="calendar-button">
          <i class="material-icons-outlined">calendar_today</i>
        </button>
        <button @click="addToOffice365Calendar" class="calendar-button">
          <i class="material-icons-outlined">event_note</i>
        </button>
        <button @click="downloadICS" class="calendar-button">
          <i class="material-icons-outlined">download</i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirmation-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.confirmation-icon {
  margin-bottom: 20px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #10b981; /* Green success color */
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.success-icon i {
  font-size: 36px;
  color: white;
}

.confirmation-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px;
}

.confirmation-description {
  color: #a3a3a3;
  margin-top: 0;
  margin-bottom: 32px;
}

.confirmation-details {
  width: 100%;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  padding: 20px 0;
  margin-bottom: 32px;
  text-align: left;
}

.detail-row {
  display: flex;
  margin-bottom: 24px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  width: 80px;
  color: #a3a3a3;
  font-weight: 500;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
}

.detail-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.detail-user-tag {
  background-color: #4f46e5;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.detail-user-email {
  color: #a3a3a3;
  font-size: 14px;
  margin-bottom: 16px;
}

.detail-user-email:last-of-type {
  margin-bottom: 0;
}

.detail-link {
  color: #4f46e5;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.link-icon {
  font-size: 16px;
}

.detail-notes {
  color: #a3a3a3;
  white-space: pre-wrap;
}

.confirmation-actions {
  margin-bottom: 32px;
}

.action-label {
  margin-bottom: 12px;
  color: #a3a3a3;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  padding: 0;
}

.action-separator {
  color: #a3a3a3;
}

.calendar-options {
  width: 100%;
}

.calendar-label {
  margin-bottom: 12px;
  color: #a3a3a3;
  text-align: center;
}

.calendar-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.calendar-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--background-1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-button:hover {
  background-color: var(--background-2);
}
</style>