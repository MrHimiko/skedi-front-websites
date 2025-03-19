<script setup>
import { ref, onMounted, toRaw, computed } from 'vue';
import { common } from '@utils/common';
import RepeaterComponent from '@/components/repeater/view.vue';
import ButtonComponent from '@form/button/view.vue';
import { api } from '@utils/api';

const props = defineProps({
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
// Initialize with default value, then update it in onMounted
const durations = ref([{
  title: '',
  description: '',
  duration: 30
}]);

// Form components for duration items
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

// Extract and initialize duration data before mounting
const extractDurations = () => {
  try {
    const initialValues = props.values();
    // Convert proxy to raw object to avoid reactivity issues
    let initialDurations = toRaw(initialValues.duration);
    
    // Handle different formats of duration
    if (typeof initialDurations === 'number') {
      return [{
        title: '',
        description: '',
        duration: initialDurations
      }];
    } else if (Array.isArray(initialDurations) && initialDurations.length > 0) {
      return initialDurations;
    }
    
    // Default value if none of the above conditions are met
    return [{
      title: '',
      description: '',
      duration: 30
    }];
  } catch (error) {
    console.error('Error extracting durations:', error);
    return [{
      title: '',
      description: '',
      duration: 30
    }];
  }
};

// Initialize durations immediately
durations.value = extractDurations();

// Also update in onMounted to ensure we have the latest values
onMounted(() => {
  durations.value = extractDurations();
});

// Get duration data from the repeater DOM elements
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
        durationData.duration = isNaN(durationValue) || durationValue <= 0 ? 30 : Math.floor(durationValue);
      }
    });
    
    durationsData.push(durationData);
  });
  
  return durationsData;
}



// Save changes to API
async function saveChanges() {
  if (loading.value) return;
  
  const durations = getDurationData();
  
  // Check if there's at least one duration
  if (durations.length === 0) {
    common.notification('Minimum one duration slot is required', false);
    return;
  }
  
  loading.value = true;
  
  try {
    // Ensure all durations have valid values
    durations.forEach(d => {
      if (!d.duration || d.duration <= 0) {
        d.duration = 30;
      }
    });
    
    // API request
    const response = await api[props.type.toLowerCase()](props.endpoint, { duration: durations });
    
    if (props.callback) {
      props.callback(null, { duration: durations }, response, response.success);
    }
  } catch (error) {
    console.error('Failed to save durations:', error);
    
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

    <div class="hide-while-creating-event">
      <h3>Duration Options</h3>
      <p class="text-secondary">Define different duration options that attendees can choose from.</p>
      <div class="p-lg"></div>
    </div>
    
    
    <repeater-component 
      :components="durationComponents"
      :initialItems="durations"
      label="Duration Option"
      name="durations"
    />
    
    <div class="hide-while-creating-event">
      <div class="p-xl"></div>
      
      <div class="actions">
        <div class="c-button tertiary pointer i-popup-close" as="stroke">Close</div>
        <button-component 
          :label="loading ? 'Saving...' : 'Save Duration Options'" 
          :loading="loading"
          @click="saveChanges"
        />
      </div>
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

.event-durations .c-repeater > .items > .item > .top .toggle {
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
  padding:0;
  border:none;
}

.event-durations .c-repeater > .items > .item {
  padding:0;
  border:none;
}

.event-durations .c-repeater > .items > .item form {
  background: var(--background-1);
  padding: 15px;
}

.event-durations .c-builder > .content {
  padding-bottom: 0;
}

.event-durations .actions {
  display: flex;
  gap: 10px;
}

</style>