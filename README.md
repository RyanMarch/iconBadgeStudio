# Icon Badge Studio

A simple, web-based tool for creating professional icons with customizable badges.

[![Launch App](https://img.shields.io/badge/Launch_Icon_Badge_Studio-blue?style=for-the-badge)](https://iconbadgestudio.ryanmarch.me)

## Features

- **Custom Base Image Upload**: Upload your own image as the base.
- **Advanced Badge Shaping**: Choose from Circle, Squircle, Hexagon, Diamond, and Shield shapes.
- **Color Picker**: Choose from preset colors or use the custom picker for any hex code.
- **Precision Controls**: Adjust badge size, icon scale, and rotation across all four corners.
- **Lucide Icon Integration**: Access thousands of icons by name, including suggestions as you type.
- **Export Options**: High-quality PNG export and a dedicated "Screenshot Mode" for clean captures.
- **Smart URL State**: Every adjustment is synced to the URL for instant sharing and bookmarking.
- **Fail-Safe Local Storage**: If cloud uploading fails, the app automatically falls back to local storage so you can keep working.
- **Auto-Contrast**: Badge icons automatically switch between light and dark based on the background color.

## Built With

- **Vanilla HTML5/CSS3**: No heavy frameworks.
- **JavaScript**: Custom logic for real-time rendering and state management.
- **[Cloudinary](https://cloudinary.com/)**: For fast, reliable image hosting and sharing.
- **[Lucide](https://lucide.dev/)**: A vast library of beautiful, consistent icons.
- **[dom-to-image](https://github.com/tsayen/dom-to-image)**: For high-quality canvas exporting.
- **Google Fonts**: Featuring 'Outfit' and 'Inter' for a modern feel.

## Sharing & URL Synchronization

The application state (colors, shapes, icons, and even your uploaded base image) is synchronized with URL parameters. 

- **Copy URL Button**: Use the built-in "Copy URL" button to quickly grab a shareable link and start collaborating.
- **Image Hosting**: Uploaded images are hosted securely and added to the URL.
- **Validation**: To ensure fast performance, uploads are limited to 4MB and 1500px on the longest side.

---

Built by [Ryan March](https://ryanmarch.me)
