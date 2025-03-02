<script setup>
    import TableComponent from '@global/table/view.vue';
</script>

<template>
    <table-component
        as="bg0"
        :headings="['ID', 'Name', 'Date', 'Name', 'Date']"
        :keys="['id', 'name', 'date', 'na1me', 'dat2e']"
        :values="[
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
            {id: 1, name: 'Dejan', date: 'Today', na1me: 'Dejan', dat2e: 'Today'},
        ]"
    />
</template>