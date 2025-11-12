<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import bookingService from '../../services/booking-service';

const route = useRoute();
const router = useRouter();

const token = route.params.token;
const booking = ref(null);
const loading = ref(true);
const error = ref(null);
const showCancelModal = ref(false);
const cancelReason = ref('');
const canceling = ref(false);

// Check if booking is in the past
const isPast = computed(() => {
    if (!booking.value) return false;
    const now = new Date();
    const endTime = new Date(booking.value.end_time);
    return endTime < now;
});

// Format date with day of week
const formattedDate = computed(() => {
    if (!booking.value) return '';
    const date = new Date(booking.value.start_time);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Format time with timezone
const formattedTime = computed(() => {
    if (!booking.value) return '';
    const start = new Date(booking.value.start_time);
    const end = new Date(booking.value.end_time);
    
    const startTime = start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    const endTime = end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Get timezone
    const timezone = booking.value.form_data?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const shortTimezone = new Date().toLocaleTimeString('en-US', { 
        timeZoneName: 'short',
        timeZone: timezone 
    }).split(' ').pop();
    
    return `${startTime} - ${endTime} (${shortTimezone})`;
});

// Calculate duration
const duration = computed(() => {
    if (!booking.value) return '';
    const start = new Date(booking.value.start_time);
    const end = new Date(booking.value.end_time);
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} minutes`;
});

// Get location display
const locationDisplay = computed(() => {
    if (!booking.value?.form_data?.location) return 'Online Meeting';
    const location = booking.value.form_data.location;
    
    if (typeof location === 'string') return location;
    if (location.type === 'in_person') return location.address || 'In-Person Meeting';
    if (location.type === 'phone') return 'Phone Call';
    if (location.type === 'google_meet') return 'Google Meet';
    if (location.type === 'zoom') return 'Zoom Meeting';
    if (location.type === 'teams') return 'Microsoft Teams';
    return location.label || 'Online Meeting';
});

// Get meeting link
const meetingLink = computed(() => {
    return booking.value?.form_data?.online_meeting?.link || null;
});

// Get guests list
const guests = computed(() => {
    if (!booking.value?.form_data?.guests) return [];
    return booking.value.form_data.guests;
});

// Get booking URL for reschedule
const rescheduleUrl = computed(() => {
    if (!booking.value) return '';
    return `/${booking.value.organization.slug}/schedule/${booking.value.event.slug}`;
});

// Calendar functions
function addToGoogleCalendar() {
    const start = new Date(booking.value.start_time);
    const end = new Date(booking.value.end_time);
    
    const startStr = start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
    const endStr = end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
    
    const timezone = booking.value.form_data?.timezone || 'UTC';
    const description = `Meeting with ${booking.value.organization.name}${meetingLink.value ? '\n\nJoin: ' + meetingLink.value : ''}`;
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.value.event.name)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(description)}&ctz=${encodeURIComponent(timezone)}`;
    window.open(url, '_blank');
}

function addToOutlookCalendar() {
    const start = new Date(booking.value.start_time);
    const end = new Date(booking.value.end_time);
    
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    
    const description = `Meeting with ${booking.value.organization.name}${meetingLink.value ? '\n\nJoin: ' + meetingLink.value : ''}`;
    
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(booking.value.event.name)}&startdt=${startStr}&enddt=${endStr}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(locationDisplay.value)}`;
    window.open(url, '_blank');
}

function addToOffice365Calendar() {
    const start = new Date(booking.value.start_time);
    const end = new Date(booking.value.end_time);
    
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    
    const description = `Meeting with ${booking.value.organization.name}${meetingLink.value ? '\n\nJoin: ' + meetingLink.value : ''}`;
    
    const url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(booking.value.event.name)}&startdt=${startStr}&enddt=${endStr}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(locationDisplay.value)}`;
    window.open(url, '_blank');
}

function downloadICS() {
    const start = new Date(booking.value.start_time);
    const end = new Date(booking.value.end_time);
    
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const description = `Meeting with ${booking.value.organization.name}${meetingLink.value ? '\\n\\nJoin: ' + meetingLink.value : ''}`;
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${booking.value.event.name}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${locationDisplay.value}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meeting.ics';
    link.click();
    window.URL.revokeObjectURL(url);
}

// Load booking
async function loadBooking() {
    try {
        loading.value = true;
        error.value = null;
        const response = await bookingService.getByToken(token);
        
        if (response.success) {
            booking.value = response.data;
        } else {
            error.value = response.message || 'Booking not found';
        }
    } catch (err) {
        error.value = 'Failed to load booking';
        console.error(err);
    } finally {
        loading.value = false;
    }
}

// Open cancel modal
function openCancelModal() {
    showCancelModal.value = true;
}

// Close cancel modal
function closeCancelModal() {
    showCancelModal.value = false;
    cancelReason.value = '';
}

// Cancel booking
async function cancelBooking() {
    try {
        canceling.value = true;
        const response = await bookingService.cancelByToken(token, cancelReason.value);
        
        if (response.success) {
            await loadBooking();
            closeCancelModal();
        } else {
            alert(response.message || 'Failed to cancel booking');
        }
    } catch (err) {
        alert('Failed to cancel booking');
        console.error(err);
    } finally {
        canceling.value = false;
    }
}

// Reschedule
function reschedule() {
    router.push(rescheduleUrl.value);
}

onMounted(() => {
    loadBooking();
});
</script>

<template>
    <div class="manage-booking-page">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Loading booking...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <h2>Booking Not Found</h2>
            <p>{{ error }}</p>
        </div>

        <!-- Booking Details -->
        <div v-else-if="booking" class="booking-container">
            <div class="booking-header">
                <h1>{{ booking.cancelled ? 'Cancelled Booking' : 'Your Booking' }}</h1>
                <div class="status-badge" :class="{ 'cancelled': booking.cancelled, 'past': isPast, 'pending': booking.status === 'pending' }">
                    {{ booking.cancelled ? 'Cancelled' : isPast ? 'Completed' : booking.status === 'pending' ? 'Pending Approval' : 'Confirmed' }}
                </div>
            </div>

            <div class="booking-details">
                <div class="detail-section">
                    <h2>{{ booking.event.name }}</h2>
                    <p class="organization-name">with {{ booking.organization.name }}</p>
                </div>

                <div class="detail-section">
                    <div class="detail-row">
                        <span class="label">Date:</span>
                        <span class="value">{{ formattedDate }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span>
                        <span class="value">{{ formattedTime }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Duration:</span>
                        <span class="value">{{ duration }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Location:</span>
                        <span class="value">{{ locationDisplay }}</span>
                    </div>
                    <div v-if="meetingLink" class="detail-row">
                        <span class="label">Meeting Link:</span>
                        <span class="value">
                            <a :href="meetingLink" target="_blank" class="meeting-link">Join Meeting</a>
                        </span>
                    </div>
                    <div v-if="booking.form_data?.primary_contact" class="detail-row">
                        <span class="label">Name:</span>
                        <span class="value">{{ booking.form_data.primary_contact.name }}</span>
                    </div>
                    <div v-if="booking.form_data?.primary_contact?.email" class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">{{ booking.form_data.primary_contact.email }}</span>
                    </div>
                    <div v-if="booking.form_data?.primary_contact?.phone" class="detail-row">
                        <span class="label">Phone:</span>
                        <span class="value">{{ booking.form_data.primary_contact.phone }}</span>
                    </div>
                    <div v-if="guests.length > 0" class="detail-row">
                        <span class="label">Guests:</span>
                        <span class="value">
                            <div v-for="(guest, index) in guests" :key="index" class="guest-item">
                                {{ guest.name }} ({{ guest.email }})
                            </div>
                        </span>
                    </div>
                    <div v-if="booking.form_data?.notes" class="detail-row">
                        <span class="label">Notes:</span>
                        <span class="value notes">{{ booking.form_data.notes }}</span>
                    </div>
                </div>

                

                <!-- Actions -->
                <div v-if="!booking.cancelled && !isPast" class="actions">
                    <button @click="reschedule" class="btn-primary">Reschedule</button>
                    <button @click="openCancelModal" class="btn-secondary">Cancel Booking</button>
                </div>

                <!-- Rebook if cancelled -->
                <div v-if="booking.cancelled" class="rebook-section">
                    <p>Need to schedule again?</p>
                    <button @click="reschedule" class="btn-primary">Book New Time</button>
                </div>

                <!-- Add to Calendar -->
                <div v-if="!booking.cancelled && !isPast" class="calendar-section">
                    <h3 style="text-align: center;">Add to Calendar</h3>
                    <div class="calendar-buttons">

                        <button @click="addToGoogleCalendar" class="calendar-btn">
                            <img src="/assets/icons/google-calendar.svg" alt="Google Calendar" />
                        </button>

                        <button @click="addToOutlookCalendar" class="calendar-btn">
                            <img src="/assets/icons/outlook.svg" alt="Outlook" />
                        </button>

                        <button @click="downloadICS" class="calendar-btn">
                            <img src="/assets/icons/ics.svg" alt="Download" />
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- Cancel Modal -->
        <div v-if="showCancelModal" class="modal-overlay" @click="closeCancelModal">
            <div class="modal" @click.stop>
                <h3>Cancel Booking</h3>
                <p>Are you sure you want to cancel this booking?</p>
                
                <div class="form-group">
                    <label>Reason (optional)</label>
                    <textarea 
                        v-model="cancelReason" 
                        placeholder="Let the host know why you're cancelling..."
                        rows="4"
                    ></textarea>
                </div>

                <div class="modal-actions">
                    <button @click="closeCancelModal" class="btn-secondary" :disabled="canceling">
                        Keep Booking
                    </button>
                    <button @click="cancelBooking" class="btn-danger" :disabled="canceling">
                        {{ canceling ? 'Cancelling...' : 'Yes, Cancel' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.manage-booking-page {
    min-height: 100vh;
    background: #f9fafb;
    padding: 40px 20px;
}

.loading-container,
.error-container {
    text-align: center;
    padding: 60px 20px;
}

.spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.booking-container {
    max-width: 700px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 32px;
}

.booking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
}

.booking-header h1 {
    font-size: 24px;
    margin: 0;
}

.status-badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    background: #10b981;
    color: white;
}

.status-badge.cancelled {
    background: #ef4444;
}

.status-badge.past {
    background: #6b7280;
}

.status-badge.pending {
    background: #f59e0b;
}

.booking-details {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.detail-section h2 {
    font-size: 20px;
    margin: 0 0 8px 0;
}

.organization-name {
    color: #6b7280;
    margin: 0;
}

.detail-row {
    display: flex;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
}

.detail-row .label {
    width: 120px;
    color: #6b7280;
    font-weight: 500;
    flex-shrink: 0;
}

.detail-row .value {
    flex: 1;
    color: #111827;
}

.detail-row .value.notes {
    white-space: pre-wrap;
}

.meeting-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
}

.meeting-link:hover {
    text-decoration: underline;
}

.guest-item {
    padding: 4px 0;
}

.calendar-section {
    padding-top: 8px;
}

.calendar-section h3 {
    font-size: 16px;
    margin: 0 0 16px 0;
    color: #374151;
}

.calendar-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.calendar-btn {
    padding: 16px;
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.calendar-btn img {
    width: 32px;
    height: 32px;
    object-fit: contain;
}

.calendar-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f0f9ff;
}

.actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}

.rebook-section {
    text-align: center;
    padding: 24px;
    background: #f9fafb;
    border-radius: 8px;
}

.rebook-section p {
    margin: 0 0 16px 0;
    color: #6b7280;
}

.btn-primary {
    flex: 1;
    padding: 12px 24px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-secondary {
    flex: 1;
    padding: 12px 24px;
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f9fafb;
}

.btn-danger {
    padding: 12px 24px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-danger:hover {
    background: #dc2626;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
}

.modal h3 {
    margin: 0 0 16px 0;
    font-size: 20px;
}

.modal p {
    color: #6b7280;
    margin: 0 0 24px 0;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
}

.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
}

.modal-actions {
    display: flex;
    gap: 12px;
}

.modal-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 640px) {
    .calendar-buttons {
        grid-template-columns: 1fr;
    }
    
    .actions {
        flex-direction: column;
    }
}
</style>