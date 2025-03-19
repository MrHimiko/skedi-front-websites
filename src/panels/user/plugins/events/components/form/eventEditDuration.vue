<script setup>
import { ref, onMounted } from 'vue';
import RepeaterComponent from '@/components/repeater/view.vue';
import ButtonComponent from '@form/button/view.vue';
import { api } from '@utils/api';

const props = defineProps({
  // These props come from the popup configuration
  endpoint: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  callback: {
    type: Function,
    required: true
  },
  values: {
    type: Function,
    required: true
  }
});

const loading = ref(false);
const durations = ref([]);
const durationRepeater = ref(null);

// Define the form components for each duration item
const durationComponents = [
  {
    type: 'Input',
    name: 'title',
    label: 'Title',
    width: 8,
    properties: {
      placeholder: 'e.g., Quick Call, Full Session'
    }
  },
  {
    type: 'Input',
    name: 'duration',
    label: 'Duration (minutes)',
    width: 4,
    properties: {
      placeholder: '30',
      type: 'number',
    }
  }
];

// Initialize with values from props
onMounted(() => {
  const initialValues = props.values();
  
  // Get duration from initialValues
  let initialDurations = initialValues.duration;
  
  // Handle different formats of duration (including legacy integer format)
  if (typeof initialDurations === 'number') {
    // Convert legacy integer format to array format
    initialDurations = [{
      title: '',
      description: '',
      duration: initialDurations
    }];
  } else if (!Array.isArray(initialDurations) || initialDurations.length === 0) {
    // Default to one empty item if no durations are provided
    initialDurations = [{
      title: '',
      description: '',
      duration: 30
    }];
  }
  
  durations.value = initialDurations;
  
  // Initialize repeater with items
  setTimeout(() => {
    if (durationRepeater.value) {
      // Add an item for each duration
      durations.value.forEach(() => {
        durationRepeater.value.addItem();
      });
    }
  }, 100);
});

// Method to get duration data from the repeater
function getDurationData() {
  const builders = document.querySelectorAll('.c-repeater .c-builder');
  const durationsData = [];
  
  builders.forEach(builder => {
    const formElements = builder.querySelectorAll('input, textarea, select');
    const durationData = {};
    
    formElements.forEach(element => {
      if (element.name === 'title') {
        durationData.title = element.value || '';
      } else if (element.name === 'description') {
        durationData.description = element.value || '';
      } else if (element.name === 'duration') {
        const durationValue = parseInt(element.value);
        // Ensure duration is a positive integer
        durationData.duration = isNaN(durationValue) || durationValue <= 0 ? 30 : Math.floor(durationValue);
      }
    });
    
    durationsData.push(durationData);
  });
  
  return durationsData;
}

// Save changes
async function saveChanges() {
  if (loading.value) return;
  
  loading.value = true;
  
  try {
    const durations = getDurationData();
    
    // Validate that we have at least one duration
    if (durations.length === 0) {
      durations.push({ title: '', description: '', duration: 30 });
    }
    
    // Validate that all durations have a valid duration value
    durations.forEach(d => {
      if (!d.duration || d.duration <= 0) {
        d.duration = 30;
      }
    });
    
    // Make API request
    const response = await api[props.type.toLowerCase()](props.endpoint, { duration: durations });
    
    // Call the callback with the response
    if (props.callback) {
      props.callback(null, { duration: durations }, response, response.success);
    }
  } catch (error) {
    console.error('Failed to save durations:', error);
    
    // Call callback with error
    if (props.callback) {
      props.callback(error, { duration: getDurationData() }, null, false);
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="event-durations">
    <h3>Duration Options</h3>
    <p class="text-secondary">Define different duration options that attendees can choose from.</p>
    <div class="p-lg"></div>
    
    <repeater-component 
      ref="durationRepeater"
      :components="durationComponents"
      label="Duration Option"
      name="durations"
    />
    
    <div class="p-xl"></div>
    
    <div class="actions">
      <button-component 
        :label="loading ? 'Saving...' : 'Save Duration Options'" 
        :loading="loading"
        @click="saveChanges"
      />
    </div>
  </div>
</template>




<style>
.event-durations {
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-height: 80vh;
    overflow: auto;
}

.event-durations .c-repeater {
    margin-top: 20px;
}

.event-durations .c-repeater > .items > .item > .top {
  position: absolute;
  right:0;
}

.event-durations .c-repeater > .items > .item > .top .toggle   {
  display: none!important;
}

.event-durations .c-repeater > .items > .item > .top .left {
    display: none!important;
}

.event-durations .c-repeater > .items > .item > .bottom {
  border-top: none;
  margin-top: 0;
  padding-top:0;
}

.event-durations .c-repeater {
  padding:0 ;
  border:none;
}

.event-durations .c-repeater > .items > .item {
  padding:0 ;
  border:none;
}

.event-durations .c-repeater > .items > .item form {
  background: var(--background-1);
  padding: 15px;
}

.event-durations .c-builder > .content {
  padding-bottom: 0;
}

</style>