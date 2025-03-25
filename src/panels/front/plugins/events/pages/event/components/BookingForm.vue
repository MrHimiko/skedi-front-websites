<script setup>
import { ref, computed } from 'vue';
import InputComponent from '@form/input/view.vue';
import TextareaComponent from '@form/textarea/view.vue';
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
    default: 30
  }
});

const emit = defineEmits(['submit', 'back']);

// Form data
const formData = ref({
  name: '',
  email: '',
  notes: '',
  guests: []
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

// Format time range (e.g. "11:30 - 12:00")
const formattedTime = computed(() => {
  // Parse the start time (e.g., "11:30")
  const [startHour, startMinute] = props.selectedTime.split(':').map(Number);
  
  // Calculate end time by adding duration
  const endMinutes = startHour * 60 + startMinute + props.duration;
  const endHour = Math.floor(endMinutes / 60) % 24;
  const endMinute = endMinutes % 60;
  
  // Format both times as "HH:MM"
  const formattedStart = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
  const formattedEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  
  return `${formattedStart} - ${formattedEnd}`;
});

// Handle submit button click
function handleSubmit() {
  // Basic validation
  if (!formData.value.name.trim()) {
    alert('Please enter your name');
    return;
  }
  
  if (!formData.value.email.trim()) {
    alert('Please enter your email');
    return;
  }
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email.trim())) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Emit submit event with form data
  emit('submit', formData.value);
}

// Handle back button click
function handleBack() {
  emit('back');
}

// Handle input changes
function updateName(event, value) {
  formData.value.name = value;
}

function updateEmail(event, value) {
  formData.value.email = value;
}

function updateNotes(value) {
  formData.value.notes = value;
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
        <!-- Form fields -->
        <div class="form-fields">
          <div class="form-field">
            <InputComponent
              label="Your name *" 
              :value="formData.name"
              placeholder="John Doe"
              required
              @onChange="updateName"
            />
          </div>
          
          <div class="form-field">
            <InputComponent
              label="Email address *" 
              :value="formData.email"
              placeholder="you@example.com"
              type="email"
              required
              @onChange="updateEmail"
            />
          </div>
          
          <div class="form-field">
            <TextareaComponent 
              label="Additional notes"
              value=""
              placeholder="Please share anything that will help prepare for our meeting."
              @onInput="updateNotes"
            />
          </div>
          
          <!-- Add guests feature (future implementation) -->
          <!-- <div class="form-field add-guests">
            <button class="add-guests-button">
              <i class="material-icons-outlined">person_add</i>
              <span>Add guests</span>
            </button>
          </div> -->
          
          <!-- Terms and policy links -->
          <div class="terms-policy">
            <p>By proceeding, you agree to our <a href="#" class="link">Terms</a> and <a href="#" class="link">Privacy Policy</a></p>
          </div>
        </div>
        
        <!-- Form actions -->
        <div class="form-actions">
          <ButtonComponent 
            as="tertiary"
            label="Back"
            @click="handleBack"
          />
          
          <ButtonComponent 
            label="Confirm"
            @click="handleSubmit"
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
  grid-template-columns: 300px 1fr;
  gap: 40px;
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

.booking-date, .booking-time, .booking-location {
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

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.form-field {
  width: 100%;
}

.add-guests-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--brand-blue);
  padding: 0;
  cursor: pointer;
  font-size: 14px;
}

.terms-policy {
  margin-top: 12px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.link {
  color: var(--brand-blue);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .booking-form-container {
    grid-template-columns: 1fr;
  }
  
  .booking-form-left {
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }
}
</style>