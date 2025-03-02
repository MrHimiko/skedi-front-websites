export default 
{
    mounted(el, binding) 
    {
        if (!binding.value || typeof binding.value !== 'string') 
            {
            return;
        }

        el._clickHandle = () => 
        {
            const printWindow = window.open(binding.value, '_blank', 'width=800,height=600');

            if (printWindow) 
            {
                printWindow.onload = () => 
                {
                    setTimeout(() => 
                    {
                        printWindow.print();

                        printWindow.onafterprint = () =>
                            {
                            printWindow.close();
                        };
                    }, 1000);
                };
            }
        };

        el.addEventListener('click', el._clickHandle);
    },
    
    unmounted(el) 
    {
        if (el._clickHandle) 
        {
            el.removeEventListener('click', el._clickHandle);
            delete el._clickHandle;
        }
    }
};
