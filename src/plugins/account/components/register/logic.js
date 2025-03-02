function togglePasswordVisibility(event) 
{
    const input = event.target.closest('.c-input')?.querySelector('input')

    if (input && input.type === 'password') 
    {
        input.type = 'text'
    } 
    else if (input) 
    {
        input.type = 'password'
    }
}

export 
{
    togglePasswordVisibility
}
