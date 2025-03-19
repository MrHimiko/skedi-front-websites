<script setup>
import { timeLogic } from './editTime.js';
import ToggleComponent from '@form/toggle/view.vue';
import SelectComponent from '@form/select/view.vue';
import ButtonComponent from '@form/button/view.vue';
import { PhPlus, PhCopy, PhX } from "@phosphor-icons/vue";

const props = defineProps({
    initialSchedule: {
        type: Object,
        default: () => null
    }
});

const emit = defineEmits(['update']);

const {
    days,
    timeOptions,
    eligibleDaysForCopy,
    updateDayStatus,
    updateDayTime,
    addPause,
    removePause,
    updatePauseTime,
    openCopyModal,
    showCopyModal,
    closeCopyModal,
    selectedDays,
    toggleDaySelection,
    applyTimesToSelectedDays,
    copySourceIndex
} = timeLogic(props, emit);
</script>



<template>
    <div class="edit-time">
        <!-- Days of the week -->
        <div v-for="(day, index) in days" :key="day.name" class="day-row">
            <toggle-component 
                :value="day.enabled" 
                @update:value="updateDayStatus(index, $event)"
            />
            
            <span class="day-name">{{ day.name }}</span>
            
            <div v-if="day.enabled" class="time-inputs">
                <div class="time-slots">
                    <div class="main-time-slot">
                        <select-component 
                            :value="day.startTime" 
                            :key="`day-start-${index}-${day.startTime}`"
                            placeholder="09:00"
                            :options="timeOptions" 
                            @change="(newValue) => updateDayTime(index, 'startTime', newValue)"
                        />

                        <span class="time-separator">-</span>

                        <select-component 
                            :value="day.endTime" 
                            :key="`day-end-${index}-${day.endTime}`"
                            placeholder="17:00"
                            :options="timeOptions" 
                            @change="(newValue) => updateDayTime(index, 'endTime', newValue)"
                        />
                        
                        <div class="time-actions">
                            <div v-tooltip="{ content: 'Add break' }" class="action-button add" @click="addPause(index)">
                                <PhPlus weight="bold" />
                            </div>
                            
                            <div v-tooltip="{ content: 'Copy time to other days' }" class="action-button copy" @click="openCopyModal(index)">
                                <PhCopy weight="bold" />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pauses/breaks -->
                    <div v-for="(pause, pauseIndex) in day.pauses" :key="pauseIndex" class="pause-slot">
                        <span class="pause-label">Break:</span>
                        
                        <select-component 
                            :value="pause.startTime" 
                            :key="`pause-start-${index}-${pauseIndex}-${pause.startTime}`"
                            placeholder="12:00"
                            :options="timeOptions"
                            @change="(value) => updatePauseTime(index, pauseIndex, 'startTime', value)"
                        />

                        <span class="time-separator">-</span>

                        <select-component 
                            :value="pause.endTime" 
                            :key="`pause-end-${index}-${pauseIndex}-${pause.endTime}`"
                            placeholder="13:00"
                            :options="timeOptions"
                            @change="(value) => updatePauseTime(index, pauseIndex, 'endTime', value)"
                        />
                        
                        <div v-tooltip="{ content: 'Remove break' }" class="action-button remove" @click="removePause(index, pauseIndex)">
                            <PhX weight="bold" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Copy time modal using Teleport to move it outside the current popup -->
        <Teleport to="body">
            <div v-if="showCopyModal" class="l-popup h-auto copy-times-modal-overlay">
                <div class="copy-times-modal">

                    <div class="copy-modal-content">
                        <div v-if="copySourceIndex !== null" class="source-day-info">
                            Copying times from <strong>{{ days[copySourceIndex].name }}</strong>: 
                            {{ days[copySourceIndex].startTime }} - {{ days[copySourceIndex].endTime }}
                            <span v-if="days[copySourceIndex].pauses.length > 0">
                                ({{ days[copySourceIndex].pauses.length }} pause{{ days[copySourceIndex].pauses.length > 1 ? 's' : '' }})
                            </span>
                        </div>
                        
                        <div class="days-selection">
                            <p class="selection-label">Select which days to copy to:</p>
                            
                            <div class="days-checkboxes">
                                <div 
                                    v-for="day in eligibleDaysForCopy" 
                                    :key="day.index"
                                    class="day-checkbox"
                                >
                                    <input 
                                        type="checkbox" 
                                        :id="`copy-day-${day.index}`"
                                        :checked="selectedDays.has(day.index)"
                                        @change="toggleDaySelection(day.index)"
                                    />
                                    <label :for="`copy-day-${day.index}`">{{ day.name }}</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button-component 
                                as="tertiary" 
                                label="Cancel" 
                                @click="closeCopyModal"
                            />
                            <button-component 
                                label="Apply" 
                                @click="applyTimesToSelectedDays"
                                :disabled="selectedDays.size === 0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style src="./editTime.css"></style>