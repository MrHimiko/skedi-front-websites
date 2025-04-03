<script setup lang="ts">
import './style.css';

import { ref, watch, onMounted, defineExpose } from 'vue';
import {  PhPlus } from "@phosphor-icons/vue";
import ButtonComponent from '@form/button/view.vue';
import BuilderComponent from '@/components/builder/view.vue';

const props = defineProps({
    components: {
        type: Array,
        required: true,
    },
    initialItems: {
        type: Array,
        default: () => []
    },
    label: {
        type: String,
    },
    name: {
        type: String
    }
});

const items = ref([] as any);
const toggled = ref([] as any); 

// Initialize with any provided items
onMounted(() => {
    resetItems();
});

// Watch for changes in initialItems
watch(() => props.initialItems, (newItems) => {
    resetItems();
}, { deep: true });

// Reset all items based on initialItems prop
function resetItems() {
    // Clear current items
    items.value = [];
    
    // Add new items for each initialItem
    if (props.initialItems && props.initialItems.length > 0) {
        props.initialItems.forEach(() => {
            addItem();
        });
    }
}

function addItem() 
{
    items.value.push({});
    return items.value.length - 1; // Return the index of the new item
}

function removeItem(index: number) {
  items.value.splice(index, 1);
  toggled.value = toggled.value.filter(i => i !== index);
  toggled.value = toggled.value.map(i => i > index ? i - 1 : i);
}

function toggle(index: number) 
{
    if (toggled.value.includes(index)) 
    {
        toggled.value = toggled.value.filter(i => i !== index);
    } 
    else 
    {
        toggled.value.push(index); 
    }
}

// Expose methods for parent components
defineExpose({
    addItem,
    removeItem,
    getItems: () => items.value
});
</script>

<template>
    <div class="c-repeater">
        <div v-auto-animate="{ duration: 150 }" class="items">
            <div v-for="(item, itemIndex) in items" :key="itemIndex" class="item">
                <div class="top">
                    <div class="left">
                        <!-- <i class="action i-sortable-handle">drag_indicator</i> -->
                        <p>{{ label ? label : 'Item'}} Information</p>
                    </div>
                    <div class="right">
                        <div :class="['action', 'toggle', !toggled.includes(itemIndex) ? 'opened' : '']" @click="toggle(itemIndex)">
                            <i>keyboard_arrow_down</i>
                        </div>

                        <i v-tooltip="{ content: 'Remove item' }" class="action" @click="removeItem(itemIndex)">close</i>
                    </div>
                </div>
                <div class="bottom" v-show="!toggled.includes(itemIndex)">
                    <builder-component 
                      :name="name" 
                      :actions="false" 
                      :tabs="[
                          {
                              title: 'General',
                              components,
                          }
                      ]"
                      :values="() => props.initialItems && props.initialItems.length > itemIndex ? props.initialItems[itemIndex] : {}"
                    ></builder-component>
                </div>
            </div>
        </div>

        <button-component :iconLeft="{ component: PhPlus, weight: 'bold' }" as="secondary"  :label="'Add ' + (label ? label : 'Item')" @click="addItem"></button-component>
    </div>
</template>