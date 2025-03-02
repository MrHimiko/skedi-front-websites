<script setup>
    import './style.css';

    import { onMounted, onUnmounted } from 'vue';
    import { common } from '@utils/common';

    import { refFilters, getFields, getValues, handleChange, handleRemove, handleSearch} from './logic';

    import InputComponent from '@form/input/view.vue';
    import ButtonComponent from '@form/button/view.vue';

    import BuilderPopupComponent from '@/components/builder/popup/view.vue';

    const props = defineProps({
        fields: {
            type: Array,
            required: true
        },
        search: {
            type: String
        },
        onChange: {
            type: Function
        }
    });

    onMounted(() => 
    {
        refFilters.value = common.query('filters', 'array');
    });

    onUnmounted(() => 
    {
        refFilters.value = [];
    });
</script>

<template>
    <div class="c-filters">
        <div class="top flex gap-lg">
            <input-component v-if="search" :onChange="(event, value) => handleSearch(value, search, onChange)" iconLeft="search" placeholder="Search"/>
            <button-component 
                v-if="fields?.length"
                v-popup="{
                    component: BuilderPopupComponent,
                    properties: {
                        class: 'h-auto',
                        callback: (event, data) => handleChange(event, data, fields, onChange),
                        title: 'Filters',
                        tabs: [
                            {
                                title: 'Equals',
                                components: getFields(fields)
                            }
                        ],
                        values: () => { return getValues() }
                    }
                }" 
                as="bg-0" 
                iconLeft="filter_alt" 
                label="Filtre"
            />
        </div>

        <div class="bottom flex gap-xl">
            <div v-for="(filter, filterIndex) in refFilters" class="transition-border">
                <div v-popup="{
                    component: BuilderPopupComponent,
                    properties: {
                        class: 'h-auto',
                        callback: (event, data) => handleChange(event, data, fields, onChange),
                        title: 'Filters',
                        tabs: [
                            {
                                title: 'Equals',
                                components: getFields(fields)
                            }
                        ],
                        values: () => { return getValues() }
                    },
                }">
                    <span class="ellipsis ellipsis-1">{{ filter.field }}</span>
                    <span class="ellipsis ellipsis-1">{{ filter.operator }}</span>
                    <span class="text-primary ellipsis ellipsis-1">{{ filter.value }}</span>
                </div>
                
                <i class="icon-xs" @click="handleRemove(filterIndex, onChange)">close</i>
            </div>
        </div>
    </div>
</template>