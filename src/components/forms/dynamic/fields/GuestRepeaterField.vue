<!-- File: src/components/forms/dynamic/fields/GuestRepeaterField.vue -->

<script setup>
import { ref, watch } from 'vue';
import InputComponent from '@form/input/view.vue';
import ButtonComponent from '@form/button/view.vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    modelValue: {
        type: Array,
        default: () => []
    },
    errors: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue']);

// Initialize guests with existing value or empty array
const guests = ref(props.modelValue || []);

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
    guests.value = newValue || [];
});

// Add a new guest
function addGuest() {
    const maxGuests = props.field.max_guests || 10;
    if (guests.value.length < maxGuests) {
        guests.value.push({
            name: '',
            email: ''
        });
        emit('update:modelValue', [...guests.value]);
    }
}

// Remove a guest
function removeGuest(index) {
    guests.value.splice(index, 1);
    emit('update:modelValue', [...guests.value]);
}

// Update guest data
function updateGuest(index, field, value) {
    guests.value[index][field] = value;
    emit('update:modelValue', [...guests.value]);
}
</script>

<template>
    <div class="guest-repeater-field">
        <div class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
        </div>
        
        <div class="guests-list">
            <div 
                v-for="(guest, index) in guests" 
                :key="index"
                class="guest-item"
            >
                <div class="guest-fields">
                    <div class="guest-field">
                        <InputComponent
                            label="Guest Name"
                            :value="guest.name"
                            placeholder="Enter guest name"
                            @onChange="(e, value) => updateGuest(index, 'name', value)"
                        />
                    </div>
                    <div class="guest-field">
                        <InputComponent
                            label="Guest Email"
                            type="email"
                            :value="guest.email"
                            placeholder="Enter guest email"
                            @onChange="(e, value) => updateGuest(index, 'email', value)"
                        />
                    </div>
                </div>
                <button 
                    type="button"
                    class="remove-guest"
                    @click="removeGuest(index)"
                >
                    <i class="material-icons-outlined">close</i>
                </button>
            </div>
        </div>
        
        <div 
            v-if="!field.max_guests || guests.length < field.max_guests" 
            class="add-guest-wrapper"
        >
            <ButtonComponent
                as="secondary"
                label="Add Guest"
                @click="addGuest"
            />
            <span v-if="field.max_guests" class="guest-limit">
                {{ guests.length }} / {{ field.max_guests }} guests
            </span>
        </div>
        
        <div v-if="errors.length > 0" class="field-errors">
            <span v-for="(error, index) in errors" :key="index" class="error-message">
                {{ error }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.guest-repeater-field {
    width: 100%;
}

.field-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
}

.required {
    color: var(--red-default);
}

.guests-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
}

.guest-item {
    display: flex;
    gap: 12px;
    padding: 16px;
    background-color: var(--background-1);
    border: 1px solid var(--border);
    border-radius: 8px;
    position: relative;
}

.guest-fields {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.guest-field {
    flex: 1;
}

.remove-guest {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.remove-guest:hover {
    color: var(--red-default);
    background-color: var(--background-2);
}

.add-guest-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
}

.guest-limit {
    font-size: 12px;
    color: var(--text-tertiary);
}

.field-errors {
    margin-top: 8px;
}

.error-message {
    color: var(--red-default);
    font-size: 12px;
    display: block;
}

@media (max-width: 768px) {
    .guest-fields {
        grid-template-columns: 1fr;
    }
}
</style>