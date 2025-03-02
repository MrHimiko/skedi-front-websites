<script setup lang="ts">
import './style.css';

import { ref, onMounted, onUnmounted } from 'vue';


import { common } from '@utils/common';
import { BubbleMenu, FloatingMenu, useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';

const props = defineProps<{
    value: string;
    name?: string;
    as?: string;
}>();

const focus = ref(false);
const value = ref(props.value);
const emit = defineEmits(['onInput', 'onChange']);

const editor = useEditor({
    extensions: [
        StarterKit,
        Underline,
        Link.configure({
            openOnClick: true,
        }),
        Highlight,
        Image,
        TaskList,
        TaskItem,
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        Placeholder.configure({
            placeholder: 'Write something...',
            emptyEditorClass: 'is-editor-empty',
        })
    ],
    content: props.value,
    onUpdate: ({ editor }) => 
    {
        const html = editor.getHTML();


        emit('onInput', html);

        value.value = html;

        common.debounce(() => 
        {
            emit('onChange', html);
        }, 1000)();
    },
    onFocus: ({ editor }) => 
    {
        focus.value = true;
    },
    onBlur: ({ editor }) => 
    {
        focus.value = false;
    },
});

const insertImage = (editor) => 
{
    const url = prompt('Enter image URL');

    if(url) 
    {
        editor.chain().focus().setImage({ src: url }).run();
    }
};

function parentFocus(event: any) 
{
    if(editor.value && event.target.classList.contains('c-editor'))
    {
        editor.value.chain().focus('end');
    }
}



onMounted(() => 
{
  
})

onUnmounted(() => 
{
    socket.emit('leave', 'editor');
})
</script>

<template>
    <div :class="['c-editor', 'scrollbar', as, (focus ? 'focus' : '')]" @click="parentFocus" v-if="editor">
        <bubble-menu class="bubble-menu" :tippy-options="{ duration: 100 }" :editor="editor">
            <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
                <i>format_bold</i>
            </button>
            <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
                <i>format_italic</i>
            </button>
            <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }">
                <i>format_underlined</i>
            </button>
            <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
                <i>format_strikethrough</i>
            </button>
            <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ 'is-active': editor.isActive('highlight') }">
                <i>edit</i>
            </button>
            <button @click="editor.chain().focus().setLink({ href: 'https://example.com' }).run()" :class="{ 'is-active': editor.isActive('link') }">
                <i>link</i>
            </button>
        </bubble-menu>

        <floating-menu class="floating-menu" :tippy-options="{ duration: 100 }" :editor="editor">

            <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
                H1
            </button>
            <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
                H2
            </button>
            <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
                H3
            </button>
            <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
                <i>format_list_bulleted</i>
            </button>
            <button @click="editor.chain().focus().toggleTaskList().run()" :class="{ 'is-active': editor.isActive('taskList') }">
                <i>checklist</i>
            </button>
            <button @click="editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()">
                <i>table_view</i>
            </button>
            <button @click="insertImage(editor)">
                <i>image</i>
            </button>

        </floating-menu>

        <editor-content :editor="editor" />
        <textarea :value="value" :name="name"></textarea>
    </div>
</template>
