<!-- File: src/components/forms/dynamic/DynamicForm.vue -->

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import DynamicFormBuilder from './DynamicFormBuilder.vue';
import formConfigService from './services/form-config.service';
import formValidationService from './services/form-validation.service';
import formSubmissionService from './services/form-submission.service';
import { common } from '@utils/common';

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
    console.log('[DynamicForm] loadForm called');
    console.log('Form ID:', props.formId);
    console.log('API Endpoint:', props.apiEndpoint);
    
    try {
        loading.value = true;
        error.value = null;
        
        // Fetch form config
        const config = await formConfigService.getFormConfig(props.apiEndpoint);
        console.log('[DynamicForm] Form config loaded:', config);
        
        formConfig.value = config;
        
        // Process fields
        processedFields.value = formConfigService.processFormFields(config.fields);
        console.log('[DynamicForm] Processed fields:', processedFields.value);
        
        // Load saved progress if available
        const savedProgress = formSubmissionService.loadProgress(props.formId);
        if (savedProgress && savedProgress.data) {
            formData.value = { ...savedProgress.data, ...props.initialData };
        } else {
            formData.value = { ...props.initialData };
        }
        
        console.log('[DynamicForm] Initial form data:', formData.value);
        
        emit('load', config);
        
        // Start auto-save if enabled
        if (props.autoSave || config.settings?.layout?.settings?.autoSave) {
            startAutoSave();
        }
        
    } catch (err) {
        console.error('[DynamicForm] Error loading form:', err);
        error.value = err.message || 'Failed to load form';
        common.notification('Failed to load form', false);
        emit('error', err);
    } finally {
        loading.value = false;
    }
}

// Handle form field updates
function updateField(fieldId, value) {
    console.log('[DynamicForm] updateField called:', {
        fieldId,
        oldValue: formData.value[fieldId],
        newValue: value,
        currentFormData: formData.value
    });
    
    formData.value[fieldId] = value;
    
    console.log('[DynamicForm] Form data after update:', formData.value);
    
    // Clear field errors when user starts typing
    if (formErrors.value[fieldId]) {
        delete formErrors.value[fieldId];
    }
    
    // Trigger auto-save
    if (props.autoSave || formConfig.value?.settings?.layout?.settings?.autoSave) {
        debouncedAutoSave();
    }
}

// Get only visible fields for validation
function getVisibleFieldsForValidation() {
    if (!processedFields.value) {
        return [];
    }
    
    // Get all fields (including nested ones from groups)
    const allFields = processedFields.value.hasSteps ? getAllStepFields() : processedFields.value.rootFields;
    
    // Flatten nested fields and filter by visibility
    const flattenedFields = [];
    
    function processField(field) {
        // Check if this specific field is visible
        const isFieldVisible = formConfigService.checkFieldVisibility(field, formData.value);
        
        console.log(`[DynamicForm] Checking field visibility: ${field.id || field.name}`, {
            type: field.type,
            isVisible: isFieldVisible,
            hasVisibility: !!field.visibility,
            formData: formData.value
        });
        
        if (field.type === 'group') {
            // For groups, only process children if the group itself is visible
            if (isFieldVisible && field.children) {
                field.children.forEach(childId => {
                    const childField = processedFields.value.fieldMap.get(childId);
                    if (childField) {
                        processField(childField);
                    }
                });
            }
        } else if (!['divider', 'image', 'video', 'step'].includes(field.type)) {
            // For regular fields, add them if visible
            if (isFieldVisible) {
                flattenedFields.push(field);
            }
        }
    }
    
    allFields.forEach(processField);
    
    console.log('[DynamicForm] Final visible fields for validation:', flattenedFields.map(f => ({
        id: f.id || f.name,
        type: f.type,
        label: f.label,
        required: f.required
    })));
    
    return flattenedFields;
}

// Validate form
function validateForm() {
    console.log('[DynamicForm] validateForm called');
    
    if (!processedFields.value) {
        console.log('[DynamicForm] No processed fields available');
        return false;
    }
    
    // Get only visible fields for validation
    const visibleFields = getVisibleFieldsForValidation();
    
    console.log('[DynamicForm] Visible fields for validation:', visibleFields.map(f => ({
        id: f.id || f.name,
        type: f.type,
        required: f.required,
        currentValue: formData.value[f.id || f.name]
    })));
    
    // Validate only visible fields
    const validation = formValidationService.validateForm(visibleFields, formData.value);
    
    // Clear all previous errors first
    formErrors.value = {};
    
    // Set new errors only for visible fields
    formErrors.value = validation.errors;
    
    console.log('[DynamicForm] Validation result:', {
        hasErrors: validation.hasErrors,
        errors: validation.errors,
        visibleFieldCount: visibleFields.length
    });
    
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
    console.log('[DynamicForm] handleSubmit called');
    console.log('[DynamicForm] Current form data:', formData.value);
    console.log('[DynamicForm] Submitting state:', submitting.value);
    
    // Prevent double submission
    if (submitting.value) {
        console.log('[DynamicForm] Already submitting, ignoring');
        return;
    }
    
    // Validate form
    console.log('[DynamicForm] Starting validation...');
    if (!validateForm()) {
        console.log('[DynamicForm] Validation failed, showing errors');
        console.log('[DynamicForm] Current errors:', formErrors.value);
        
        // Show notification for validation errors
        const errorCount = Object.keys(formErrors.value).length;
        const firstError = Object.values(formErrors.value)[0]?.[0] || 'Please fix the form errors';
        
        // Show notification using common utility
        common.notification(`Please fix form errors: ${firstError}`, false);
        
        // Scroll to first error
        const firstErrorField = Object.keys(formErrors.value)[0];
        console.log('[DynamicForm] First error field:', firstErrorField);
        
        if (firstErrorField) {
            // Wait a bit for the DOM to update with error messages
            setTimeout(() => {
                const errorElement = document.getElementById(`field-${firstErrorField}`);
                console.log('[DynamicForm] Error element found:', !!errorElement);
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
        return;
    }
    
    console.log('[DynamicForm] Validation passed, proceeding with submission');
    
    try {
        submitting.value = true;
        error.value = null;
        
        console.log('[DynamicForm] Setting submitting to true');
        
        // Get visible fields for submission (same logic as validation)
        const visibleFields = getVisibleFieldsForValidation();
        
        console.log('[DynamicForm] Visible fields for submission:', visibleFields);
        
        // Prepare submission data
        const submissionData = formSubmissionService.prepareSubmissionData(
            formData.value,
            visibleFields,
            formConfig.value
        );
        
        console.log('[DynamicForm] Prepared submission data:', submissionData);
        
        // Include form configuration in the response
        const responseData = {
            ...submissionData,
            formConfig: formConfig.value // Include the full form configuration
        };
        
        console.log('[DynamicForm] Final response data:', responseData);
        
        // Submit form
        if (props.submissionEndpoint) {
            console.log('[DynamicForm] Submitting to endpoint:', props.submissionEndpoint);
            const response = await formSubmissionService.submitForm(
                props.submissionEndpoint,
                submissionData
            );
            
            console.log('[DynamicForm] API response:', response);
            
            // Clear saved progress on successful submission
            formSubmissionService.clearProgress(props.formId);
            
            // Show success notification
            common.notification('Form submitted successfully!', true);
            
            emit('submit', { ...response, formConfig: formConfig.value });
        } else {
            console.log('[DynamicForm] No submission endpoint, emitting data directly');
            // Just emit the data if no submission endpoint
            common.notification('Form completed successfully!', true);
            emit('submit', responseData);
        }
        
    } catch (err) {
        console.error('[DynamicForm] Submission error:', err);
        error.value = err.message || 'Failed to submit form';
        
        // Show error notification
        common.notification(err.message || 'Failed to submit form', false);
        
        emit('error', err);
    } finally {
        console.log('[DynamicForm] Setting submitting to false');
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
    console.log('[DynamicForm] component mounted');
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