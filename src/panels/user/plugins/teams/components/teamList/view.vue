<script setup>
import ButtonComponent from '@form/button/view.vue';
import { PhLink, PhUsers, PhCode, PhPlus, PhDotsThree } from "@phosphor-icons/vue";
import { ref, computed } from 'vue';
import TeamList from '@user_teams/components/teamList/view.vue';

const props = defineProps({
    teams: {
        type: Array,
        required: true
    },
    orgSlug: {
        type: String,
        required: true
    },
    orgUsers: {
        type: Array,
        default: () => []
    },
    currentUserId: {
        type: Number,
        required: true
    }
});

// For debugging - log the teams passed to this component
console.log('TeamList received teams:', props.teams);

// Determine if the current user has admin privileges for a specific team
function hasAdminAccess(team) {
    if (!team) return false;
    
    // Check team's effective_role or role property directly
    return team.effective_role === 'admin' || 
           team.effective_role === 'team_admin' || 
           team.role === 'admin' || 
           team.role === 'team_admin';
}

// Create URL for the team
function getTeamUrl(team) {
    if (!team || !team.slug) return '#';
    return `https://skedi.com/${props.orgSlug}/${team.slug}`;
}

// Get user count for a team - safely handle potential undefined values
function getUserCount(team) {
    if (!team) return 0;
    if (!team.users) return 0;
    return team.users.length;
}

// Check if a team has subteams
function hasSubteams(team) {
    return team && team.teams && Array.isArray(team.teams) && team.teams.length > 0;
}
</script>

<template>
    <ul class="teams-list">
        <li v-for="team in teams" :key="team.id" class="team-item">
            <div class="team">
                <div class="top">
                    <h2>{{ team.name }}</h2>
                    <a :href="getTeamUrl(team)" class="team-url">
                        {{ getTeamUrl(team) }}
                    </a>

                    <div class="info">
                        <div class="item">
                            <div class="icon">
                                <PhUsers weight="bold" />
                            </div>
                            <span>{{ getUserCount(team) }}</span>
                        </div>
                    </div>

                    <!-- Display list of users if available -->
                    <div class="list-of-users" v-if="team.users && team.users.length">
                        <div class="user-item" 
                             v-for="user in team.users" 
                             :key="user.id"
                             :class="user.effective_role ? 'role-' + user.effective_role : ''"
                             v-tooltip="{ content: `Role: ${user.effective_role || 'member'}` }">
                            {{ user.name }}
                        </div>
                    </div>
                </div>

                <div class="bottom">
                    <div class="right">
                        <div class="actions">
                            <ButtonComponent
                                v-tooltip="{ content: 'Copy URL' }"
                                as="secondary icon"
                                :iconLeft="{ component: PhLink, weight: 'bold' }"
                            />
                            <ButtonComponent 
                                v-tooltip="{ content: 'Embed on a website' }"
                                as="secondary icon"
                                :iconLeft="{ component: PhCode, weight: 'bold' }"
                            />
                            <ButtonComponent v-if="hasAdminAccess(team)"
                                v-tooltip="{ content: 'Create subteam' }"
                                as="secondary icon"
                                :iconLeft="{ component: PhPlus, weight: 'bold' }"
                            />
                            <ButtonComponent v-if="hasAdminAccess(team)"
                                as="secondary icon"
                                :iconLeft="{ component: PhDotsThree, weight: 'bold' }"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recursive rendering of subteams with debugging -->
            <div v-if="hasSubteams(team)" class="subteam-wrapper">
                <!-- Debug info -->
                <div class="debug-info" style="font-size: 10px; color: #999; margin: 5px 0;">
                    Sub-teams for {{ team.name }}: {{ team.teams.length }}
                </div>
                
                <!-- Use the component itself for recursion -->
                <TeamList
                    :teams="team.teams"
                    :orgSlug="orgSlug"
                    :orgUsers="orgUsers"
                    :currentUserId="currentUserId"
                />
            </div>
        </li>
    </ul>
</template>

<style scoped>
.teams-list {
    list-style-type: none;
    padding-left: 1em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}

.team-item {
    margin-bottom: 1em;
    border-left: 1px solid #eaeaea;
    padding-left: 1em;
}

.team {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1em;
    margin-bottom: 0.5em;
    border: 1px solid #eaeaea;
}

.top {
    margin-bottom: 1em;
}

.top h2 {
    font-size: 1.2em;
    margin: 0 0 0.5em 0;
    font-weight: 600;
}

.team-url {
    display: block;
    font-size: 0.9em;
    color: #2563eb;
    text-decoration: none;
    margin-bottom: 0.5em;
}

.info {
    display: flex;
    margin-bottom: 0.5em;
}

.info .item {
    display: flex;
    align-items: center;
    margin-right: 1em;
}

.info .icon {
    margin-right: 0.25em;
}

.list-of-users {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    margin-top: 0.5em;
}

.user-item {
    background-color: #edf2f7;
    padding: 0.25em 0.5em;
    border-radius: 4px;
    font-size: 0.85em;
}

.role-admin {
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
}

.role-team_admin {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
}

.bottom {
    display: flex;
    justify-content: flex-end;
}

.actions {
    display: flex;
    gap: 0.5em;
}

.subteam-wrapper {
    margin-left: 1em;
}

/* Debug styles - can be removed in production */
.debug-info {
    display: none; /* Set to 'block' to show debug info */
}
</style>