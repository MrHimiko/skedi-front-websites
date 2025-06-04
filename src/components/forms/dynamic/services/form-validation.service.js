// File: src/components/forms/dynamic/services/form-validation.service.js

export default {
    // Validate a single field
    validateField(field, value) {
        const errors = [];
        
        // Required validation
        if (field.required) {
            if (this.isEmpty(value)) {
                errors.push(`${field.label} is required`);
            }
        }
        
        // Type-specific validation
        switch (field.type) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    errors.push('Please enter a valid email address');
                }
                break;
                
            case 'number':
                if (value && isNaN(Number(value))) {
                    errors.push('Please enter a valid number');
                }
                if (field.min !== undefined && Number(value) < field.min) {
                    errors.push(`Value must be at least ${field.min}`);
                }
                if (field.max !== undefined && Number(value) > field.max) {
                    errors.push(`Value must be at most ${field.max}`);
                }
                break;
                
            case 'text':
                if (field.minLength && value && value.length < field.minLength) {
                    errors.push(`Must be at least ${field.minLength} characters`);
                }
                if (field.maxLength && value && value.length > field.maxLength) {
                    errors.push(`Must be at most ${field.maxLength} characters`);
                }
                if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
                    errors.push(field.patternMessage || 'Invalid format');
                }
                break;
                
            case 'file':
                if (value) {
                    // Handle both single and multiple files
                    const files = Array.isArray(value) ? value : [value];
                    
                    files.forEach(file => {
                        // Check file size
                        if (field.maxFileSize) {
                            const maxSizeBytes = field.maxFileSize * 1024 * 1024;
                            if (file.size > maxSizeBytes) {
                                errors.push(`File size must be less than ${field.maxFileSize}MB`);
                            }
                        }
                        
                        // Check file type
                        if (field.acceptedFileTypes) {
                            const accepted = field.acceptedFileTypes.split(' ');
                            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                            if (!accepted.includes(fileExt)) {
                                errors.push(`File type must be: ${field.acceptedFileTypes}`);
                            }
                        }
                    });
                }
                break;
                
            case 'date':
                if (value) {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) {
                        errors.push('Please enter a valid date');
                    }
                    
                    // Min/max date validation
                    if (field.minDate && date < new Date(field.minDate)) {
                        errors.push(`Date must be after ${new Date(field.minDate).toLocaleDateString()}`);
                    }
                    if (field.maxDate && date > new Date(field.maxDate)) {
                        errors.push(`Date must be before ${new Date(field.maxDate).toLocaleDateString()}`);
                    }
                }
                break;
                
            case 'checkbox':
                if (field.required && (!value || value.length === 0)) {
                    errors.push('Please select at least one option');
                }
                if (field.minSelection && value && value.length < field.minSelection) {
                    errors.push(`Please select at least ${field.minSelection} options`);
                }
                if (field.maxSelection && value && value.length > field.maxSelection) {
                    errors.push(`Please select at most ${field.maxSelection} options`);
                }
                break;
        }
        
        return errors;
    },
    
    // Check if value is empty
    isEmpty(value) {
        if (value === null || value === undefined || value === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'object' && Object.keys(value).length === 0) return true;
        return false;
    },
    
    // Validate email format
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Validate entire form
    validateForm(visibleFields, formData) {
        const errors = {};
        let hasErrors = false;
        
        visibleFields.forEach(field => {
            // Skip non-input fields
            if (['divider', 'image', 'video', 'step', 'group'].includes(field.type)) {
                return;
            }
            
            const fieldErrors = this.validateField(field, formData[field.id]);
            if (fieldErrors.length > 0) {
                errors[field.id] = fieldErrors;
                hasErrors = true;
            }
        });
        
        return { errors, hasErrors };
    },
    
    // Validate a single step
    validateStep(stepFields, formData) {
        const errors = {};
        let hasErrors = false;
        
        stepFields.forEach(field => {
            if (['divider', 'image', 'video'].includes(field.type)) {
                return;
            }
            
            const fieldErrors = this.validateField(field, formData[field.id]);
            if (fieldErrors.length > 0) {
                errors[field.id] = fieldErrors;
                hasErrors = true;
            }
        });
        
        return { errors, hasErrors };
    }
};