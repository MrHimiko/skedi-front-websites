<script setup>
import { ref, computed } from 'vue';
import InputComponent from '@form/input/view.vue';
import Button from '@form/button/view.vue';
import { PhPlus, PhTrash } from "@phosphor-icons/vue";

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    value: {
        type: Array,
        default: () => []
    },
    error: {
        type: [String, Array],
        default: null
    }
});

const emit = defineEmits(['update']);

// Local state for guests
const guests = ref(props.value || []);

// Update parent when guests change
const updateGuests = () => {
    emit('update', guests.value);
};

// Add a new guest
const addGuest = () => {
    const maxGuests = props.field.max_guests || 10;
    if (guests.value.length < maxGuests) {
        guests.value.push({
            name: '',
            email: ''
        });
        updateGuests();
    }
};

// Remove a guest
const removeGuest = (index) => {
    guests.value.splice(index, 1);
    updateGuests();
};

// Update guest field
const updateGuestField = (index, field, value) => {
    guests.value[index][field] = value;
    updateGuests();
};

// Check if we can add more guests
const canAddMoreGuests = computed(() => {
    const maxGuests = props.field.max_guests || 10;
    return guests.value.length < maxGuests;
});

// Get error for specific guest
const getGuestError = (index) => {
    if (!props.error || typeof props.error !== 'object') return null;
    return props.error[index] || null;
};
</script>

<template>
    <div class="guest-repeater-field">
        <label v-if="field.label" class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
        </label>
        
        <!-- Guest list -->
        <div v-if="guests.length > 0" class="guests-list">
            <div v-for="(guest, index) in guests" :key="index" class="guest-entry">
                <div class="guest-fields">
                    <div class="guest-name">
                        <InputComponent
                            :value="guest.name"
                            :label="index === 0 ? 'Guest Name' : ''"
                            placeholder="Guest name"
                            @update:modelValue="(value) => updateGuestField(index, 'name', value)"
                        />
                    </div>
                    <div class="guest-email">
                        <InputComponent
                            :value="guest.email"
                            type="email"
                            :label="index === 0 ? 'Guest Email' : ''"
                            placeholder="guest@email.com"
                            :error="getGuestError(index)"
                            @update:modelValue="(value) => updateGuestField(index, 'email', value)"
                        />
                    </div>
                    <div class="guest-remove">
                        <Button
                            as="tertiary icon size36"
                            :iconLeft="{ component: PhTrash, weight: 'bold' }"
                            @click="removeGuest(index)"
                            :style="{ marginTop: index === 0 ? '24px' : '0' }"
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add guest button -->
        <div v-if="canAddMoreGuests" class="add-guest-button">
            <Button
                as="secondary"
                :icon="{ component: PhPlus, weight: 'bold' }"
                :label="guests.length === 0 ? 'Add Guest' : 'Add Another Guest'"
                @click="addGuest"
            />
        </div>
        
        <!-- Max guests reached message -->
        <div v-else class="max-guests-message">
            <p>Maximum number of guests ({{ field.max_guests || 10 }}) reached</p>
        </div>
        
        <!-- Field error -->
        <div v-if="error && typeof error === 'string'" class="field-error">
            {{ error }}
        </div>
    </div>
</template>

<style scoped>
.guest-repeater-field {
    width: 100%;
}

.field-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
}

.required {
    color: var(--red-default);
    margin-left: 4px;
}

.guests-list {
    margin-bottom: 16px;
}

.guest-entry {
    margin-bottom: 12px;
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

.add-guest-button {
    margin-top: 8px;
}

.max-guests-message {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: var(--background-1);
    border-radius: 4px;
    border: 1px solid var(--border);
}

.max-guests-message p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
}

.field-error {
    margin-top: 4px;
    color: var(--red-default);
    font-size: 14px;
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