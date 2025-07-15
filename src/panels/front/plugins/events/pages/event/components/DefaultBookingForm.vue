<script setup>
import { ref, reactive, computed } from 'vue';
import { api } from '@utils/api';
import { common } from '@utils/common';
import InputComponent from '@form/input/view.vue';
import TextareaComponent from '@form/textarea/view.vue';
import Button from '@form/button/view.vue';
import Notice from '@global/notice/view.vue';
import { PhPlus, PhTrash } from "@phosphor-icons/vue";

const props = defineProps({
    eventId: {
        type: [String, Number],
        required: true
    },
    submitEndpoint: {
        type: String,
        required: true
    },
    initialData: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['submit', 'error']);

// Form data
const formData = reactive({
    system_contact_name: props.initialData.system_contact_name || '',
    system_contact_email: props.initialData.system_contact_email || '',
    notes: props.initialData.notes || '',
    system_contact_guests: props.initialData.system_contact_guests || []
});

// Form validation
const errors = reactive({
    system_contact_name: '',
    system_contact_email: '',
    guests: {}
});

const isSubmitting = ref(false);

// Validation rules
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    errors.system_contact_name = '';
    errors.system_contact_email = '';
    errors.guests = {};
    
    // Validate name
    if (!formData.system_contact_name.trim()) {
        errors.system_contact_name = 'Name is required';
        isValid = false;
    }
    
    // Validate email
    if (!formData.system_contact_email.trim()) {
        errors.system_contact_email = 'Email is required';
        isValid = false;
    } else if (!validateEmail(formData.system_contact_email)) {
        errors.system_contact_email = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Validate guest emails
    formData.system_contact_guests.forEach((guest, index) => {
        if (guest.email && !validateEmail(guest.email)) {
            errors.guests[index] = 'Please enter a valid email address';
            isValid = false;
        }
    });
    
    return isValid;
};

// Add guest
const addGuest = () => {
    if (formData.system_contact_guests.length < 10) {
        formData.system_contact_guests.push({
            name: '',
            email: ''
        });
    }
};

// Remove guest
const removeGuest = (index) => {
    formData.system_contact_guests.splice(index, 1);
    // Clean up errors for this guest
    delete errors.guests[index];
};

// Submit form
const submitForm = async () => {
    if (!validateForm()) {
        common.notification('Please fix the errors in the form', false);
        return;
    }
    
    try {
        isSubmitting.value = true;
        
        // Prepare submission data
        const submissionData = {
            fields: {
                system_contact_name: formData.system_contact_name,
                system_contact_email: formData.system_contact_email,
                notes: formData.notes,
                system_contact_guests: formData.system_contact_guests.filter(g => g.email || g.name)
            },
            metadata: {
                submission_source: 'web',
                event_id: props.eventId
            }
        };
        
        // Submit to the endpoint
        const response = await api.post(props.submitEndpoint, submissionData);
        
        if (response && response.success) {
            emit('submit', {
                fields: submissionData.fields,
                formConfig: {
                    name: 'Default Form',
                    fields: [
                        { name: 'system_contact_name', label: 'Your Name', type: 'text' },
                        { name: 'system_contact_email', label: 'Email Address', type: 'email' },
                        { name: 'notes', label: 'Notes', type: 'textarea' },
                        { name: 'system_contact_guests', label: 'Guests', type: 'guest_repeater' }
                    ]
                }
            });
        } else {
            throw new Error(response?.message || 'Failed to submit form');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        emit('error', error);
        common.notification(error.message || 'Failed to submit form', false);
    } finally {
        isSubmitting.value = false;
    }
};

// Check if we can add more guests
const canAddMoreGuests = computed(() => {
    return formData.system_contact_guests.length < 10;
});
</script>

<template>
    <div class="default-booking-form">
        <form @submit.prevent="submitForm">
            <!-- Name Field -->
            <div class="form-field">
                <InputComponent
                    v-model="formData.system_contact_name"
                    label="Your Name"
                    placeholder="Enter your name"
                    :required="true"
                    :error="errors.system_contact_name"
                    @blur="errors.system_contact_name = ''"
                />
            </div>
            
            <!-- Email Field -->
            <div class="form-field">
                <InputComponent
                    v-model="formData.system_contact_email"
                    type="email"
                    label="Email Address"
                    placeholder="your@email.com"
                    :required="true"
                    :error="errors.system_contact_email"
                    @blur="errors.system_contact_email = ''"
                />
            </div>
            
            <!-- Notes Field -->
            <div class="form-field">
                <TextareaComponent
                    v-model="formData.notes"
                    label="Notes (Optional)"
                    placeholder="Any additional information..."
                    :rows="3"
                />
            </div>
            
            <!-- Guests Section -->
            <div class="guests-section" v-if="formData.system_contact_guests.length > 0 || canAddMoreGuests">
                <h4>Add Guests</h4>
                
                <!-- Guest entries -->
                <div v-for="(guest, index) in formData.system_contact_guests" :key="index" class="guest-entry">
                    <div class="guest-fields">
                        <div class="guest-name">
                            <InputComponent
                                v-model="guest.name"
                                :label="index === 0 ? 'Guest Name' : ''"
                                placeholder="Guest name"
                            />
                        </div>
                        <div class="guest-email">
                            <InputComponent
                                v-model="guest.email"
                                type="email"
                                :label="index === 0 ? 'Guest Email' : ''"
                                placeholder="guest@email.com"
                                :error="errors.guests[index]"
                                @blur="delete errors.guests[index]"
                            />
                        </div>
                        <div class="guest-remove">
                            <Button
                                as="tertiary"
                                :icon="{ component: PhTrash, weight: 'bold' }"
                                @click="removeGuest(index)"
                                :style="{ marginTop: index === 0 ? '24px' : '0' }"
                            />
                        </div>
                    </div>
                </div>
                
                <!-- Add guest button -->
                <div v-if="canAddMoreGuests" class="add-guest-button">
                    <Button
                        as="secondary"
                        :icon="{ component: PhPlus, weight: 'bold' }"
                        label="Add Guest"
                        @click="addGuest"
                    />
                </div>
            </div>
            
            <!-- Add first guest button if no guests -->
            <div v-else class="add-first-guest">
                <Button
                    as="secondary"
                    :icon="{ component: PhPlus, weight: 'bold' }"
                    label="Add Guest"
                    @click="addGuest"
                />
            </div>
            
            <!-- Submit button -->
            <div class="form-actions">
                <Button
                    type="submit"
                    label="Submit"
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                />
            </div>
        </form>
    </div>
</template>

<style scoped>
.default-booking-form {
    width: 100%;
}

.form-field {
    margin-bottom: 20px;
}

.guests-section {
    margin-top: 30px;
    margin-bottom: 30px;
}

.guests-section h4 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: 600;
}

.guest-entry {
    margin-bottom: 15px;
}

.guest-fields {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 10px;
    align-items: end;
}

.guest-name,
.guest-email {
    flex: 1;
}

.guest-remove {
    display: flex;
    align-items: center;
}

.add-guest-button,
.add-first-guest {
    margin-top: 10px;
}

.form-actions {
    margin-top: 30px;
}

@media (max-width: 600px) {
    .guest-fields {
        grid-template-columns: 1fr;
        gap: 10px;
    }
    
    .guest-remove {
        margin-top: 5px;
    }
}
</style>