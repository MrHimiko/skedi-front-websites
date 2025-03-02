<script setup>
    import './style.css';

    import HolderComponent from '@global/holder/view.vue';

    const props = defineProps({
        headings: {
            type: Array,
            required: true
        },
        keys: {
            type: Array,
            required: true
        },
        values: {
            type: Array,
            required: true
        },
        sticky: {
            type: Boolean,
            default: true
        },
        as: {
            type: String,
        },
        empty: {
            type: String,
        },
        onSort: {
            type: Function
        }
    });

    let items = props.values;

    function onScroll(event)
    {
        const target = event.target;
        
        if(target.scrollLeft)
        {
            event.target.classList.add('scrolled');
        }
        else 
        {
            event.target.classList.remove('scrolled');
        }
    }

    function onSortEnd(element, event) 
    {
        const values = [];

        [...element.children].forEach((child, newIndex) => 
        {
            const oldIndex = child.getAttribute('index');

            values.push(items[parseInt(oldIndex, 10)]);

            child.setAttribute('index', newIndex);
        });

        items = values;

        if(props.onSort) 
        {
            props.onSort(values, element, event);
        }
    }
</script>

<template>
    <div @scroll="onScroll" :class="['c-table', 'scrollbar', sticky ? 'sticky' : '', as]">
        <div :class="'grid-' + headings.length">
            <div class="row header">
                <div v-for="(heading, headingIndex) in headings" :key="headingIndex" class="cell">{{ heading }}</div>
            </div>
        </div>

        <div v-sortable="onSort ? {options: {handle: '.sort-handle'}, onEnd: onSortEnd} : null" :class="'grid-' + headings.length">

            <div :index="rowIndex" class="row" v-for="(row, rowIndex) in values" :key="row.id ?? rowIndex">
                <div class="cell" v-for="(key, keyIndex) in keys" :key="keyIndex">
                    <i v-if="onSort && keyIndex === 0" class="pointer sort-handle">drag_indicator</i>

                    <slot name="cell" :row="row" :rowIndex="rowIndex" :cell="row[key]" :key="key" :keyIndex="keyIndex">
                        {{ row[key] ?? '-'}}
                    </slot> 
                </div>
            </div>

        </div>

        <div v-if="!values.length" class="p-4xl">
            <holder-component as="clean" icon="view_list" :title="empty || 'No records found here.'"></holder-component>
        </div>
    </div>
</template>