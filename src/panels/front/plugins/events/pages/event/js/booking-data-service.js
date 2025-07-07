import { api } from '@utils/api';

export default {
    createBooking(bookingData, eventId, organizationId) {
        const formattedData = this.formatBookingData(bookingData);
        return api.post(`organizations/${organizationId}/events/${eventId}/bookings`, formattedData);
    },

    formatBookingData(bookingData) {
        const { 
            name, 
            email, 
            notes, 
            guests, 
            selectedDate, 
            selectedTime, 
            duration, 
            timezone,
            slotData,
            customFields,
            customFieldsMetadata // Add this
        } = bookingData;
        
        let startTime, endTime;
        
        // If we have the full slot object from the API, use those times directly
        if (slotData && slotData.start && slotData.end) {
            startTime = slotData.start;
            endTime = slotData.end;
        } else {
            // Fall back to calculating times if we don't have the full slot
            startTime = this.createDateTimeStringInUTC(selectedDate, selectedTime, timezone);
            endTime = this.calculateEndTimeInUTC(selectedDate, selectedTime, duration, timezone);
        }
        
        console.log("Start time (UTC):", startTime);
        console.log("End time (UTC):", endTime);
        
        // Transform customFields to the desired format with labels
        const customFieldsArray = [];
        if (customFields && typeof customFields === 'object') {
            Object.keys(customFields).forEach(fieldId => {
                if (customFields[fieldId] !== undefined && customFields[fieldId] !== null && customFields[fieldId] !== '') {
                    customFieldsArray.push({
                        field_id: fieldId,
                        label: customFieldsMetadata?.[fieldId]?.label || fieldId, // Use actual label or fallback to field ID
                        value: customFields[fieldId]
                    });
                }
            });
        }
        
        // Create base booking data structure
        const formData = {
            event_id: null, // This will be set by the API based on the URL
            start_time: startTime,
            end_time: endTime,
            status: "confirmed", // Default status for new bookings
            form_data: JSON.stringify({
                primary_contact: {
                    name,
                    email
                },
                notes: notes || '',
                duration: duration,
                timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                custom_fields: customFieldsArray // Use the transformed array instead of empty object
            })
        };

        // Add guests as separate array for the API to process
        if (!formData.guests) {
            formData.guests = [];
        }
        
        // Add the primary contact as a guest
        formData.guests.push({
            name,
            email
        });

        // Add additional guests if any
        if (Array.isArray(guests) && guests.length > 0) {
            guests.forEach(guest => {
                if (guest.name && guest.email) {
                    formData.guests.push({
                        name: guest.name,
                        email: guest.email,
                        phone: guest.phone || null
                    });
                }
            });
        }

        return formData;
    },

    createDateTimeStringInUTC(date, timeString, timezone = null) {
        // Parse the time components
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // Create a date object with the selected date and time
        const dateObj = new Date(date);
        dateObj.setHours(hours, minutes, 0, 0);
        
        // If a timezone is specified, convert to UTC
        if (timezone) {
            // Create a formatted date string in ISO format
            const localDateISO = dateObj.toLocaleString('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // Parse the localized date string into a Date object
            const [datePart, timePart] = localDateISO.split(', ');
            const [month, day, year] = datePart.split('/').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            
            // Create a UTC date
            const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
            
            // Format as MySQL datetime string (YYYY-MM-DD HH:MM:SS)
            return utcDate.toISOString().replace('T', ' ').substring(0, 19);
        }
        
        // If no timezone specified, use the dateObj directly
        return dateObj.toISOString().replace('T', ' ').substring(0, 19);
    },

    calculateEndTimeInUTC(date, timeString, durationMinutes, timezone = null) {
        // Parse the time components
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // Create a date object with the selected date and time
        const dateObj = new Date(date);
        dateObj.setHours(hours, minutes, 0, 0);
        
        // Add duration
        dateObj.setMinutes(dateObj.getMinutes() + durationMinutes);
        
        // If a timezone is specified, convert to UTC
        if (timezone) {
            // Create a formatted date string in ISO format
            const localDateISO = dateObj.toLocaleString('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // Parse the localized date string into a Date object
            const [datePart, timePart] = localDateISO.split(', ');
            const [month, day, year] = datePart.split('/').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            
            // Create a UTC date
            const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
            
            // Format as MySQL datetime string (YYYY-MM-DD HH:MM:SS)
            return utcDate.toISOString().replace('T', ' ').substring(0, 19);
        }
        
        // If no timezone specified, use the dateObj directly
        return dateObj.toISOString().replace('T', ' ').substring(0, 19);
    },

    getAvailableSlots(eventSlug, orgSlug, date, duration, timezone = null, bufferHours = 1) {
        const formattedDate = date.toISOString().split('T')[0];
        let url = `public/organizations/${orgSlug}/events/${eventSlug}/available-slots?date=${formattedDate}&duration=${duration}`;
        
        // Add timezone parameter if provided
        if (timezone) {
            url += `&timezone=${encodeURIComponent(timezone)}`;
        }
        
        // Add buffer hours parameter
        url += `&buffer_hours=${bufferHours}`;
        
        return api.get(url);
    }
};