import { tippy } from 'vue-tippy'

export default 
{
    mounted(el, binding) 
    {
        if (!binding.value) 
        {
            return
        }

        const { text, options } = binding.value

        tippy(el, 
        {
            content: 'Copy to clipboard',
            allowHTML: true,
            placement: 'top',
            duration: 50,
            delay: 0,
            theme: 'custom',
            ...options
        })

        el.addEventListener('click', async () => 
        {
            try 
            {
                await navigator.clipboard.writeText(text)

                el._tippy.setContent('Copied!')
                el._tippy.show()

                setTimeout(() => 
                {
                    el._tippy.setContent('Copy to clipboard')
                }, 1000)
            } 
            catch (err) 
            {
                el._tippy.setContent('Failed to copy!')
                el._tippy.show()

                setTimeout(() => 
                {
                    el._tippy.setContent('Copy to clipboard')
                }, 1000)
            }
        })
    },

    unmounted(el) 
    {
        if (el._tippy) 
        {
            el._tippy.destroy()
        }
        
        el.removeEventListener('click', el.__clipboardHandler)
    }
}
