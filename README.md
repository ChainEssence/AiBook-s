# 4× Expert Startup Analyzer

A premium, production-ready single-page web application that analyzes startup ideas using four expert perspectives: Product Manager, Marketer, Tech Lead, and Business Analyst.

## Features

### Core Functionality
- **Expert Analysis**: Submit startup ideas and receive detailed reports from 4 expert perspectives
- **Real-time Processing**: Integrates with n8n webhook API for instant analysis
- **Markdown Rendering**: Beautiful formatting of expert reports with proper typography
- **Export Options**: Copy, download as Markdown, or generate PDF reports
- **Persistent Storage**: Automatically saves and restores analysis results

### Premium UI/UX
- **Dark Glassmorphism Theme**: Modern design with deep charcoal backgrounds and gold accents
- **Responsive Design**: Mobile-first approach that works on all devices
- **Smooth Animations**: Subtle micro-interactions and transitions
- **Premium Typography**: Playfair Display serif for headings, Inter sans-serif for body text

### Accessibility & Quality
- **Full Keyboard Navigation**: Tab through all interactive elements
- **ARIA Labels**: Comprehensive screen reader support
- **Focus Management**: Visible focus states and logical tab order
- **Reduced Motion Support**: Respects user's motion preferences
- **High Contrast Mode**: Enhanced visibility for accessibility needs

### Technical Features
- **Input Validation**: Client-side validation with character limits and sanitization
- **Error Handling**: Comprehensive error states with retry functionality
- **Rate Limiting**: Prevents spam with 5-second cooldown between requests
- **Timeout Handling**: 30-second request timeout with automatic retry
- **Local Storage**: Saves analysis results for 24 hours with restore option

## API Integration

The app integrates with the n8n webhook endpoint:
- **URL**: `https://n8n.generalovai.ru/webhook-test/lovable`
- **Method**: POST
- **Content-Type**: application/json

### Request Format
```json
{
  "idea": "Your startup idea description",
  "email": "optional@email.com"
}
```

### Response Format
```json
{
  "status": "success",
  "idea": "Original idea text",
  "product_manager": "Markdown formatted analysis",
  "marketer": "Markdown formatted analysis", 
  "tech": "Markdown formatted analysis",
  "analyst": "Markdown formatted analysis",
  "timestamp": "2023-12-07T10:30:00Z"
}
```

## File Structure

```
/workspace/
├── index.html          # Main HTML structure
├── styles.css          # Premium CSS with glassmorphism theme
├── script.js           # Complete JavaScript functionality
└── README.md          # This documentation
```

## Getting Started

1. **Local Development**:
   ```bash
   cd /workspace
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

2. **Production Deployment**:
   - Upload files to any web server or CDN
   - Works with static hosting services like Netlify, Vercel, GitHub Pages
   - No build process required - pure HTML/CSS/JS

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Features Used**: 
  - CSS Grid & Flexbox
  - CSS Custom Properties
  - Fetch API with AbortController
  - Clipboard API with fallback
  - Local Storage
  - CSS backdrop-filter

## Security Features

- **Input Sanitization**: Strips HTML tags and dangerous content
- **HTTPS Required**: Clipboard API requires secure context
- **No Inline Scripts**: CSP-friendly implementation
- **XSS Protection**: Proper escaping of user-generated content

## Performance Optimizations

- **Minimal Dependencies**: No external JavaScript libraries
- **Efficient CSS**: Uses CSS custom properties for theming
- **Lazy Loading**: Content rendered only when needed
- **Debounced Interactions**: Prevents excessive API calls

## Customization

### Colors
Edit CSS custom properties in `styles.css`:
```css
:root {
  --color-gold: #d4af37;
  --color-charcoal: #1a1a1a;
  --color-graphite: #2a2a2a;
  /* ... more colors */
}
```

### API Endpoint
Change the webhook URL in `script.js`:
```javascript
this.apiUrl = 'https://your-webhook-url.com/endpoint';
```

### Branding
Update the wordmark and footer text in `index.html`.

## Accessibility Compliance

- **WCAG 2.1 AA Compliant**
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Comprehensive ARIA labels
- **Color Contrast**: Meets accessibility standards
- **Focus Indicators**: Clear visual focus states

## License

This project is built for production use with modern web standards and best practices.