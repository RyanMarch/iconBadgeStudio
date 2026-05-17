# Icon Studio

A premium, web-based tool for creating professional icons with customizable badges, rich gradients, and skeuomorphic effects.

[![Launch App](https://img.shields.io/badge/Launch_Icon_Studio-blue?style=for-the-badge)](https://iconstudio.ryanmarch.me)

### Features
- **Custom Image Upload**: Drag and drop images directly onto the canvas or paste them from your clipboard (Ctrl/Cmd + V).
- **Dynamic Gradients**: Create stunning backgrounds with Linear, Radial, Conic, and Mesh gradient types.
- **Skeuomorphic Frames**: Apply professional finishes like **Glossy Shine**, **Metallic**, **Glass**, and **Embossed** borders.
- **Visual Effects**: Add depth with Noise, Glow, and Vignette overlays.
- **Integrated Text**: Overlay custom text with full color control and character validation.
- **Theme Chooser**: Easily switch between light and dark mode for distraction-free editing.

### Precision Badge Controls
- **Flexible Positioning**: Snap badges to any corner or remove them entirely for a clean icon.
- **Geometric Shapes**: Choose from Circle, Squircle, Hexagon (H/V), Diamond, Shield, and more.
- **Smart Contrast**: Badge icons automatically adjust their color to maintain accessibility against any background.
- **Full Transform Support**: Fine-tune badge size, rotation, and internal icon scaling.

### Searchable Icon Library
- **Lucide Integration**: Instant access to thousands of consistent, high-quality icons.
- **Smart Suggestions**: Real-time filtering and suggestions as you type.
- **Persistent Caching**: Icon metadata is cached locally for lightning-fast performance on subsequent visits.

### Progressive Web App (PWA) & Mobile Experience
- **Standalone Installation**: Install Icon Studio directly to your device home screen on iOS, iPadOS, Android, and Desktop for a native app experience.
- **Full Offline Support**: Continue designing without an active network connection, powered by background service worker caching.
- **Smarter Install Prompts**: Custom, non-intrusive step-by-step guides helping mobile users add the app to their home screens.
- **iPad and Tablet Screen Calibration**: Responsive styling optimized specifically for large touch displays in both landscape and portrait orientations.
- **Sticky Mobile Preview**: A pinned canvas preview on mobile ensures your design is always visible while adjusting settings.

### Optimized Tablet & Responsive Layouts
- **Anti-Distortion Engine**: Rigid 1:1 canvas aspect ratio enforcement to prevent squishing or warping when configuration menus slide in or out.
- **Touch-First Controls**: Large interactive hit targets and a polished badge selection grid designed for precise finger navigation.

### Sharing & Exporting
- **URL-Synced State**: Every adjustment is instantly reflected in the URL. Share your exact design with a single link.
- **Cloud-Powered Sharing**: Uploaded images are hosted via Cloudinary for seamless cross-device sharing.
- **High-Quality Export**: Pixel-perfect, high-resolution (1024x1024) PNG exports with support for advanced effects, frame styles, and rotations.
- **Privacy First**: Local storage fallback ensures your work is saved even if cloud services are unavailable.

## Built With

- **Vanilla JS/HTML5/CSS3**: Clean and modern vanilla stack for maximum performance and cross-browser reliability.
- **Custom Canvas 2D Engine**: A high-fidelity rendering pipeline for pixel-perfect 1:1 PNG exports, resolving browser compatibility issues with third-party export libraries.
- **Service Worker API**: Enables instant offline loading and resilient asset caching.
- **[esbuild](https://esbuild.github.io/)**: Blazing fast build-time minification and bundling.
- **[Cloudflare Pages](https://pages.cloudflare.com/)**: High-performance global hosting and deployment.
- **[Cloudinary](https://cloudinary.com/)**: Scalable image hosting for shareable URLs.
- **[Lucide](https://lucide.dev/)**: Beautiful and consistent icon sets.
- **Google Fonts**: Featuring 'Outfit' and 'Inter' for premium typography.

---

Built by [Ryan March](https://ryanmarch.me)
