// Skedi Booking Widget - Simplified iframe approach
(function() {
    'use strict';
    
    // Get script element and configuration
    const script = document.getElementById('skedi-widget') || document.currentScript || document.querySelector('script[src*="widget/loader.js"]');

    
    if (!script) {
        console.error('Skedi Widget: Could not find script element');
        return;
    }
    
    // Extract configuration
    const config = {
        org: script.getAttribute('data-org'),
        event: script.getAttribute('data-event'),
        mode: script.getAttribute('data-mode') || 'inline',
        width: script.getAttribute('data-width') || '100%',
        height: script.getAttribute('data-height') || '700px',
        buttonText: script.getAttribute('data-button-text') || 'Book a Meeting',
        buttonClass: script.getAttribute('data-button-class') || '',
        primaryColor: script.getAttribute('data-primary-color') || '#000000',
        hideHeader: script.getAttribute('data-hide-header') !== 'false',
        theme: script.getAttribute('data-theme') || 'light'
    };
    
    // Validate required parameters
    if (!config.org || !config.event) {
        console.error('Skedi Widget: data-org and data-event are required');
        return;
    }
    
    // Generate unique ID
    const widgetId = 'skedi-' + Math.random().toString(36).substr(2, 9);
    
    // Create container
    const container = document.createElement('div');
    container.id = widgetId;
    container.className = 'skedi-widget-container';
    
    // Build iframe URL with parameters
    const baseUrl = script.src.replace(/\/widget\/.*$/, '');
    const iframeUrl = `${baseUrl}/${config.org}/${config.event}?embedded=true&theme=${config.theme}&hideHeader=${config.hideHeader}`;
    
    // Inline mode
    if (config.mode === 'inline') {
        container.innerHTML = `
            <iframe 
                src="${iframeUrl}"
                style="width: ${config.width}; height: ${config.height}; border: none; display: block;"
                frameborder="0"
                id="${widgetId}-iframe"
                title="Skedi Booking"
            ></iframe>
        `;
        
        script.parentNode.insertBefore(container, script.nextSibling);
    }
    // Popup mode
    else if (config.mode === 'popup') {
        // Create trigger button
        const button = document.createElement('button');
        button.className = 'skedi-widget-button ' + config.buttonClass;
        button.textContent = config.buttonText;
        button.style.cssText = `
            background-color: ${config.primaryColor};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.2s;
        `;
        
        container.appendChild(button);
        script.parentNode.insertBefore(container, script.nextSibling);
        
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.id = widgetId + '-overlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999999;
            animation: skedi-fade-in 0.2s;
        `;
        
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 1200px;
            height: 90%;
            max-height: 800px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Schedule a Meeting';
        title.style.cssText = 'margin: 0; font-size: 20px;';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 30px;
            cursor: pointer;
            color: #666;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        `;
        
        const iframeContainer = document.createElement('div');
        iframeContainer.style.cssText = 'flex: 1; overflow: hidden;';
        iframeContainer.innerHTML = `
            <iframe 
                src="${iframeUrl}"
                style="width: 100%; height: 100%; border: none;"
                frameborder="0"
                id="${widgetId}-popup-iframe"
                title="Skedi Booking"
            ></iframe>
        `;
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        popup.appendChild(header);
        popup.appendChild(iframeContainer);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Event handlers
        button.onclick = function() {
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        };
        
        closeBtn.onclick = function() {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        };
        
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        };
        
        // ESC key handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.style.display === 'block') {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
    
    // Add minimal CSS
    if (!document.getElementById('skedi-widget-styles')) {
        const style = document.createElement('style');
        style.id = 'skedi-widget-styles';
        style.textContent = `
            @keyframes skedi-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .skedi-widget-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Listen for messages from iframe (for auto-resize, completion events, etc.)
    window.addEventListener('message', function(e) {
        // Only handle messages from our iframe
        if (!e.origin.includes(window.location.hostname) && !e.origin.includes('skedi.com')) return;
        
        if (e.data.type === 'skedi-resize' && e.data.widgetId === widgetId) {
            const iframe = document.getElementById(widgetId + '-iframe');
            if (iframe && config.height === 'auto') {
                iframe.style.height = e.data.height + 'px';
            }
        }
        
        if (e.data.type === 'skedi-booking-complete' && e.data.widgetId === widgetId) {
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('skedi-booking-complete', { detail: e.data }));
            
            // Close popup if in popup mode
            const overlay = document.getElementById(widgetId + '-overlay');
            if (overlay) {
                setTimeout(() => {
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                }, 2000);
            }
        }
    });
    
    // Store reference for programmatic control
    window.SkediWidget = window.SkediWidget || {};
    window.SkediWidget[widgetId] = {
        show: function() {
            const overlay = document.getElementById(widgetId + '-overlay');
            if (overlay) {
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        },
        hide: function() {
            const overlay = document.getElementById(widgetId + '-overlay');
            if (overlay) {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    };
})();