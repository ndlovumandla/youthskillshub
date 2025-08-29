# PWA Setup Instructions

## Icon Requirements

The following icons need to be created and placed in the `public` directory:

### Required Icons:
- `pwa-192x192.png` - 192x192 pixel icon for PWA
- `pwa-512x512.png` - 512x512 pixel icon for PWA
- `favicon.ico` - Standard favicon
- `apple-touch-icon.png` - Apple touch icon (180x180)
- `masked-icon.svg` - Safari masked icon

### Design Guidelines:
- Use the 90s retro theme colors (neon greens, pinks, cyans)
- Include elements like graduation cap, books, or skill-related icons
- Background should be black or dark
- Text/icons should be bright neon colors

### Tools to create icons:
- Use online favicon generators
- Canva or Figma for custom design
- Or use AI image generators with retro/90s style prompts

## Current PWA Features:
- ✅ Service worker for offline caching
- ✅ Web app manifest
- ✅ Install prompt
- ✅ Background sync capability
- ⏳ Custom icons needed

## Testing PWA:
1. Run `npm run dev`
2. Open browser dev tools
3. Go to Application tab
4. Check Manifest and Service Workers sections
5. Test "Add to Home Screen" functionality
