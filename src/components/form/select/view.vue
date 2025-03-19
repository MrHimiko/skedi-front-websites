<script setup>
    import './style.css';
    import { ref, onMounted, onUnmounted, watch } from 'vue';
    import { fetch } from '@utils/fetch';
    import { PhCaretDown } from "@phosphor-icons/vue";
    import InputComponent from '@form/input/view.vue';
    import MenusComponent from '@global/menus/view.vue';
    
    const props = defineProps({
        options: {
            type: Array
        },
        endpoint: {
            type: String
        },
        label: {
            type: String
        },
        name: {
            type: String
        },
        type: {
            type: String,
            default: 'text'
        },
        required: {
            type: Boolean
        },
        value: {
            type: String
        },
        placeholder: {
            type: String
        },
        iconLeft: {
            type: String,
            default: ''
        },
        iconRight: {
            type: String,
            default: 'unfold_more'
        }
    });
    
    // Important: Define the emits
    const emit = defineEmits(['update:value', 'change', 'input']);
    
    const refValue = ref(props.value);
    const refDisplay = ref(null);
    
    // Watch for value prop changes
    watch(() => props.value, (newValue) => {
        refValue.value = newValue;
        
        // Update display value when value changes externally
        if(Array.isArray(props.options)) {
            props.options.forEach((option) => {
                if(option.value == newValue) {
                    refDisplay.value = option.label;
                }
            });
        }
    });
    
    function onClick(event, item, index) {
        refValue.value = item.value;
        refDisplay.value = item.label;
        
        // Emit the change to parent components
        emit('update:value', item.value);
        emit('change', item.value);
        emit('input', item.value);
        
        console.log('Select value changed to:', item.value);
    }
    
    // Handle input changes
    function handleInput(event, value) {
        emit('input', value);
    }
    
    function handleChange(event, value) {
        emit('change', value);
    }
    
    onMounted(() => {
        if(props.endpoint && props.value) {
            refDisplay.value = 'Loading...';
            
            fetch.one(props.endpoint + '/' + props.value).then((data) => {
                refDisplay.value = (data.name ?? data.title);
            });
        }
        else if(Array.isArray(props.options)) {
            props.options.forEach((option) => {
                if(option.value == props.value) {
                    refDisplay.value = option.label;
                }
            });
        }
    });
    
    onUnmounted(() => {
        refDisplay.value = null;
    });
</script>

<template>
    <div class="c-select">
        <input-component 
            v-dropdown="{ component: MenusComponent, properties: { onClick, search: true, endpoint, menus: options} }"
            :label="label"
            :name="name"
            :type="type"
            :required="required"
            :value="refValue"
            :placeholder="placeholder"
            :display="refDisplay"
            :iconLeft="iconLeft"
            :iconRight="iconRight"
            @onInput="handleInput"
            @onChange="handleChange"
        />
        <PhCaretDown weight="fill"/>
    </div>
</template>