<script setup>
    import './style.css'

    import { socket } from '@/socket';
    import { onMounted, onUnmounted } from 'vue'
    import { refForm, refComments, onSubmit, onEnter, fetchComments, scrollDown } from './logic.js'

    import { UserStore } from '@stores/user';

    import TextareaComponent from '@form/textarea/view.vue'
    import MessageComponent from '@global/message/view.vue'
    import HolderComponent from '@global/holder/view.vue'

    const userStore = UserStore();

    const props = defineProps({
        endpoint: String,
        callback: Function
    });

    onMounted(async () => 
    {
        socket.emit('join', props.endpoint);

        fetchComments(props.endpoint);
    })

    onUnmounted(() => 
    {
        socket.emit('leave', props.endpoint);

        refForm.value = null;
        refComments.value = [];
    })

    socket.on('value', (room, value) => 
    {
        if(room === props.endpoint)
        {
            const data = JSON.parse(value);

            refComments.value.push(data);

            scrollDown();
        }
    })
    
    function onComment(data)
    {
        socket.emit('value', props.endpoint, data);
    }
</script>

<template>
    <div class="activity-c-comments">
        <div class="comments">
            <holder-component v-if="!refComments.length" title="No comments here. Be first to comment." icon="send"></holder-component>

            <div v-for="(comment, commentIndex) in refComments" ref="commentIndex">
                <message-component :self="userStore.getId() === comment.user.id" :user="comment.user" :message="comment.message" :date="comment.created"></message-component>
            </div>
        </div>
        <div class="actions">
            <form ref="refForm" @submit.prevent="(event) => onSubmit(event, endpoint, onComment)">
                <textarea-component
                    as="mini"
                    iconLeft="send"
                    placeholder="Write comment..."
                    @keydown.enter.native="onEnter"
                ></textarea-component>
            </form>
        </div>
    </div>
</template>