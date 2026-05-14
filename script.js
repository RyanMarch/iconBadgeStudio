const colors = [
    '#3b82f6', // Blue
    '#9333ea', // Purple
    '#ef4444', // Red
    '#f97316', // Orange
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#f59e0b', // Amber
];

const APP_CONFIG = {
    shape: { url: 'shape', default: 'circle', type: 'string' },
    color: { url: 'color', default: '#3b82f6', type: 'color' },
    icon: { url: 'icon', default: 'users', type: 'string' },
    baseSize: { url: 'bsize', default: 80, type: 'int' },
    badgeSize: { url: 'size', default: 40, type: 'int' },
    innerScale: { url: 'scale', default: 70, type: 'int' },
    rotation: { url: 'rot', default: 0, type: 'int' },
    badgePosition: { url: 'pos', default: 'bottom-right', type: 'string' },
    showShadows: { url: 'shadows', default: true, type: 'bool' },
    baseShape: { url: 'bshape', default: 'squircle', type: 'string' },
    baseColor: { url: 'bcolor', default: '#3b82f6', type: 'color' },
    baseColor2: { url: 'bcolor2', default: '#1D0945', type: 'color' },
    gradientType: { url: 'gt', default: 'linear', type: 'string' },
    gradientAngle: { url: 'ga', default: 135, type: 'int' },
    baseText: { url: 'bt', default: 'YOUR TEXT', type: 'string' },
    baseTextColor: { url: 'btc', default: '#ffffff', type: 'color' },
    baseFrame: { url: 'bf', default: 'none', type: 'string' },
    baseNoise: { url: 'bn', default: false, type: 'bool' },
    baseGlow: { url: 'bglow', default: false, type: 'bool' },
    baseVignette: { url: 'bv', default: false, type: 'bool' },
    baseDeepFried: { url: 'bdf', default: false, type: 'bool' },
    baseCRT: { url: 'bcrt', default: false, type: 'bool' },
    baseMono: { url: 'bm', default: false, type: 'bool' },
    baseZoom: { url: 'bz', default: 100, type: 'int' },
};

// Initialize state from config defaults
const state = Object.keys(APP_CONFIG).reduce((acc, key) => {
    acc[key] = APP_CONFIG[key].default;
    return acc;
}, {
    customBaseIcon: localStorage.getItem('iconStudio_baseIcon') || null
});

function syncStateToURL() {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    const setOrDelete = (urlKey, val, def) => {
        let displayVal = val;
        let compareDef = def;
        
        // Handle color hex stripping for cleaner URLs
        if (urlKey === 'color' || urlKey === 'bcolor' || urlKey === 'bcolor2' || urlKey === 'btc') {
            if (typeof val === 'string' && val.startsWith('#')) displayVal = val.slice(1);
            if (typeof def === 'string' && def.startsWith('#')) compareDef = def.slice(1);
        }

        if (displayVal !== undefined && displayVal !== null && String(displayVal) !== String(compareDef)) {
            params.set(urlKey, displayVal);
        } else {
            params.delete(urlKey);
        }
    };

    // Sync all standard config properties
    Object.keys(APP_CONFIG).forEach(key => {
        const config = APP_CONFIG[key];
        setOrDelete(config.url, state[key], config.default);
    });

    if (document.body.classList.contains('screenshot-mode')) {
        params.set('mode', 'screenshot');
    } else {
        params.delete('mode');
    }

    if (state.customBaseIcon && state.customBaseIcon.startsWith('http')) {
        let displayUrl = state.customBaseIcon;
        const prefix = 'https://res.cloudinary.com/rm20abcd26/image/upload/';
        if (displayUrl.startsWith(prefix)) {
            displayUrl = 'cld:' + displayUrl.replace(prefix, '');
        }
        params.set('img', displayUrl);
    } else {
        params.delete('img');
    }

    const shareUrl = `${window.location.origin}/s/?${params.toString()}`;
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
    
    Object.keys(APP_CONFIG).forEach(key => {
        const config = APP_CONFIG[key];
        if (params.has(config.url)) {
            const val = params.get(config.url);
            if (config.type === 'int') {
                state[key] = parseInt(val);
            } else if (config.type === 'bool') {
                state[key] = val === 'true';
            } else if (config.type === 'color') {
                state[key] = val.startsWith('#') ? val : '#' + val;
            } else {
                state[key] = val;
            }
        }
    });

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
    setBaseColor1(state.baseColor);
    setBaseColor2(state.baseColor2);
    setBaseGradientType(state.gradientType);
    setBaseGradientAngle(state.gradientAngle);
    setBaseText(state.baseText);
    setBaseTextColor(state.baseTextColor);
    setBaseFrame(state.baseFrame);
    setBaseImageZoom(state.baseZoom);
    applyBaseEffects();

    if (state.customBaseIcon) {
        document.getElementById('base-img').src = state.customBaseIcon;
        document.getElementById('remove-base-icon').style.display = 'flex';
    }
    updateBaseControls();

    fetchIconList();
    lucide.createIcons();

    // Disable right-click on the capture area
    document.getElementById('capture-area').addEventListener('contextmenu', (e) => e.preventDefault());

    // Setup dynamic scaling
    window.addEventListener('resize', updateAppScale);
    updateAppScale();

    // Subtle feedback for character limit
    const baseTextInput = document.getElementById('base-text-input');
    if (baseTextInput) {
        baseTextInput.addEventListener('keydown', (e) => {
            // If at limit and typing a normal character (length 1)
            if (baseTextInput.value.length >= 30 && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                baseTextInput.classList.remove('shake');
                void baseTextInput.offsetWidth; // Trigger reflow
                baseTextInput.classList.add('shake');
            }
        });
    }
}

function updateAppScale() {
    const container = document.getElementById('tool-container');
    if (!container || document.body.classList.contains('screenshot-mode')) {
        document.documentElement.style.setProperty('--app-scale', '1');
        return;
    }

    const isMobile = window.innerWidth <= 1150;
    
    if (isMobile) {
        if (window.innerWidth < 450) {
            const scale = (window.innerWidth - 20) / 420; 
            document.documentElement.style.setProperty('--app-scale', Math.max(0.85, Math.min(1, scale)));
        } else {
            document.documentElement.style.setProperty('--app-scale', '1');
        }
        return;
    }

    // Full-screen desktop scaling: focuses on content density with 600px canvas
    const targetWidth = 1500; 
    let scale = window.innerWidth / targetWidth;
    
    // Clamp scale: keep UI comfortable and readable
    scale = Math.min(Math.max(scale, 0.8), 1.15);
    
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

function updateBaseControls() {
    const hasImage = !!state.customBaseIcon;
    const gradControls = document.getElementById('base-gradient-controls');
    const imageControls = document.getElementById('base-image-controls');
    
    if (gradControls) gradControls.style.display = hasImage ? 'none' : 'block';
    if (imageControls) imageControls.style.display = hasImage ? 'block' : 'none';
}

function setBaseImageZoom(v) {
    state.baseZoom = v;
    const valEl = document.getElementById('base-zoom-val');
    const input = document.getElementById('base-zoom-input');
    const img = document.getElementById('base-img');
    
    if (valEl) valEl.innerText = v;
    if (input) input.value = v;
    if (img) {
        img.style.transform = `scale(${v / 100})`;
    }
    syncStateToURL();
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
    const shapes = ['square', 'squircle', 'roundrect', 'circle'];
    const elements = [
        document.getElementById('base-img'),
        document.getElementById('base-bg'),
        document.getElementById('base-frame'),
        document.getElementById('base-effects'),
        document.getElementById('base-overlay')
    ];

    elements.forEach(el => {
        if (!el) return;
        shapes.forEach(sh => el.classList.remove(sh));
        el.classList.add(s);
    });
    
    document.querySelectorAll('[data-base-shape]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.baseShape === s);
    });
    syncStateToURL();
}

function setBaseFrame(f) {
    state.baseFrame = f;
    const frame = document.getElementById('base-frame');
    const bg = document.getElementById('base-bg');
    
    if (frame) {
        frame.className = `base-frame ${f} ${state.baseShape}`;
        frame.style.display = f === 'none' ? 'none' : 'block';
    }
    
    if (bg) {
        // Remove existing frame classes
        bg.classList.forEach(cls => {
            if (cls.startsWith('frame-')) bg.classList.remove(cls);
        });
        if (f !== 'none') bg.classList.add('frame-' + f);
    }
    
    document.querySelectorAll('[data-base-frame]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.baseFrame === f);
    });

    updateBaseBackground();
    syncStateToURL();
}

function toggleBaseEffect(eff) {
    if (eff === 'noise') state.baseNoise = !state.baseNoise;
    if (eff === 'glow') state.baseGlow = !state.baseGlow;
    if (eff === 'vignette') state.baseVignette = !state.baseVignette;
    if (eff === 'deep-fried') state.baseDeepFried = !state.baseDeepFried;
    if (eff === 'crt') state.baseCRT = !state.baseCRT;
    if (eff === 'mono') state.baseMono = !state.baseMono;
    
    applyBaseEffects();
    syncStateToURL();
}

function applyBaseEffects() {
    const base = document.getElementById('base-bg');
    const effects = document.getElementById('base-effects');
    const overlay = document.getElementById('base-overlay');
    
    if (effects) {
        effects.classList.toggle('effect-glow', state.baseGlow);
        effects.classList.toggle('effect-vignette', state.baseVignette);
        effects.classList.toggle('effect-crt', state.baseCRT);
    }
    
    if (overlay) {
        overlay.classList.toggle('noise', state.baseNoise);
    }

    if (base) {
        base.classList.toggle('effect-deep-fried', state.baseDeepFried);
        base.classList.toggle('effect-monochrome', state.baseMono);
    }
    
    // Update button active states
    document.getElementById('effect-noise').classList.toggle('active', state.baseNoise);
    document.getElementById('effect-glow').classList.toggle('active', state.baseGlow);
    document.getElementById('effect-vignette').classList.toggle('active', state.baseVignette);
    document.getElementById('effect-deep-fried').classList.toggle('active', state.baseDeepFried);
    document.getElementById('effect-crt').classList.toggle('active', state.baseCRT);
    document.getElementById('effect-mono').classList.toggle('active', state.baseMono);
}

function setBaseColor1(c) {
    state.baseColor = c;
    const picker = document.getElementById('base-bg-color-1');
    if (picker) {
        picker.value = c;
        picker.parentElement.style.setProperty('--swatch-color', c);
    }
    updateBaseBackground();
    updateBaseIconFilter();
    syncStateToURL();
}

function setBaseColor2(c) {
    state.baseColor2 = c;
    const picker = document.getElementById('base-bg-color-2');
    if (picker) {
        picker.value = c;
        picker.parentElement.style.setProperty('--swatch-color', c);
    }
    updateBaseBackground();
    syncStateToURL();
}

function setBaseGradientType(t) {
    state.gradientType = t;
    
    // Update active state for buttons
    document.querySelectorAll('[data-grad-type]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gradType === t);
    });
    
    const angleGroup = document.getElementById('base-angle-group');
    if (angleGroup) {
        angleGroup.style.display = (t === 'linear' || t === 'conic') ? 'flex' : 'none';
    }
    
    updateBaseBackground();
    syncStateToURL();
}

function setBaseGradientAngle(a) {
    state.gradientAngle = a;
    const val = document.getElementById('base-angle-val');
    const input = document.getElementById('base-angle-input');
    if (val) val.innerText = a;
    if (input) input.value = a;
    
    updateBaseBackground();
    syncStateToURL();
}

function setBaseText(val) {
    state.baseText = val;
    const input = document.getElementById('base-text-input');
    if (input) input.value = val;
    
    const countEl = document.getElementById('base-text-count');
    if (countEl) {
        countEl.innerText = `${val.length}/30`;
        countEl.classList.toggle('at-limit', val.length >= 30);
    }
    
    updateBasePreview();
    syncStateToURL();
}

function setBaseTextColor(color) {
    state.baseTextColor = color;
    const picker = document.getElementById('base-text-color');
    const ui = document.getElementById('base-text-color-ui');
    if (picker) picker.value = color;
    if (ui) ui.style.setProperty('--swatch-color', color);
    updateBasePreview();
    syncStateToURL();
}

function updateBasePreview() {
    const imgEl = document.getElementById('base-img');
    const textEl = document.getElementById('base-text');
    
    const hasCustomIcon = !!state.customBaseIcon;
    const hasText = state.baseText && state.baseText.trim() !== '';
    const isDefaultText = state.baseText === 'YOUR TEXT';
    
    if (hasCustomIcon) {
        imgEl.style.display = 'block';
        if (imgEl.src !== state.customBaseIcon) {
            imgEl.src = state.customBaseIcon;
        }
    } else {
        imgEl.style.display = 'none';
    }

    if (hasText && !(hasCustomIcon && isDefaultText)) {
        textEl.style.display = 'flex';
        
        const textToShow = state.baseText;
        textEl.innerText = textToShow;
        textEl.style.color = state.baseTextColor;
        
        // Font size scaling: Now using Container-relative units (cqw) for perfect fluid scaling
        const textLength = textToShow.length;
        const words = textToShow.split(/\s+/);
        const longestWordLength = Math.max(...words.map(w => w.length));
        
        // charFactor determines how "tightly" we fit the characters.
        const charFactor = 0.8; 
        
        // Calculate font size as a percentage of the container width (cqw)
        // A font-size of 25cqw is roughly equivalent to the old 80px on a 320px canvas
        let fontSize = Math.min(25, 25 / (longestWordLength * charFactor / 4));
        const maxTotalFontSize = (25 * 3.5) / (textLength * charFactor / 4);
        fontSize = Math.min(fontSize, maxTotalFontSize);
        
        // Scale by the user's baseSize setting
        fontSize = fontSize * (state.baseSize / 80);
        
        // Minimum legible size in container units
        if (fontSize < 4) fontSize = 4;
        
        textEl.style.fontSize = fontSize + 'cqw';
        textEl.style.lineHeight = '0.95';
        
        const shadow = state.showShadows ? '0 10px 15px rgba(0,0,0,0.3)' : 'none';
        textEl.style.textShadow = shadow;
    } else {
        textEl.style.display = 'none';
    }
}

function updateBaseBackground() {
    const bg = document.getElementById('base-bg');
    if (!bg) return;
    
    let color1 = state.baseColor;
    let color2 = state.baseColor2;

    // Apply transparency for glass mode
    if (state.baseFrame === 'glass') {
        // Convert hex to 40% opacity hex
        color1 = color1 + '66';
        color2 = color2 + '66';
    }
    
    let gradient;
    if (state.gradientType === 'linear') {
        gradient = `linear-gradient(${state.gradientAngle}deg, ${color1}, ${color2})`;
    } else if (state.gradientType === 'radial') {
        gradient = `radial-gradient(circle, ${color1}, ${color2})`;
    } else if (state.gradientType === 'conic') {
        gradient = `conic-gradient(from ${state.gradientAngle}deg, ${color1}, ${color2}, ${color1})`;
    } else if (state.gradientType === 'mesh') {
        gradient = `
            radial-gradient(at 0% 0%, ${color1} 0px, transparent 50%),
            radial-gradient(at 100% 0%, ${color2} 0px, transparent 50%),
            radial-gradient(at 100% 100%, ${color1} 0px, transparent 50%),
            radial-gradient(at 0% 100%, ${color2} 0px, transparent 50%),
            ${color1}
        `.trim().replace(/\n\s+/g, ' ');
    }
    
    bg.style.background = gradient;
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

    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('visible');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'iconStudio');
    formData.append('folder', 'User Uploads - Icon Studio');

    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/rm20abcd26/image/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Cloudinary limit reached or error');
        
        const data = await response.json();
        const imageUrl = data.secure_url;

        state.customBaseIcon = imageUrl;
        const imgEl = document.getElementById('base-img');
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
                document.getElementById('base-img').src = dataUrl;
                localStorage.setItem('iconStudio_baseIcon', dataUrl);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    } finally {
        if (overlay) overlay.classList.remove('visible');
        updateRemoveButtonVisibility();
        updateBaseControls();
        updateBasePreview();
        syncStateToURL();
    }
}

function resetBaseIcon() {
    state.customBaseIcon = null;
    localStorage.removeItem('iconStudio_baseIcon');
    const uploadInput = document.getElementById('base-icon-upload');
    if (uploadInput) uploadInput.value = '';
    
    setBaseColor1('#5E007F');
    updateRemoveButtonVisibility();
    updateBaseControls();
    updateBasePreview();
    syncStateToURL();
}

function setBadgePosition(pos) {
    state.badgePosition = pos;
    const canvas = document.getElementById('icon-canvas');
    const wrap = document.getElementById('badge-wrap');
    
    // Remove old position classes
    canvas.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
    wrap.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
    
    if (pos === 'none') {
        wrap.style.display = 'none';
    } else {
        wrap.style.display = 'flex';
        // Add new position classes
        canvas.classList.add('pos-' + pos);
        wrap.classList.add('pos-' + pos);
    }
    
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
    document.getElementById('custom-color-ui').style.setProperty('--swatch-color', c);
    
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
        // The badge is roughly 25-40% of the canvas width
        let fontSize = 12; // Base size in cqw
        
        if (name.length > 1) {
            const areaBase = (state.innerScale / 100) * 150; 
            fontSize = Math.min(12, Math.sqrt(areaBase / (name.length * 0.8)));
            if (fontSize < 2) fontSize = 2;
        }
        
        span.style.fontSize = fontSize + 'cqw';
        span.style.whiteSpace = 'normal';
        span.style.wordBreak = name.includes(' ') ? 'normal' : 'break-all';
    }
    
    syncStateToURL();
}

function setBaseSize(v) {
    state.baseSize = v;
    document.getElementById('base-size-val').innerText = v;
    const input = document.getElementById('base-size-input');
    if (input) input.value = v;
    const bg = document.getElementById('base-bg');
    if (bg) {
        bg.style.width = v + '%';
        bg.style.height = v + '%';
    }
    updateBasePreview();
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
    updateBasePreview();
    badge.style.filter = v ? 'drop-shadow(0 12px 20px rgba(0,0,0,0.4))' : 'none';
    syncStateToURL();
}

function resetDefaults() {
    // 1. Reset file input but preserve the current state.customBaseIcon
    const uploadInput = document.getElementById('base-icon-upload');
    if (uploadInput) uploadInput.value = '';

    // 2. Restore all state values from APP_CONFIG
    Object.keys(APP_CONFIG).forEach(key => {
        state[key] = APP_CONFIG[key].default;
    });

    // 3. Update UI to match new state
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
    setBaseColor1(state.baseColor);
    setBaseColor2(state.baseColor2);
    setBaseGradientType(state.gradientType);
    setBaseGradientAngle(state.gradientAngle);
    setBaseText(state.baseText);
    setBaseTextColor(state.baseTextColor);
    setBaseFrame(state.baseFrame);
    setBaseImageZoom(state.baseZoom);
    applyBaseEffects();
    
    // 4. Update UI visibility
    updateRemoveButtonVisibility();
    updateBaseControls();
    updateBasePreview();
    
    // Sync final state to URL
    syncStateToURL();
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

        // First capture to "prime" the browser
        await domtoimage.toPng(captureArea, {
            width: 1024,
            height: 1024,
            cacheBust: true,
            style: {
                transform: 'scale(1)',
                left: '0',
                top: '0',
                margin: '0',
                display: 'flex'
            }
        });

        // Second capture for the actual file
        const finalUrl = await domtoimage.toPng(captureArea, {
            width: 1024,
            height: 1024,
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
        let url = window.location.href;
        if (window.location.search) {
            // Use /s/ for the share preview to bypass Cloudflare's static cache
            url = window.location.origin + '/s/' + window.location.search;
        }
        await navigator.clipboard.writeText(url);
        
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
function toggleBaseDrawer() {
    const drawer = document.getElementById('base-drawer');
    const trigger = document.getElementById('drawer-trigger');
    if (!drawer || !trigger) return;
    
    drawer.classList.toggle('active');
    trigger.classList.toggle('active');
}

// Ensure drawer is reset if window is resized above mobile breakpoint
window.addEventListener('resize', () => {
    if (window.innerWidth > 1150) {
        const drawer = document.getElementById('base-drawer');
        const trigger = document.getElementById('drawer-trigger');
        if (drawer) drawer.classList.remove('active');
        if (trigger) trigger.classList.remove('active');
    }
});
