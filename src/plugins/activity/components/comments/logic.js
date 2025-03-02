import { ref } from 'vue'
import { api } from '@utils/api'
import { fetch } from '@utils/fetch'
import { socket } from '@/socket';

const refForm = ref(null);
const refComments = ref([]);

function scrollDown()
{
    setTimeout(() => 
    {
        const scrollContainer = refForm.value?.closest('.scrollbar');

        if(!scrollContainer)
        {
            return;
        }
    
        scrollContainer.scrollTop = scrollContainer.scrollHeight + 500;
    });
}

function onSubmit(event, endpoint, callback) 
{
    const textarea = event.target.querySelector('textarea');
    const message = textarea.value;

    if(!message)
    {
        return;
    }

    textarea.value = '';

    api.post(endpoint, {message}).then((response) => 
    {
        refComments.value.push(response.data);

        if(refComments.value.length > 100)
        {
            refComments.value.splice(0, 1);
        }

        scrollDown();

        if(callback)
        {
            callback(response.data);
        }
    });
}

function onEnter(event) 
{
    if(!event.shiftKey) 
    {
        event.preventDefault()
        refForm.value.dispatchEvent(new Event('submit', { cancelable: true }))
    }
}

function fetchComments(endpoint)
{
    fetch.many(endpoint).then((data) =>
    {
        refComments.value = data.reverse();
        scrollDown();
    })
}

export {
    refForm,
    refComments,
    onSubmit,
    onEnter,
    fetchComments,
    scrollDown
}