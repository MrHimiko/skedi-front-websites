<script setup>
    import { SocketStore } from '@stores/socket'; 
    const socketStore = SocketStore();

    defineProps({
        route: String,
        as: String
    });
</script>

<template>
    <div :class="['activity-c-users', 'users', as]">
        <!-- Get by Route-->
        <div v-if="route" 
            class="user pointer"
            v-for="(connection, connectionIndex) in socketStore.getByRoute(route)" :key="connectionIndex"
            v-tooltip="{content: () => { return connection.user.name + ' on this page '} }"  
        >
            <span :class="connection.user.name[0].toLowerCase()">{{ connection.user.name[0] }}</span>
        </div>

        <!-- Get All -->
        <router-link v-if="!route" :to="connection.route" 
            class="user pointer"
            v-for="(connection, connectionIndex) in socketStore.getAll()" :key="connectionIndex"
            v-tooltip="{content: () => { return connection.user.name + ' on page ' + connection.route; } }"  
        >
            <span :class="connection.user.name[0].toLowerCase()">{{ connection.user.name[0] }}</span>
        </router-link>
    </div>
</template>