<!-- File: src/components/forms/dynamic/DynamicFormBuilder.vue -->

<script setup>
import { ref, computed, watch } from 'vue';
import DynamicField from './fields/DynamicField.vue';
import ButtonComponent from '@form/button/view.vue';
import formConfigService from './services/form-config.service';
import formValidationService from './services/form-validation.service';

const props = defineProps({
    formConfig: {
        type: Object,
        required: true
    },
    processedFields: {
        type: Object,
        required: true
    },
    formData: {
        type: Object,
        required: true
    },
    formErrors: {
        type: Object,
        required: true
    },
    submitting: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['updateField', 'submit']);

// Current step for multi-step forms
const currentStep = ref(0);

// Check if form has steps
const hasSteps = computed(() => props.processedFields.hasSteps);

// Get current step fields
const currentStepFields = computed(() => {
    if (!hasSteps.value) {
        return props.processedFields.rootFields;
    }
    
    const step = props.processedFields.steps[currentStep.value];
    return formConfigService.getStepFields(step, props.processedFields.fieldMap);
});

// Get visible fields for current view
const visibleFields = computed(() => {
    return currentStepFields.value.filter(field => 
        formConfigService.checkFieldVisibility(field, props.formData)
    );
});

// Step navigation
const canGoBack = computed(() => currentStep.value > 0);
const canGoNext = computed(() => currentStep.value < props.processedFields.steps.length - 1);
const isLastStep = computed(() => currentStep.value === props.processedFields.steps.length - 1);

// Current step info
const currentStepInfo = computed(() => {
    if (!hasSteps.value) return null;
    return props.processedFields.steps[currentStep.value];
});

// Progress percentage
const progressPercentage = computed(() => {
    if (!hasSteps.value) return 0;
    return ((currentStep.value + 1) / props.processedFields.steps.length) * 100;
});

// Validate current step
function validateCurrentStep() {
    const validation = formValidationService.validateStep(visibleFields.value, props.formData);
    
    // Update errors for current step fields
    Object.keys(props.formErrors).forEach(fieldId => {
        if (visibleFields.value.some(f => f.id === fieldId)) {
            delete props.formErrors[fieldId];
        }
    });
    
    Object.assign(props.formErrors, validation.errors);
    
    return !validation.hasErrors;
}

// Handle next step
function nextStep() {
    if (validateCurrentStep()) {
        currentStep.value++;
        scrollToTop();
    } else {
        // Focus first error field
        const firstErrorField = Object.keys(props.formErrors)[0];
        const errorElement = document.getElementById(`field-${firstErrorField}`);
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Handle previous step
function previousStep() {
    currentStep.value--;
    scrollToTop();
}

// Handle field update
function handleFieldUpdate(fieldId, value) {
    emit('updateField', fieldId, value);
}

// Handle form submission
function handleSubmit() {
    if (hasSteps.value && !isLastStep.value) {
        nextStep();
    } else {
        emit('submit');
    }
}

// Scroll to top of form
function scrollToTop() {
    const formElement = document.querySelector('.dynamic-form-builder');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Show progress bar
const showProgressBar = computed(() => {
    return hasSteps.value && props.formConfig.settings?.layout?.settings?.showProgressBar !== false;
});
</script>

<template>
    <div class="dynamic-form-builder">
        <!-- Progress Bar for multi-step forms -->
        <div v-if="showProgressBar" class="form-progress">
            <div class="progress-bar">
                <div 
                    class="progress-fill" 
                    :style="{ width: `${progressPercentage}%` }"
                ></div>
            </div>
            <div class="progress-text">
                Step {{ currentStep + 1 }} of {{ processedFields.steps.length }}
            </div>
        </div>
        
        <!-- Step Header -->
        <div v-if="hasSteps && currentStepInfo" class="step-header">
            <h3 class="step-title">{{ currentStepInfo.label }}</h3>
            <p v-if="currentStepInfo.description" class="step-description">
                {{ currentStepInfo.description }}
            </p>
        </div>
        
        <!-- Form Fields -->
        <div class="form-fields">
            <div class="fields-grid">
                <DynamicField
                    v-for="field in visibleFields"
                    :key="field.id"
                    :id="`field-${field.id}`"
                    :field="field"
                    :modelValue="formData[field.id]"
                    :errors="formErrors[field.id] || []"
                    :formData="formData"
                    :fieldMap="processedFields.fieldMap"
                    @update:modelValue="(value) => handleFieldUpdate(field.id, value)"
                />
            </div>
        </div>
        
        <!-- Form Actions -->
        <div class="form-actions">
            <ButtonComponent
                v-if="hasSteps && canGoBack"
                label="Previous"
                as="tertiary"
                @click="previousStep"
            />
            
            <div class="spacer"></div>
            
            <ButtonComponent
                v-if="hasSteps && canGoNext"
                label="Next"
                @click="nextStep"
            />
            
            <ButtonComponent
                v-if="!hasSteps || isLastStep"
                :label="submitting ? 'Submitting...' : 'Submit'"
                :loading="submitting"
                @click="handleSubmit"
            />
        </div>
    </div>
</template>

<style scoped>
.dynamic-form-builder {
    width: 100%;
}

.form-progress {
    margin-bottom: 32px;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background-color: var(--background-2);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: var(--brand-blue);
    transition: width 0.3s ease;
}

.progress-text {
    margin-top: 8px;
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
}

.step-header {
    margin-bottom: 32px;
}

.step-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-primary);
}

.step-description {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
}

.form-fields {
    margin-bottom: 32px;
}

.fields-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
}

.form-actions {
    display: flex;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
}

.spacer {
    flex: 1;
}

@media (max-width: 768px) {
    .fields-grid {
        gap: 16px;
    }
    
    .form-actions {
        flex-wrap: wrap;
    }
    
    .form-actions button {
        flex: 1;
        min-width: 120px;
    }
    
    .spacer {
        display: none;
    }
}
</style>