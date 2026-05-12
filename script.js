const colors = [
    '#3b82f6', // Blue
    '#9333ea', // Purple
    '#ef4444', // Red
    '#f97316', // Orange
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#f59e0b', // Amber
];

const state = {
    shape: 'circle',
    color: '#3b82f6',
    icon: 'users',
    baseSize: 80,
    badgeSize: 40,
    innerScale: 70,
    rotation: 0,
    badgePosition: 'bottom-right',
    showShadows: true,
    baseShape: 'squircle',
    baseColor: '#1b0573',
    customBaseIcon: localStorage.getItem('iconStudio_baseIcon') || null
};

function syncStateToURL() {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    const defaults = {
        shape: 'circle',
        color: '#3b82f6',
        icon: 'users',
        baseSize: 80,
        badgeSize: 40,
        innerScale: 70,
        rotation: 0,
        badgePosition: 'bottom-right',
        showShadows: true,
        baseShape: 'squircle',
        baseColor: '#1b0573'
    };

    const setOrDelete = (key, val, def) => {
        let displayVal = val;
        let compareDef = def;
        
        if (key === 'color' || key === 'bcolor') {
            if (typeof val === 'string' && val.startsWith('#')) displayVal = val.slice(1);
            if (typeof def === 'string' && def.startsWith('#')) compareDef = def.slice(1);
        }

        if (displayVal !== undefined && displayVal !== null && String(displayVal) !== String(compareDef)) {
            params.set(key, displayVal);
        } else {
            params.delete(key);
        }
    };

    setOrDelete('icon', state.icon, defaults.icon);
    setOrDelete('shape', state.shape, defaults.shape);
    setOrDelete('bshape', state.baseShape, defaults.baseShape);
    setOrDelete('pos', state.badgePosition, defaults.badgePosition);
    setOrDelete('color', state.color, defaults.color);
    setOrDelete('size', state.badgeSize, defaults.badgeSize);
    setOrDelete('rot', state.rotation, defaults.rotation);
    setOrDelete('scale', state.innerScale, defaults.innerScale);
    setOrDelete('bsize', state.baseSize, defaults.baseSize);
    setOrDelete('bcolor', state.baseColor, defaults.baseColor);
    setOrDelete('shadows', state.showShadows, defaults.showShadows);

    if (document.body.classList.contains('screenshot-mode')) {
        params.set('mode', 'screenshot');
    } else {
        params.delete('mode');
    }

    // Always move 'img' to the end
    params.delete('img');
    if (state.customBaseIcon && state.customBaseIcon.startsWith('http')) {
        let displayUrl = state.customBaseIcon;
        const prefix = 'https://res.cloudinary.com/rm20abcd26/image/upload/';
        if (displayUrl.startsWith(prefix)) {
            displayUrl = 'cld:' + displayUrl.replace(prefix, '');
        }
        params.set('img', displayUrl);
    }

    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
    
    // Toggle Copy URL button visibility
    const copyBtn = document.getElementById('copy-url-btn');
    if (copyBtn) {
        copyBtn.style.display = newSearch ? 'flex' : 'none';
    }

    if (window.location.search !== (newSearch ? '?' + newSearch : '')) {
        window.history.replaceState({}, '', newUrl);
    }
}

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('icon')) state.icon = params.get('icon');
    if (params.has('shape')) state.shape = params.get('shape');
    if (params.has('bshape')) state.baseShape = params.get('bshape');
    if (params.has('pos')) state.badgePosition = params.get('pos');
    if (params.has('color')) {
        const c = params.get('color');
        state.color = c.startsWith('#') ? c : '#' + c;
    }
    if (params.has('size')) state.badgeSize = parseInt(params.get('size'));
    if (params.has('rot')) state.rotation = parseInt(params.get('rot'));
    if (params.has('scale')) state.innerScale = parseInt(params.get('scale'));
    if (params.has('bsize')) state.baseSize = parseInt(params.get('bsize'));
    if (params.has('bcolor')) {
        const bc = params.get('bcolor');
        state.baseColor = bc.startsWith('#') ? bc : '#' + bc;
    }
    if (params.has('shadows')) state.showShadows = params.get('shadows') === 'true';
    if (params.has('img')) {
        let val = params.get('img');
        if (val.startsWith('cld:')) {
            val = 'https://res.cloudinary.com/rm20abcd26/image/upload/' + val.replace('cld:', '');
        }
        state.customBaseIcon = val;
    }

    if (params.get('mode') === 'screenshot') {
        document.body.classList.add('screenshot-mode');
    }
}

function init() {
    loadStateFromURL();
    // Render colors
    const colorContainer = document.getElementById('color-presets');
    colors.forEach(c => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = c;
        swatch.onclick = () => setColor(c);
        if (c === state.color) swatch.classList.add('active');
        colorContainer.appendChild(swatch);
    });

    // Initialize visual state
    setShape(state.shape);
    setColor(state.color);
    setIcon(state.icon);
    setBaseSize(state.baseSize);
    setBadgeSize(state.badgeSize);
    setInnerScale(state.innerScale);
    setBadgeRotation(state.rotation);
    setBadgePosition(state.badgePosition);
    toggleShadows(state.showShadows);
    setBaseShape(state.baseShape);
    setBaseColor(state.baseColor);

    if (state.customBaseIcon) {
        document.getElementById('base-img').src = state.customBaseIcon;
        document.getElementById('remove-base-icon').style.display = 'flex';
    }

    fetchIconList();
    lucide.createIcons();

    // Disable right-click on the capture area
    document.getElementById('capture-area').addEventListener('contextmenu', (e) => e.preventDefault());

    // Setup dynamic scaling
    window.addEventListener('resize', updateAppScale);
    updateAppScale();
}

function updateAppScale() {
    const container = document.getElementById('tool-container');
    if (!container || document.body.classList.contains('screenshot-mode')) {
        document.documentElement.style.setProperty('--app-scale', '1');
        return;
    }

    const isMobile = window.innerWidth <= 950;
    
    if (isMobile) {
        // On mobile, if the screen is narrower than our mobile max-width (600px), scale down
        if (window.innerWidth < 640) {
            const scale = Math.min(1, (window.innerWidth - 32) / 400); // 32px for padding
            document.documentElement.style.setProperty('--app-scale', Math.max(0.7, scale));
        } else {
            document.documentElement.style.setProperty('--app-scale', '1');
        }
        return;
    }

    // Desktop scaling
    const targetWidth = 1050; 
    const targetHeight = 850;
    
    const scaleW = window.innerWidth / targetWidth;
    const scaleH = (window.innerHeight - 40) / targetHeight; // 40px buffer
    
    let scale = Math.min(scaleW, scaleH);
    
    // Clamp scale: don't go below 0.8 on desktop, and cap at 1.4
    scale = Math.min(Math.max(scale, 0.8), 1.4);
    
    document.documentElement.style.setProperty('--app-scale', scale);
}

let ALL_ICONS = [];

async function fetchIconList() {
    // Check cache first (valid for 24 hours)
    const cached = localStorage.getItem('lucide_icons_cache');
    const cacheTime = localStorage.getItem('lucide_icons_cache_time');
    const now = Date.now();
    
    if (cached && cacheTime && (now - cacheTime < 24 * 60 * 60 * 1000)) {
        ALL_ICONS = JSON.parse(cached);
        return;
    }

    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/lucide-static/tags.json');
        const data = await response.json();
        ALL_ICONS = Object.keys(data);
        
        // Update cache
        localStorage.setItem('lucide_icons_cache', JSON.stringify(ALL_ICONS));
        localStorage.setItem('lucide_icons_cache_time', now.toString());
    } catch (err) {
        console.error('Failed to fetch Lucide icon list:', err);
        if (cached) {
            ALL_ICONS = JSON.parse(cached);
        } else {
            ALL_ICONS = ['users', 'user', 'settings', 'mail', 'bell', 'search', 'home', 'star', 'heart', 'check', 'x', 'plus', 'minus'];
        }
    }
}

function handleIconInput(val) {
    setIcon(val, false);
    filterSuggestions(val);
}

function showSuggestions() {
    const dropdown = document.getElementById('icon-dropdown');
    dropdown.classList.add('active');
    filterSuggestions(document.getElementById('icon-input').value);
}

let selectedIndex = -1;

function filterSuggestions(val) {
    const dropdown = document.getElementById('icon-dropdown');
    const query = val.toLowerCase();
    
    const filtered = ALL_ICONS
        .filter(icon => icon.includes(query))
        .sort((a, b) => {
            // 1. Exact match first
            if (a === query) return -1;
            if (b === query) return 1;
            // 2. Starts with query second
            const aStarts = a.startsWith(query);
            const bStarts = b.startsWith(query);
            if (aStarts && !bStarts) return -1;
            if (bStarts && !aStarts) return 1;
            // 3. Alphabetical otherwise
            return a.localeCompare(b);
        })
        .slice(0, 48);
    
    if (filtered.length === 0) {
        dropdown.classList.remove('active');
        selectedIndex = -1;
        return;
    }

    dropdown.innerHTML = filtered.map((icon, idx) => `
        <div class="dropdown-item ${idx === selectedIndex ? 'selected' : ''}" onclick="setIcon('${icon}')" title="${icon}" data-index="${idx}">
            <i data-lucide="${icon}"></i>
        </div>
    `).join('');
    
    dropdown.classList.add('active');
    lucide.createIcons();
}

// Keyboard navigation
document.getElementById('icon-input').addEventListener('keydown', (e) => {
    const dropdown = document.getElementById('icon-dropdown');
    const items = dropdown.querySelectorAll('.dropdown-item');
    
    if (!dropdown.classList.contains('active') || items.length === 0) {
        if (e.key === 'ArrowDown') showSuggestions();
        return;
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelection(items);
    } else if (e.key === 'Enter') {
        if (selectedIndex >= 0) {
            e.preventDefault();
            const iconName = items[selectedIndex].title;
            setIcon(iconName);
        }
    } else if (e.key === 'Escape') {
        dropdown.classList.remove('active');
    }
});

function updateSelection(items) {
    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === selectedIndex);
        if (idx === selectedIndex) {
            item.scrollIntoView({ block: 'nearest' });
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.icon-picker-wrapper')) {
        document.getElementById('icon-dropdown').classList.remove('active');
    }
});

function updateRemoveButtonVisibility() {
    const btn = document.getElementById('remove-base-icon');
    if (state.customBaseIcon) {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

function setShape(s) {
    state.shape = s;
    const shapeEl = document.getElementById('badge-shape');
    const iconEl = document.getElementById('badge-icon-target');
    
    shapeEl.className = 'badge-shape ' + s;
    
    // Special scaling for diamond to fit icons better
    iconEl.classList.toggle('diamond-scaling', s === 'diamond');
    
    document.querySelectorAll('.shape-btn').forEach(btn => {
        if (btn.dataset.shape) btn.classList.toggle('active', btn.dataset.shape === s);
    });
    syncStateToURL();
}

function setBaseShape(s) {
    state.baseShape = s;
    const img = document.getElementById('base-img');
    const bg = document.getElementById('base-bg');
    img.className = 'base-icon ' + s;
    if (bg) bg.className = 'base-bg ' + s;
    
    document.querySelectorAll('[data-base-shape]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.baseShape === s);
    });
    syncStateToURL();
}

function setBaseColor(c) {
    state.baseColor = c;
    const bg = document.getElementById('base-bg');
    const picker = document.getElementById('base-bg-color');
    const swatch = picker.parentElement;
    
    // If it's the default blue, show the gradient. Otherwise solid.
    if (bg) {
        if (c.toLowerCase() === '#1b0573') {
            bg.style.background = 'linear-gradient(135deg, #4603e3, #1b0573)';
        } else {
            bg.style.background = 'none';
            bg.style.backgroundColor = c;
        }
    }
    
    picker.value = c;
    swatch.style.backgroundColor = c;

    // Contrast awareness for placeholder text (only if no custom icon)
    updateBaseIconFilter();
    
    syncStateToURL();
}

function updateBaseIconFilter() {
    const img = document.getElementById('base-img');
    if (!img) return;

    const shadow = state.showShadows ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' : '';
    
    // If it's the placeholder, we check contrast for the "YOUR ICON" text
    if (!state.customBaseIcon) {
        const isLightBg = getContrastColor(state.baseColor) === '#0f172a';
        const brightness = isLightBg ? 'brightness(0.05)' : 'brightness(1)';
        img.style.filter = `${shadow} ${brightness}`.trim() || 'none';
    } else {
        img.style.filter = shadow || 'none';
    }
}

async function handleBaseIconUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Strict File Size Check (4MB)
    if (file.size > 4 * 1024 * 1024) {
        alert('Image is too large (max 4MB). Please choose a smaller file.');
        return;
    }

    // 2. Dimension Check (max 1500px)
    const imgLoader = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    try {
        await new Promise((resolve, reject) => {
            imgLoader.onload = () => {
                if (imgLoader.width > 1500 || imgLoader.height > 1500) {
                    reject(`Image dimensions are too large (${imgLoader.width}x${imgLoader.height}). Max allowed is 1500px on the longest side.`);
                }
                resolve();
            };
            imgLoader.onerror = () => reject('Could not read image file.');
            imgLoader.src = objectUrl;
        });
    } catch (error) {
        alert(error);
        URL.revokeObjectURL(objectUrl);
        return;
    }
    URL.revokeObjectURL(objectUrl);

    const imgEl = document.getElementById('base-img');
    const originalOpacity = imgEl.style.opacity || '1';
    imgEl.style.opacity = '0.4';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'iconBadgeStudio');
    formData.append('folder', 'User Uploads - Icon Badge Studio');

    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/rm20abcd26/image/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Cloudinary limit reached or error');
        
        const data = await response.json();
        const imageUrl = data.secure_url;

        state.customBaseIcon = imageUrl;
        imgEl.src = imageUrl;
        localStorage.setItem('iconStudio_baseIcon', imageUrl);
    } catch (err) {
        console.warn('Cloudinary upload failed, falling back to local storage:', err);
        alert('Cloud upload failed (sharing will be disabled). Saving locally instead...');
        
        // Fallback: Read as DataURL
        const reader = new FileReader();
        await new Promise((resolve) => {
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                state.customBaseIcon = dataUrl;
                imgEl.src = dataUrl;
                localStorage.setItem('iconStudio_baseIcon', dataUrl);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    } finally {
        imgEl.style.opacity = originalOpacity;
        updateRemoveButtonVisibility();
        syncStateToURL();
    }
}

function resetBaseIcon() {
    state.customBaseIcon = null;
    document.getElementById('base-img').src = 'assets/img/base-placeholder.svg';
    localStorage.removeItem('iconStudio_baseIcon');
    document.getElementById('base-icon-upload').value = '';
    setBaseColor('#1b0573');
    updateRemoveButtonVisibility();
}

function setBadgePosition(pos) {
    state.badgePosition = pos;
    const canvas = document.getElementById('icon-canvas');
    const wrap = document.getElementById('badge-wrap');
    
    // Remove old position classes
    canvas.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
    wrap.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
    
    // Add new position classes
    canvas.classList.add('pos-' + pos);
    wrap.classList.add('pos-' + pos);
    
    document.querySelectorAll('[data-pos]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pos === pos);
    });
    syncStateToURL();
}

function getContrastColor(hex) {
    if (!hex || hex.length < 6) return 'white';
    if (hex.startsWith('#')) hex = hex.slice(1);
    
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Standard luminance calculation
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65 ? '#0f172a' : 'white';
}

function setColor(c) {
    state.color = c;
    document.getElementById('badge-shape').style.backgroundColor = c;
    document.getElementById('custom-color').value = c;
    
    // Update icon color based on contrast
    const iconColor = getContrastColor(c);
    document.getElementById('badge-icon-target').style.color = iconColor;
    
    let matchedPreset = false;
    document.querySelectorAll('.color-swatch').forEach(sw => {
        const isActive = sw.style.backgroundColor === c || sw.style.backgroundColor.toLowerCase() === c.toLowerCase();
        sw.classList.toggle('active', isActive);
        if (isActive) matchedPreset = true;
    });

    // If it's a custom color (not in presets), show the rainbow picker as active
    document.getElementById('custom-color-ui').classList.toggle('active', !matchedPreset);
    syncStateToURL();
}

function setIcon(name, shouldHideDropdown = true) {
    if (shouldHideDropdown) {
        document.getElementById('icon-dropdown').classList.remove('active');
        selectedIndex = -1;
    }
    state.icon = name;
    document.getElementById('icon-input').value = name;
    const target = document.getElementById('badge-icon-target');
    
    // 1. Try to render as Lucide icon
    target.innerHTML = `<i data-lucide="${name}"></i>`;
    lucide.createIcons();
    
    // 2. Check if Lucide successfully rendered an SVG
    // Lucide replaces the <i> tag with an <svg> tag if found.
    const hasSvg = target.querySelector('svg');

    if (!hasSvg) {
        // 3. Fallback to text (like "8") if no icon was found
        target.innerHTML = `<span>${name}</span>`;
        
        const span = target.querySelector('span');
        // Dynamic font size calculation using the innerScale state
        let fontSize = 120;
        
        if (name.length > 1) {
            // We adjust the area constant based on the user's innerScale slider
            // 40000 is a good baseline for 100% scale
            const areaBase = (state.innerScale / 100) * 45000;
            fontSize = Math.min(120, Math.sqrt(areaBase / (name.length * 0.6)));
            
            if (fontSize < 14) fontSize = 14;
        }
        
        span.style.fontSize = fontSize + 'px';
        span.style.whiteSpace = 'normal'; // Allow wrapping
        span.style.wordBreak = name.includes(' ') ? 'normal' : 'break-all';
    }
    
    syncStateToURL();
}

function setBaseSize(v) {
    state.baseSize = v;
    document.getElementById('base-size-val').innerText = v;
    const input = document.getElementById('base-size-input');
    if (input) input.value = v;
    const img = document.getElementById('base-img');
    const bg = document.getElementById('base-bg');
    if (img) {
        img.style.width = v + '%';
        img.style.height = v + '%';
    }
    if (bg) {
        bg.style.width = v + '%';
        bg.style.height = v + '%';
    }
    syncStateToURL();
}

function setBadgeSize(v) {
    state.badgeSize = v;
    document.getElementById('badge-size-val').innerText = v;
    const input = document.getElementById('badge-size-input');
    if (input) input.value = v;
    const wrap = document.getElementById('badge-wrap');
    wrap.style.width = v + '%';
    wrap.style.height = v + '%';
    syncStateToURL();
}

function setBadgeRotation(v) {
    state.rotation = v;
    document.getElementById('badge-rot-val').innerText = v;
    const input = document.getElementById('badge-rot-input');
    if (input) input.value = v;
    const wrap = document.getElementById('badge-wrap');
    wrap.style.transform = `rotate(${v}deg)`;
    syncStateToURL();
}

function setInnerScale(v) {
    state.innerScale = v;
    document.getElementById('inner-scale-val').innerText = v;
    const input = document.getElementById('inner-scale-input');
    if (input) input.value = v;
    const target = document.getElementById('badge-icon-target');
    target.style.width = v + '%';
    target.style.height = v + '%';
    
    // Re-render to update font scaling
    setIcon(state.icon);
    syncStateToURL();
}

function toggleShadows(v) {
    state.showShadows = v;
    
    // Sync both toggles
    const t1 = document.getElementById('shadow-toggle');
    const t2 = document.getElementById('shadow-toggle-sc');
    if (t1) t1.checked = v;
    if (t2) t2.checked = v;

    const badge = document.getElementById('badge-wrap');
    
    updateBaseIconFilter();
    badge.style.filter = v ? 'drop-shadow(0 12px 20px rgba(0,0,0,0.4))' : 'none';
    syncStateToURL();
}

function resetDefaults() {
    setShape('circle');
    setColor('#3b82f6');
    setIcon('users');
    setBaseSize(80);
    setBadgeSize(40);
    setInnerScale(70);
    setBadgeRotation(0);
    setBadgePosition('bottom-right');
    toggleShadows(true);
    setBaseShape('squircle');
    setBaseColor('#1b0573');
    document.getElementById('shadow-toggle').checked = true;
    
    // Update range inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        if (input.oninput.toString().includes('setBaseSize')) input.value = 80;
        if (input.oninput.toString().includes('setBadgeSize')) input.value = 40;
        if (input.oninput.toString().includes('setBadgeRotation')) input.value = 0;
        if (input.oninput.toString().includes('setInnerScale')) input.value = 70;
    });
}

function toggleScreenshotMode() {
    document.body.classList.toggle('screenshot-mode');
    updateAppScale();
    syncStateToURL();
}

async function exportPNG() {
    const captureArea = document.getElementById('capture-area');
    const btn = document.querySelector('button.primary');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = 'Generating...';
    btn.disabled = true;

    // Enter screenshot mode temporarily to hide UI elements and background styles
    document.body.classList.add('screenshot-mode');

    try {
        // Ensure images are loaded and wait for any layout shifts
        const images = captureArea.querySelectorAll('img');
        await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        }));

        // Tiny delay for screenshot mode styles to settle
        await new Promise(r => setTimeout(r, 200));

        const dataUrl = await domtoimage.toPng(captureArea, {
            width: 512,
            height: 512,
            cacheBust: true,
            style: {
                transform: 'scale(1)',
                left: '0',
                top: '0',
                margin: '0',
                display: 'flex'
            }
        });

        // Sometimes the first capture misses images on some browsers
        // A second capture usually works if the first "primed" it
        const finalUrl = await domtoimage.toPng(captureArea, {
            width: 512,
            height: 512,
            cacheBust: true
        });

        const link = document.createElement('a');
        link.download = `icon-${state.icon}-${state.shape}.png`;
        link.href = finalUrl;
        link.click();
    } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed. Try taking a manual screenshot.');
    } finally {
        // Exit screenshot mode
        document.body.classList.remove('screenshot-mode');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function copyURL() {
    const btn = document.getElementById('copy-url-btn');
    const originalContent = btn.innerHTML;
    
    try {
        await navigator.clipboard.writeText(window.location.href);
        
        // Success state
        btn.innerHTML = '<i data-lucide="check" style="width:18px;height:18px"></i> Copied!';
        btn.classList.add('success');
        lucide.createIcons();
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('success');
            lucide.createIcons();
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy URL to clipboard.');
    }
}

// Listen for Esc to exit screenshot mode
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('screenshot-mode')) {
        toggleScreenshotMode();
    }
});

init();
