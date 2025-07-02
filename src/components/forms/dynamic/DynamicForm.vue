<!-- File: src/components/forms/dynamic/DynamicForm.vue -->

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import DynamicFormBuilder from './DynamicFormBuilder.vue';
import formConfigService from './services/form-config.service';
import formValidationService from './services/form-validation.service';
import formSubmissionService from './services/form-submission.service';

const props = defineProps({
    formId: {
        type: String,
        required: true
    },
    apiEndpoint: {
        type: String,
        required: true
    },
    submissionEndpoint: {
        type: String,
        default: null
    },
    initialData: {
        type: Object,
        default: () => ({})
    },
    autoSave: {
        type: Boolean,
        default: false
    },
    autoSaveInterval: {
        type: Number,
        default: 30000 // 30 seconds
    }
});

const emit = defineEmits(['submit', 'error', 'load', 'save']);

// State
const loading = ref(true);
const submitting = ref(false);
const error = ref(null);
const formConfig = ref(null);
const formData = ref({});
const formErrors = ref({});
const processedFields = ref(null);

// Auto-save timer
let autoSaveTimer = null;

// Load form configuration
async function loadForm() {
    console.log('DynamicForm loadForm called');
    console.log('Form ID:', props.formId);
    console.log('API Endpoint:', props.apiEndpoint);
    
    try {
        loading.value = true;
        error.value = null;
        
        // Fetch form config
        const config = await formConfigService.getFormConfig(props.apiEndpoint);
        formConfig.value = config;
        
        // Process fields
        processedFields.value = formConfigService.processFormFields(config.fields);
        
        // Load saved progress if available
        const savedProgress = formSubmissionService.loadProgress(props.formId);
        if (savedProgress && savedProgress.data) {
            formData.value = { ...savedProgress.data, ...props.initialData };
        } else {
            formData.value = { ...props.initialData };
        }
        
        emit('load', config);
        
        // Start auto-save if enabled
        if (props.autoSave || config.settings?.layout?.settings?.autoSave) {
            startAutoSave();
        }
        
    } catch (err) {
        error.value = err.message || 'Failed to load form';
        emit('error', err);
    } finally {
        loading.value = false;
    }
}

// Handle form field updates
function updateField(fieldId, value) {
    formData.value[fieldId] = value;
    
    // Clear field errors when user starts typing
    if (formErrors.value[fieldId]) {
        delete formErrors.value[fieldId];
    }
    
    // Trigger auto-save
    if (props.autoSave || formConfig.value?.settings?.layout?.settings?.autoSave) {
        debouncedAutoSave();
    }
}

// Validate form
function validateForm() {
    if (!processedFields.value) return false;
    
    // Get all visible fields
    const visibleFields = formConfigService.getVisibleFields(
        processedFields.value.hasSteps ? getAllStepFields() : processedFields.value.rootFields,
        formData.value,
        processedFields.value.fieldMap
    );
    
    // Validate
    const validation = formValidationService.validateForm(visibleFields, formData.value);
    formErrors.value = validation.errors;
    
    return !validation.hasErrors;
}

// Get all fields from all steps
function getAllStepFields() {
    const allFields = [];
    processedFields.value.steps.forEach(step => {
        const stepFields = formConfigService.getStepFields(step, processedFields.value.fieldMap);
        allFields.push(...stepFields);
    });
    return allFields;
}

// Handle form submission
async function handleSubmit() {
    // Validate form
    if (!validateForm()) {
        // Scroll to first error
        const firstErrorField = Object.keys(formErrors.value)[0];
        const errorElement = document.getElementById(`field-${firstErrorField}`);
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    try {
        submitting.value = true;
        error.value = null;
        
        // Get visible fields for submission
        const visibleFields = formConfigService.getVisibleFields(
            processedFields.value.hasSteps ? getAllStepFields() : processedFields.value.rootFields,
            formData.value,
            processedFields.value.fieldMap
        );
        
        // Prepare submission data
        const submissionData = formSubmissionService.prepareSubmissionData(
            formData.value,
            visibleFields,
            formConfig.value
        );
        
        // Include form configuration in the response
        const responseData = {
            ...submissionData,
            formConfig: formConfig.value // Include the full form configuration
        };
        
        // Submit form
        if (props.submissionEndpoint) {
            const response = await formSubmissionService.submitForm(
                props.submissionEndpoint,
                submissionData
            );
            
            // Clear saved progress on successful submission
            formSubmissionService.clearProgress(props.formId);
            
            emit('submit', { ...response, formConfig: formConfig.value });
        } else {
            // Just emit the data if no submission endpoint
            emit('submit', responseData);
        }
        
    } catch (err) {
        error.value = err.message || 'Failed to submit form';
        emit('error', err);
    } finally {
        submitting.value = false;
    }
}

// Auto-save functionality
function startAutoSave() {
    autoSaveTimer = setInterval(() => {
        saveProgress();
    }, props.autoSaveInterval);
}

function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

async function saveProgress() {
    const saved = await formSubmissionService.saveProgress(props.formId, formData.value);
    emit('save', saved);
}

// Debounced auto-save
let saveTimeout = null;
function debouncedAutoSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveProgress();
    }, 2000);
}

// Form title and description
const formTitle = computed(() => formConfig.value?.name || 'Form');
const formDescription = computed(() => formConfig.value?.description || '');

// Success message
const successMessage = computed(() => 
    formConfig.value?.settings?.submission?.successMessage || 'Thank you for submitting!'
);

// Mount
onMounted(() => {
    console.log('DynamicForm component mounted');
    loadForm();
});

// Cleanup
onUnmounted(() => {
    stopAutoSave();
    if (saveTimeout) clearTimeout(saveTimeout);
});
</script>

<template>
    <div class="dynamic-form">
        <!-- Loading State -->
        <div v-if="loading" class="form-loading">
            <div class="loader"></div>
            <p>Loading form...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="form-error">
            <h3>Error Loading Form</h3>
            <p>{{ error }}</p>
            <button @click="loadForm" class="retry-button">
                Try Again
            </button>
        </div>
        
        <!-- Form Content -->
        <div v-else-if="formConfig" class="form-content">

            <!-- Form Builder -->
            <DynamicFormBuilder
                :formConfig="formConfig"
                :processedFields="processedFields"
                :formData="formData"
                :formErrors="formErrors"
                :submitting="submitting"
                @updateField="updateField"
                @submit="handleSubmit"
            />
        </div>
    </div>
</template>

<style scoped>
.dynamic-form {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.form-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    text-align: center;
}

.loader {
    border: 3px solid var(--background-2);
    border-radius: 50%;
    border-top: 3px solid var(--brand-blue);
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.form-error {
    text-align: center;
    padding: 40px;
    background-color: var(--background-1);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.form-error h3 {
    color: var(--red-default);
    margin-bottom: 10px;
}

.retry-button {
    margin-top: 20px;
    padding: 8px 16px;
    background-color: var(--brand-blue);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.form-header {
    margin-bottom: 32px;
}

.form-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-primary);
}

.form-description {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
}
</style>