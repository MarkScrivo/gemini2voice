// Initialize the app after a short delay to ensure styles are applied
setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = '#1c1f21';
    iframe.allow = 'microphone';
    iframe.src = 'https://gemini2voice.onrender.com/example.html';
    
    iframe.onload = () => {
        document.getElementById('loading').style.display = 'none';
    };
    
    document.body.appendChild(iframe);
}, 500);
