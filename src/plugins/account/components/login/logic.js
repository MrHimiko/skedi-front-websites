import { common } from '@utils/common';
import { storage } from '@utils/storage'


function handleSubmit(event, fields, response, success) 
{
    if (!success) 
    {
        return
    }

    const url = (common.query('return') ?? '/');
    storage.set('token', response.data.token, true);
    window.location.href = url.startsWith('/') ? url : '/';
}

export 
{
    handleSubmit
}
