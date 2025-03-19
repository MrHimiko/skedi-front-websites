<script setup>
import { ref, computed } from 'vue';
import { UserStore } from '@stores/user';
import { api } from '@utils/api';
import EditTime from '@user_events/components/form/editTime/editTime.vue';
import PopupView from '@layouts/popup/view.vue';
import Button from '@form/button/view.vue';
import InputComponent from '@form/input/view.vue';
import SelectComponent from '@form/select/view.vue';
import { common } from '@utils/common';

const userStore = UserStore();

// State variables
const eventName = ref('');
const duration = ref('30');
const organizationId = ref('');
const scheduleData = ref(null);
const isSubmitting = ref(false);

// Create duration options (15, 30, 45, 60 minutes)
const durationOptions = [
    { label: '15 minutes', value: '15' },
    { label: '30 minutes', value: '30' },
    { label: '45 minutes', value: '45' },
    { label: '60 minutes', value: '60' },
];

const props = defineProps({
    values: Function,
    endpoint: String,
    type: String,
    callback: Function,
});

import { toRaw } from 'vue';
const rawProps = toRaw(props);

// Format organizations for select dropdown
const orgOptions = computed(() => {
    try {
        const orgsData = userStore.getOrganizations();
        if (!orgsData) return [];
        
        const orgArray = Array.isArray(orgsData.target) ? orgsData.target :
                        Array.isArray(orgsData) ? orgsData : [];
        
        return orgArray.map(org => {
            if (!org) return { label: 'Unknown', value: '' };
            
            return {
                label: org.entity?.name || 'Unnamed',
                value: org.entity?.id?.toString() || ''
            };
        });
    } catch (error) {
        console.error('Error formatting organizations:', error);
        return [];
    }
});

// Method to handle the schedule update from the EditTime component
const updateSchedule = (data) => {
    console.log('Received schedule data:', data);
    scheduleData.value = data;
};

// Handle input changes
const updateEventName = (event, value) => {
    eventName.value = value;
};

const updateDuration = (value) => {
    duration.value = value;
};

const updateOrganization = (value) => {
    organizationId.value = value;
};

// Method to handle form submission
const handleSubmit = async () => {
    // Validate form
    if (!eventName.value) {
        common.notification('Please enter a name for the event type', false);
        return;
    }
    
    if (!duration.value) {
        common.notification('Please select a duration', false);
        return;
    }
    
    if (!organizationId.value) {
        common.notification('Please select an organization', false);
        return;
    }
    
    if (!scheduleData.value) {
        common.notification('Please set up a schedule', false);
        return;
    }
    
    // Prepare data for API submission
    const apiData = {
        name: eventName.value,
        duration: parseInt(duration.value),
        schedule: {}
    };
    
    // Map schedule data correctly
    if (scheduleData.value && scheduleData.value.schedule) {
        apiData.schedule = scheduleData.value.schedule;
    }
    
    console.log('Data ready for API submission:', apiData);
    
    try {
        isSubmitting.value = true;
        
        // Call API to create the event
        const response = await api.post(`events?organization_id=${organizationId.value}`, apiData);
        
        if (response && response.success) {
            common.notification('Event type created successfully!', true);
            
            // Call the callback if provided (for popup closing etc.)
            if (props.callback) {
                props.callback(null, apiData, response, true);
            }
            
            // Close popup using i-popup-close class
            document.querySelector('.i-popup-close').click();
        } else {
            common.notification('Failed to create event: ' + (response?.message || 'Unknown error'), false);
        }
    } catch (error) {
        console.error('API error:', error);
        common.notification('Error creating event: ' + (error.message || 'Unknown error'), false);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <PopupView title="Create Event Type" customClass="h-auto event-times">
        <template #content>
            <div class="form-section">
                <div class="form-flex">
                    <!-- Event Name Input -->
                    <div class="form-row">
                        <InputComponent
                            label="Event Type Name"
                            :value="eventName"
                            placeholder="e.g., Consultation Call"
                            required
                            @onInput="updateEventName"
                        />
                    </div>
                    
                    <!-- Duration Select -->
                    <div class="form-row">
                        <SelectComponent
                            label="Duration"
                            :options="durationOptions"
                            :value="duration"
                            placeholder="Select duration"
                            required
                            @change="updateDuration"
                        />
                    </div>
                    
                    <!-- Organization Select -->
                    <div class="form-row" v-if="!rawProps.endpoint?.includes('organization_id')">
                        <SelectComponent
                            label="Organization"
                            :options="orgOptions"
                            :value="organizationId"
                            placeholder="Select organization"
                            required
                            @change="updateOrganization"
                        />
                    </div>
                </div>
                
                <h3 class="section-title">Availability Schedule</h3>
                
                <!-- EditTime Component -->
                <div class="schedule-section">
                    <edit-time
                        @update="updateSchedule"
                    />
                </div>
            </div>

            <div class="actions grid grid-2 gap-2xl" style="margin-top: 50px;">
                <div>
                    <div class="c-button tertiary pointer i-popup-close" as="stroke">Close</div>
                </div>
                <div>
                    <Button 
                        type="button" 
                        label="Save" 
                        :loading="isSubmitting" 
                        @click="handleSubmit"
                    />
                </div>
            </div>
        </template>
    </PopupView>
</template>

<style scoped>
.form-section {
    margin-bottom: 30px;
}
.form-row {
    margin-bottom: 20px;
}
.section-title {
    margin: 10px 0 15px;
    font-weight: 600;
    font-size: 16px;
}
.schedule-section {
    border-top: 1px solid var(--border);
    padding-top: 20px;
}

.form-flex {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.form-flex > div {
    flex: 1;
}
</style>

<style>
.form-flex .c-input .text-xs {
    display: none !important;
}
</style>