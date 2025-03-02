import { defineStore } from 'pinia'

export const ShortcutStore = defineStore('shortcutStore', 
{
    state: () => 
    ({
        shortcuts: {}
    }),

    actions: 
    {
        register(keys, description, callback) 
        {
            this.shortcuts[keys] = { description, callback }
        },

        unregister(keys) 
        {
            delete this.shortcuts[keys]
        },

        handleKeydown(event) 
        {
            const combination = [
                event.ctrlKey ? 'Ctrl' : null,
                event.shiftKey ? 'Shift' : null,
                event.altKey ? 'Alt' : null,
                event.metaKey ? 'Meta' : null,
                event.key
            ]
                .filter(Boolean)
                .join('+')

            if (this.shortcuts[combination]) 
            {
                event.preventDefault()
                this.shortcuts[combination].callback(event)
            }
        },

        initialize() 
        {
            document.addEventListener('keydown', this.handleKeydown)
        },

        destroy() 
        {
            document.removeEventListener('keydown', this.handleKeydown)
        },

        listShortcuts() 
        {
            return Object.entries(this.shortcuts).map(([keys, { description }]) => 
            ({
                keys,
                description
            }))
        }
    }
})
