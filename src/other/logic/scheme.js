import { ShortcutStore } from '@stores/shortcut'
import { storage } from '@utils/storage'

export default class 
{
    constructor() 
    {   
        this.scheme = storage.get('scheme') ?? 'light';
    }


    assets(scheme) 
    {
        const assets = document.querySelectorAll('.i-scheme-asset')
        const isDark = scheme === 'dark'

        assets.forEach((asset) => 
        {
            const regex = /(.*?)(-dark)?(\.\w+)$/
            const currentSrc = asset.src

            asset.src = currentSrc.replace(regex, (_, base, hasDark, extension) => 
            {
                return isDark ? `${base}-dark${extension}` : `${base}${extension}`
            })
        })
    }
}
