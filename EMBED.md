# Embedding the Voice Assistant Widget

## Quick Start

Add the following code to your webpage:

```html
<!-- Add to your <head> section -->
<link href="PATH_TO_ASSETS/static/css/main.c432663d.css" rel="stylesheet">

<!-- Add just before closing </body> tag -->
<script>
  window.VOICE_ASSISTANT_CONFIG = {
    apiKey: 'YOUR_API_KEY_HERE',      // Required: Your Gemini API key
    position: 'bottom-right',         // Optional: Widget position
    theme: 'dark',                    // Optional: Widget theme
    initiallyOpen: false,             // Optional: Whether widget starts open
    agentName: 'Compliance Cal'       // Optional: Custom agent name
  };
</script>
<script src="PATH_TO_ASSETS/static/js/main.ea9896ea.js"></script>
```

## Required Files

After building, you'll need to host these files:
- `/static/css/main.c432663d.css`
- `/static/js/main.ea9896ea.js`
- `/Cal.png`

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | required | Your Gemini API key |
| position | string | 'bottom-right' | Widget position ('bottom-right', 'bottom-left', 'top-right', 'top-left') |
| theme | string | 'dark' | Visual theme ('dark', 'light') |
| initiallyOpen | boolean | false | Whether the widget starts in open state |
| agentName | string | 'Compliance Cal' | Name displayed in the widget header |

## Testing Locally

1. Build the project:
```bash
npm run build
```

2. Serve the build directory:
```bash
npx serve build
```

3. Visit http://localhost:3000/test.html to see the example implementation.

## Deployment Steps

1. Build the project using `npm run build`
2. Copy the contents of the `build` directory to your web server
3. Update the paths in your HTML to point to the correct location of the assets
4. Set your Gemini API key in the configuration
5. Test the widget to ensure it's working correctly

## Security Considerations

1. Always serve over HTTPS to ensure secure audio transmission
2. Keep your API key secure
3. Consider implementing server-side token generation
4. Use appropriate CSP headers

## Browser Support

The widget supports all modern browsers with:
- Web Audio API
- WebSocket API
- MediaDevices API

Tested on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **Widget doesn't appear**
   - Check browser console for errors
   - Verify all assets are loading correctly
   - Ensure API key is valid

2. **Audio not working**
   - Check browser permissions
   - Ensure HTTPS is being used
   - Verify microphone access

3. **WebSocket connection fails**
   - Check network connectivity
   - Verify API key permissions
   - Ensure no firewall blocking

### Debug Mode

Add `debug: true` to your configuration to enable detailed logging:

```javascript
window.VOICE_ASSISTANT_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  debug: true  // Enables console logging
};
```

## Customization

### CSS Variables

You can override these CSS variables to customize the appearance:

```css
:root {
  --Blue-500: #1f94ff;      /* Primary accent color */
  --Neutral-10: #1c1f21;    /* Background color */
  --Neutral-90: #e1e2e3;    /* Text color */
}
```

### Custom Themes

Create your own theme by extending the base theme:

```css
.theme-custom {
  --Blue-500: #ff4081;      /* Custom accent color */
  --Neutral-10: #2d2d2d;    /* Custom background */
  --Neutral-90: #ffffff;    /* Custom text color */
}
```

Then specify your theme in the configuration:

```javascript
window.VOICE_ASSISTANT_CONFIG = {
  theme: 'custom'
};
