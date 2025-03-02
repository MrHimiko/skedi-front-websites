<script setup lang="ts">
import './style.css';

import { ref } from 'vue';

import ButtonComponent from '@form/button/view.vue';
import BuilderComponent from '@/components/builder/view.vue';

defineProps({
    components: {
        type: Array,
        required: true,
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

function addItem() 
{
    items.value.push({});
}

function removeItem(index: number) 
{
    items.value.splice(index, 1);
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
</script>

<!-- v-sortable="{ options: { handle: '.i-sortable-handle' } }" -->

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

                        <i class="action" @click="removeItem(itemIndex)">close</i>
                    </div>
                </div>
                <div class="bottom" v-show="!toggled.includes(itemIndex)">
                    <builder-component :name="name" :actions="false" :tabs="[
                        {
                            title: 'General',
                            components,
                        }
                    ]"></builder-component>
                </div>
            </div>
        </div>

        <button-component :label="'Add ' + (label ? label : 'Item')" @click="addItem"></button-component>
    </div>
</template>
