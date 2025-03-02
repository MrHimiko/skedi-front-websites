<script setup>
import './style.css';
import { ref } from 'vue';
import { PhArrowLeft, PhArrowRight } from "@phosphor-icons/vue";

const hourHeight = 80; // 1 hour = 80px
const stepHeight = 20; // 15 minutes = 20px
const firstColumnWidth = 160; // Reserved for hours column (fixed by you!)

const calendarData = ref({
    days: ["WED 29", "THU 30", "FRI 31", "SAT 1", "SUN 2", "MON 3", "TUE 4"], 
    events: [
        { title: "Divhunt x Sila", start: "7:00 AM", end: "7:30 AM", dayIndex: 0, position: 560, height: 40, overlapping: false, isDragging: false },
        { title: "Meeting with Team", start: "2:00 AM", end: "3:30 AM", dayIndex: 2, position: 160, height: 120, overlapping: false, isDragging: false },
    ],
    hours: [
        "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
        "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
    ]
});


let dragEvent = null;
let startDayIndex = null;
let originalPosition = null;
let originalDayIndex = null;
let resizeEvent = null;
let resizeDirection = null;
let originalHeight = null;

// ✅ Dragging Logic (Now Working!)
function startDrag(event, dayIndex, mouseEvent) {
    dragEvent = event;
    startDayIndex = dayIndex;
    originalPosition = event.position;
    originalDayIndex = event.dayIndex;
    event.isDragging = true;

    const startY = mouseEvent.clientY;
    const startX = mouseEvent.clientX;
    const startPosition = event.position;

    const onMouseMove = (e) => {
        const deltaY = e.clientY - startY;
        const newPosition = Math.max(0, startPosition + deltaY);
        dragEvent.position = Math.round(newPosition / stepHeight) * stepHeight;

        // **Fix: Use the center of the dragged event for better day switching**
        const calendarRect = document.querySelector('.calendar-inside').getBoundingClientRect();
        const daysGridWidth = calendarRect.width - firstColumnWidth;
        const columnWidth = daysGridWidth / calendarData.value.days.length;
        const eventCenterX = e.clientX - calendarRect.left - firstColumnWidth + (columnWidth / 2);
        const newDayIndex = Math.floor(eventCenterX / columnWidth);

        if (newDayIndex >= 0 && newDayIndex < calendarData.value.days.length) {
            dragEvent.dayIndex = newDayIndex;
        }

        checkOverlap(dragEvent);
    };

    const onMouseUp = () => {
        if (dragEvent.overlapping) {
            console.log("you can't overlap two event types");
            dragEvent.position = originalPosition;
            dragEvent.dayIndex = originalDayIndex;
        }

        dragEvent.overlapping = false;
        dragEvent.isDragging = false;
        dragEvent = null;
        startDayIndex = null;

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
}

// ✅ Resizing Logic (Fixed!)
function startResize(event, direction, mouseEvent) {
    resizeEvent = event;
    resizeDirection = direction;
    originalHeight = event.height;
    originalPosition = event.position;
    event.isDragging = true;

    const startY = mouseEvent.clientY;
    const startHeight = event.height;
    const startPosition = event.position;

    const onMouseMove = (e) => {
        const deltaY = e.clientY - startY;

        if (resizeDirection === "bottom") {
            const newHeight = Math.max(stepHeight, startHeight + deltaY);
            resizeEvent.height = Math.round(newHeight / stepHeight) * stepHeight;
        } else if (resizeDirection === "top") {
            const newPosition = Math.max(0, startPosition + deltaY);
            const newHeight = Math.max(stepHeight, startHeight - deltaY);
            resizeEvent.position = Math.round(newPosition / stepHeight) * stepHeight;
            resizeEvent.height = Math.round(newHeight / stepHeight) * stepHeight;
        }

        checkOverlap(resizeEvent);
    };

    const onMouseUp = () => {
        if (resizeEvent.overlapping) {
            console.log("you can't overlap two event types");
            resizeEvent.position = originalPosition;
            resizeEvent.height = originalHeight;
        }

        resizeEvent.overlapping = false;
        resizeEvent.isDragging = false;
        resizeEvent = null;
        resizeDirection = null;

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
}

// ✅ Overlap Checking (No Change)
function checkOverlap(event) {
    const conflictingEvent = calendarData.value.events.find(e => 
        e.dayIndex === event.dayIndex &&
        e !== event &&
        !(event.position + event.height <= e.position || event.position >= e.position + e.height)
    );

    event.overlapping = !!conflictingEvent;
}

// ✅ Fix `formatTime` Access in Template
const formatTime = (position) => {
    const totalMinutes = (position / hourHeight) * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const amPm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes === 0 ? "00" : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${amPm}`;
};
</script>


<template>
    <div class="dashboard-c-calendar">
        <!-- 📅 Calendar Header (Week View) -->
        <div class="heading cal-grid">
            <div class="days-control">
                <div @click="shiftDays('left')" class="nav-arrow"> 
                    <PhArrowLeft size="16" /> 
                </div>
                <div @click="shiftDays('right')" class="nav-arrow"> 
                    <PhArrowRight size="16" /> 
                </div>
            </div>

            <!-- Dynamic Days -->
            <div v-for="(day, index) in calendarData.days" :key="index" class="heading-cell">
                <span>{{ day }}</span>
            </div>
        </div>

        <!-- 📆 Calendar Body -->
        <div class="calendar">
            <div class="calendar-inside cal-grid">
                <div>
                    <div v-for="(hour, hourIndex) in calendarData.hours" :key="hourIndex" style="height: 80px;">
                        <div :style="{ opacity: hour === '12 AM' ? '0' : '1' }" class="calendar-time">
                            <span>{{ hour }}</span>
                        </div>
                    </div>
                </div>

                <!-- Generate Cells for Each Day -->
                <div
                    v-for="(day, dayIndex) in calendarData.days"
                    :key="dayIndex"
                    class="calendar-cell"
                    
                >
                    <div class="calendar-cell-inside">
                        <!-- Render Events Dynamically -->
                        <div 
                            v-for="(event, eventIndex) in calendarData.events.filter(e => e.dayIndex === dayIndex)" 
                            :key="eventIndex"
                            class="calendar-item"
                            :class="{ 'overlapping': event.overlapping }"
                            :style="{
                                top: `${event.position}px`,
                                height: `${event.height}px`,
                                backgroundColor: event.overlapping ? '#ff9595' : '',
                                zIndex: event.isDragging ? 1000 : 1
                            }"
                            @mousedown="startDrag(event, dayIndex, $event)"
                        >
                            <!-- Resize Handles -->
                            <div class="resize-handle top" @mousedown.stop="startResize(event, 'top', $event)"></div>
                            <div class="resize-handle bottom" @mousedown.stop="startResize(event, 'bottom', $event)"></div>

                            <p>{{ event.title }}</p>
                            <span>{{ formatTime(event.position) }} - {{ formatTime(event.position + event.height) }}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
