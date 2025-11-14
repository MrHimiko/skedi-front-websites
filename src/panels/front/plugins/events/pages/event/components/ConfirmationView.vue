<!-- File: src/panels/front/plugins/events/pages/event/components/ConfirmationView.vue -->

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
    timezone: {
        type: String,
        default: ''
    },
    bookingData: {
        type: Object,
        required: true
    },
    booking: {
        type: Object,
        default: () => ({})
    }
});

const bookingStatus = computed(() => {
    return props.booking?.status || 'confirmed';
});

const isPending = computed(() => {
    return bookingStatus.value === 'pending';
});

const parsedLocation = computed(() => {
    const eventLocation = props.event?.location;
    
    if (!eventLocation) {
        return { type: 'online', display: 'Online Meeting' };
    }
    
    if (typeof eventLocation === 'object' && !Array.isArray(eventLocation)) {
        return {
            type: eventLocation.type || 'online',
            display: getLocationDisplay(eventLocation)
        };
    }
    
    if (Array.isArray(eventLocation) && eventLocation.length > 0) {
        const firstLocation = eventLocation[0];
        return {
            type: firstLocation.type || 'online', 
            display: getLocationDisplay(firstLocation)
        };
    }
    
    if (typeof eventLocation === 'string') {
        try {
            const parsed = JSON.parse(eventLocation);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return {
                    type: parsed[0].type || 'online',
                    display: getLocationDisplay(parsed[0])
                };
            }
        } catch (e) {
            return { type: 'custom', display: eventLocation };
        }
    }
    
    return { type: 'online', display: 'Online Meeting' };
});

const getLocationDisplay = (locationObj) => {
    if (!locationObj || !locationObj.type) {
        return 'Online Meeting';
    }
    
    switch (locationObj.type) {
        case 'in_person':
            return locationObj.address || 'In-Person Meeting';
        case 'phone':
            return 'Phone Call';
        case 'google_meet':
            return 'Google Meet';
        case 'zoom':
            return 'Zoom Meeting';
        case 'teams':
            return 'Microsoft Teams';
        case 'custom':
            return locationObj.label || 'Custom Location';
        default:
            return 'Online Meeting';
    }
};

const formattedDate = computed(() => {
    return props.selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
});

const formattedTime = computed(() => {
    const [startHour, startMinute] = props.selectedTime.split(':').map(Number);
    const bookingDate = new Date(props.selectedDate);
    bookingDate.setHours(startHour, startMinute, 0, 0);
    
    let localStartTime;
    
    if (props.timezone) {
        const dateStr = props.selectedDate.toISOString().split('T')[0];
        const timeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`;
        const dateTimeStr = `${dateStr}T${timeStr}`;
        
        localStartTime = new Date(bookingDate.toLocaleString('en-US', { timeZone: props.timezone }));
    } else {
        localStartTime = bookingDate;
    }
    
    const localEndTime = new Date(localStartTime.getTime() + props.duration * 60000);
    
    const formatTime = (date) => {
        const hour = date.getHours();
        const minute = date.getMinutes();
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    };
    
    return `${formatTime(localStartTime)} - ${formatTime(localEndTime)}`;
});

const formattedTimezone = computed(() => {
    try {
        const viewerTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const timezone = new Intl.DateTimeFormat('en-US', {
            timeZone: viewerTimezone,
            timeZoneName: 'short'
        }).formatToParts(new Date()).find(part => part.type === 'timeZoneName');
        
        return timezone ? timezone.value : viewerTimezone;
    } catch (e) {
        return 'Local Time';
    }
});

const isoDate = computed(() => {
    return props.selectedDate.toISOString();
});

function addToGoogleCalendar() {
    const url = generateGoogleCalendarUrl();
    window.open(url, '_blank');
}

function addToOutlookCalendar() {
    const url = generateOutlookCalendarUrl();
    window.open(url, '_blank');
}

function addToOffice365Calendar() {
    const url = generateOffice365CalendarUrl();
    window.open(url, '_blank');
}

function downloadICS() {
    const url = generateICSUrl();
    window.open(url, '_blank');
}

function generateGoogleCalendarUrl() {
    const [startHour, startMinute] = props.selectedTime.split(':').map(Number);
    
    const startDate = new Date(props.selectedDate);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(startDate.getTime() + props.duration * 60000);
    
    const startDateStr = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
    const endDateStr = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(props.event.name)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent('Meeting scheduled via Skedi')}&ctz=${encodeURIComponent(props.timezone)}`;
}

function generateOutlookCalendarUrl() {
    return '#';
}

function generateOffice365CalendarUrl() {
    return '#';
}

function generateICSUrl() {
    return '#';
}
</script>

<template>
    <div class="confirmation-view">
        <div class="confirmation-icon">
            <div class="success-icon" :class="{ 'pending-icon': isPending }">
                <i class="material-icons-outlined">{{ isPending ? 'schedule' : 'check' }}</i>
            </div>
        </div>
        
        <h1 class="confirmation-title" v-if="isPending">Booking Request Sent</h1>
        <h1 class="confirmation-title" v-else>This meeting is scheduled</h1>

        <p class="confirmation-description" v-if="isPending">
            Your booking request has been sent to {{ organization.name || 'the host' }} for approval. You'll receive a confirmation email once approved.
        </p>
        <p class="confirmation-description" v-else>
            We sent an email with a calendar invitation with the details to everyone.
        </p>
        
        <div class="confirmation-details">
            <div class="detail-row">
                <div class="detail-label">What</div>
                <div class="detail-value">{{ event.name }} between {{ organization.name || 'Host' }} and you</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">When</div>
                <div class="detail-value">
                    <time :datetime="isoDate">{{ formattedDate }}</time>
                    <div>{{ formattedTime }} ({{ formattedTimezone }})</div>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Where</div>
                <div class="detail-value">
                    <div class="location-info">
                        {{ parsedLocation.display }}
                        <div class="location-note">Instructions sent via email</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-row" v-if="bookingData.notes">
                <div class="detail-label">Notes</div>
                <div class="detail-value detail-notes">{{ bookingData.notes }}</div>
            </div>

            <div class="detail-row" v-if="isPending">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                    <span class="status-pending">⏳ Awaiting approval</span>
                </div>
            </div>
        </div>
        
        <div class="confirmation-actions" v-if="!isPending">
            <div class="action-label">Need to make a change?</div>
            <div class="action-buttons">
                <button class="action-button">Reschedule</button>
                <span class="action-separator">or</span>
                <button class="action-button">Cancel</button>
            </div>
        </div>

        <div class="pending-info" v-if="isPending">
            <div class="info-card">
                <h3>What happens next?</h3>
                <ul>
                    <li>{{ organization.name || 'The host' }} will review your booking request</li>
                    <li>You'll receive an email confirmation once approved</li>
                    <li>If approved, calendar invitations will be sent automatically</li>
                </ul>
            </div>
        </div>
        
        <div class="calendar-options" v-if="!isPending">
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
    background-color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.success-icon.pending-icon {
    background-color: #ff6f60;
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
    max-width: 400px;
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

.location-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.location-note {
    font-size: 12px;
    color: #a3a3a3;
    font-style: italic;
}

.detail-notes {
    color: #a3a3a3;
    white-space: pre-wrap;
}

.status-pending {
    color: #ff6f60;
    font-weight: 500;
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

.pending-info {
    margin-bottom: 32px;
    width: 100%;
}

.info-card {
    background-color: #000;
    border-radius: 8px;
    padding: 20px;
    text-align: left;
}

.info-card h3 {
    color: #f3f4f6;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
}

.info-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-card li {
    color: #d1d5db;
    font-size: 14px;
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
}

.info-card li::before {
    content: '•';
    color: #ff6f60;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.info-card li:last-child {
    margin-bottom: 0;
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