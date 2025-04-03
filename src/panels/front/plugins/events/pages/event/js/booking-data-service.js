import { api } from '@utils/api';

export default {
  createBooking(bookingData, eventId, organizationId) {
    const formattedData = this.formatBookingData(bookingData);
    return api.post(`organizations/${organizationId}/events/${eventId}/bookings`, formattedData);
  },

  formatBookingData(bookingData) {
    const { name, email, notes, guests, selectedDate, selectedTime, duration } = bookingData;
    const startTime = this.createDateTimeString(selectedDate, selectedTime);
    const endTime = this.calculateEndTime(selectedDate, selectedTime, duration);

    console.log("WOOO", startTime);
    console.log("WOOO2", endTime);
    
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
        custom_fields: {} // Reserved for future form builder fields
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

  createDateTimeString(date, timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateObj = new Date(date);
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj.toISOString().replace('T', ' ').substring(0, 19);
  },

  calculateEndTime(date, timeString, durationMinutes) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateObj = new Date(date);
    dateObj.setHours(hours, minutes, 0, 0);
    dateObj.setMinutes(dateObj.getMinutes() + durationMinutes);
    return dateObj.toISOString().replace('T', ' ').substring(0, 19);
  },

  getAvailableSlots(eventSlug, orgSlug, date, duration) {
    const formattedDate = date.toISOString().split('T')[0];
    return api.get(`public/organizations/${orgSlug}/events/${eventSlug}/available-slots?date=${formattedDate}&duration=${duration}`);
  }
};