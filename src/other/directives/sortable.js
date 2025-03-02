import Sortable from 'sortablejs'

export default 
{
    mounted(el, binding) 
    {
        if (!binding.value) 
        {
            return
        }

        const { options = {}, onStart, onEnd } = binding.value

        Sortable.create(el, 
        {
            animation: 150,
            ...options,
            onStart: (evt) => 
            {
                el.classList.add('sortable-on')

                if(typeof onStart === 'function') 
                {
                    onStart(el, evt);
                }
            },  
            onEnd: (evt) => 
            {
                el.classList.remove('sortable-on')

                if(typeof onEnd === 'function') 
                {
                    onEnd(el, evt);
                }
            }
        })
    }
}
