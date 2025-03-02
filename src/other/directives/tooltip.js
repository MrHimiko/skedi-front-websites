import { tippy } from 'vue-tippy';

export default 
{
    mounted(el, binding) 
    {
        if(!binding.value) 
        {
            return;
        }

        let { content, options } = binding.value;
        const container = document.querySelector('.c-tippy');
       
        const createTooltip = () => 
        {
            if(!el._tooltipInstance) 
            {
                el._tooltipInstance = tippy(el, {
                    content: typeof content === 'function' ? content() : content, 
                    allowHTML: true,
                    placement: 'top',
                    duration: 50,
                    delay: 0,
                    appendTo: container,
                    theme: 'custom',
                    ...options
                });

                el._tooltipInstance.show();
            }
        };

        const destroyTooltip = () => 
        {
            if(el._tooltipInstance) 
            {
                el._tooltipInstance.destroy();
                el._tooltipInstance = null;
            }
        };

        el.addEventListener('mouseenter', createTooltip);
        el.addEventListener('mouseleave', destroyTooltip);
    },
    unmounted(el) 
    {
        if(el._tooltipInstance) 
        {
            el._tooltipInstance.destroy();
            el._tooltipInstance = null;
        }
    }
};