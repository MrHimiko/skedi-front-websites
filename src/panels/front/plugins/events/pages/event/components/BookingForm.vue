<!-- File: src/panels/front/plugins/events/pages/event/components/BookingForm.vue -->

<script setup>
import { ref, computed, onMounted } from 'vue';
import ButtonComponent from '@form/button/view.vue';
import DynamicForm from '@/components/forms/dynamic/DynamicForm.vue';
import { PotentialLeadsService } from '@/panels/front/services/potential-leads';

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
        default: 30
    },
    timezone: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['submit', 'back']);

// Debug logging
console.log('BookingForm setup, event:', props.event);

// Dynamic form reference
const dynamicForm = ref(null);

// Variables for email capture
let emailCaptured = false;
let captureTimeout = null;

// Format date to display
const formattedDate = computed(() => {
    return props.selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
});

// Format time range
const formattedTime = computed(() => {
    const [startHour, startMinute] = props.selectedTime.split(':').map(Number);
    
    const endMinutes = startHour * 60 + startMinute + props.duration;
    const endHour = Math.floor(endMinutes / 60) % 24;
    const endMinute = endMinutes % 60;
    
    const formatTime = (hour, minute) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
    };
    
    const formattedStart = formatTime(startHour, startMinute);
    const formattedEnd = formatTime(endHour, endMinute);
    
    return `${formattedStart} - ${formattedEnd}`;
});

// Display timezone
const displayTimezone = computed(() => {
    return props.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
});

// Check if event has a form_id (for testing, let's use a hardcoded one)
const hasFormId = computed(() => {
    // Always true since we're calling the event's form endpoint
    console.log('Checking hasFormId, event:', props.event);
    return true;
});

// Form API endpoint
const formApiEndpoint = computed(() => {
    // Use the event ID to get its form
    console.log('Form API endpoint:', `public/events/${props.event.id}/form`);
    return `public/events/${props.event.id}/form`;
});

// Setup email listener
function setupEmailListener() {
    // Reset state
    emailCaptured = false;
    
    // Use MutationObserver to detect when form fields are added
    const observer = new MutationObserver(() => {
        const emailInput = document.querySelector('#field-system_contact_email input');
        
        if (emailInput && !emailInput.hasAttribute('data-lead-listener')) {
            // Mark as having listener to avoid duplicates
            emailInput.setAttribute('data-lead-listener', 'true');
            
            // Listen for changes
            emailInput.addEventListener('blur', () => {
                const email = emailInput.value;
                
                // Only capture if valid email and not already captured
                if (email && email.includes('@') && !emailCaptured) {
                    captureTimeout = setTimeout(() => {
                        // Get name if available
                        const nameInput = document.querySelector('#field-system_contact_name input');
                        const name = nameInput ? nameInput.value : null;
                        
                        // Call API with organization and event IDs
                        PotentialLeadsService.captureLead(
                            props.organization.id,  // Use organization ID from props
                            props.event.id,         // Use event ID from props
                            {
                                email: email,
                                name: name
                            }
                        ).then(() => {
                            emailCaptured = true;
                            console.log('Lead captured:', email);
                        });
                    }, 1000); // Wait 1 second after typing stops
                }
            });
        }
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
}

// Log when component mounts
onMounted(() => {
    console.log('BookingForm mounted');
    console.log('Event ID:', props.event.id);
    console.log('Event:', props.event);
    console.log('formApiEndpoint:', formApiEndpoint.value);
    
    // Listen for email field changes
    setupEmailListener();
});

// Handle dynamic form submission
function handleFormSubmit(response) {
    console.log('Form submission response:', response);
    
    // Extract the form fields and the form configuration
    const formFields = response.fields || {};
    const formConfig = response.formConfig || response; // The response might include form configuration
    
    // Build booking data with primary guest info
    const bookingData = {
        name: formFields.system_contact_name || formFields.name || '',
        email: formFields.system_contact_email || formFields.email || '',
        notes: formFields.notes || '',
        guests: [],
        selectedDate: props.selectedDate,
        selectedTime: props.selectedTime,
        duration: props.duration,
        timezone: props.timezone
    };
    
    // Add additional guests from the guest repeater field
    if (formFields.system_contact_guests && Array.isArray(formFields.system_contact_guests)) {
        bookingData.guests = formFields.system_contact_guests.filter(guest => 
            guest.email && guest.email.trim() !== ''
        );
    }
    
    // Include any other custom fields with labels
    bookingData.customFields = {};
    bookingData.customFieldsMetadata = {}; // Store field metadata separately
    
    Object.keys(formFields).forEach(key => {
        if (!['system_contact_name', 'system_contact_email', 'system_contact_guests', 'name', 'email', 'notes'].includes(key)) {
            bookingData.customFields[key] = formFields[key];
            
            // Try to find the field label from the form configuration
            if (formConfig && formConfig.fields) {
                const field = formConfig.fields.find(f => f.id === key || f.name === key);
                if (field) {
                    bookingData.customFieldsMetadata[key] = {
                        label: field.label,
                        type: field.type
                    };
                }
            }
        }
    });
    
    console.log('Processed booking data:', bookingData);
    emit('submit', bookingData);
}

// Handle form errors
function handleFormError(error) {
    console.error('Form error:', error);
}

// Handle back button
function handleBack() {
    emit('back');
}
</script>

<template>
    <div class="booking-form">
        <div class="booking-form-container">
            <div class="booking-form-left">
                <!-- Organization avatar -->
                <div class="avatar">
                    <span>{{ organization.name ? organization.name.charAt(0).toUpperCase() : 'O' }}</span>
                </div>
                
                <!-- Event name -->
                <h1 class="event-name">{{ event.name }}</h1>
                
                <!-- Selected date/time -->
                <div class="booking-datetime">
                    <div class="booking-date">
                        <i class="material-icons-outlined">event</i>
                        <span>{{ formattedDate }}</span>
                    </div>
                    <div class="booking-time">
                        <i class="material-icons-outlined">schedule</i>
                        <span>{{ formattedTime }}</span>
                    </div>
                    <div class="booking-timezone">
                        <i class="material-icons-outlined">public</i>
                        <span>{{ displayTimezone }}</span>
                    </div>
                </div>
                
                <!-- Location info -->
                <div class="booking-location">
                    <i class="material-icons-outlined">
                        {{ event.location_type === 'physical' ? 'location_on' : 'videocam' }}
                    </i>
                    <span>{{ event.location || 'Skedi Meeting' }}</span>
                </div>
            </div>
            
            <div class="booking-form-right">
                <!-- Always show Dynamic Form for testing -->
                <div class="dynamic-form-wrapper">
                    <DynamicForm
                        ref="dynamicForm"
                        :formId="event.id || 'event-form'"
                        :apiEndpoint="`public/events/${event.id}/form`"
                        @submit="handleFormSubmit"
                        @error="handleFormError"
                    />
                </div>
                
                <!-- Back button -->
                <div class="form-actions">
                    <ButtonComponent 
                        as="tertiary"
                        label="Back"
                        @click="handleBack"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.booking-form {
    width: 100%;
    background-color: var(--background-0);
}

.booking-form-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 70px;
    background-color: var(--background-0);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 30px;
}

.booking-form-left {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--brand-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 500;
    color: var(--white);
    margin-bottom: 8px;
}

.event-name {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
}

.booking-datetime {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
}

.booking-date, .booking-time, .booking-timezone, .booking-location {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-secondary);
    font-size: 14px;
}

.booking-location {
    margin-top: 4px;
}

.material-icons-outlined {
    color: var(--text-tertiary);
    font-size: 20px;
}

.booking-form-right {
    display: flex;
    flex-direction: column;
}

.dynamic-form-wrapper {
    flex: 1;
}

.default-form-fields {
    flex: 1;
}

.no-form-message {
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 40px 20px;
    background-color: var(--background-1);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.form-actions {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .booking-form-container {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 20px;
    }
    
    .booking-form-left {
        padding-bottom: 24px;
        border-bottom: 1px solid var(--border);
    }
}
</style>