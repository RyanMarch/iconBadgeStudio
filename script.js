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
        baseShape: 'squircle'
    };

    const setOrDelete = (key, val, def) => {
        let displayVal = val;
        let compareDef = def;
        
        if (key === 'color') {
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
    setOrDelete('shadows', state.showShadows, defaults.showShadows);

    if (document.body.classList.contains('screenshot-mode')) {
        params.set('mode', 'screenshot');
    } else {
        params.delete('mode');
    }

    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
    
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
    if (params.has('shadows')) state.showShadows = params.get('shadows') === 'true';

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

    if (state.customBaseIcon) {
        document.getElementById('base-img').src = state.customBaseIcon;
        document.getElementById('remove-base-icon').style.display = 'flex';
    }

    lucide.createIcons();
}

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
    img.className = 'base-icon ' + s;
    
    document.querySelectorAll('[data-base-shape]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.baseShape === s);
    });
    syncStateToURL();
}

function handleBaseIconUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please use an image under 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        state.customBaseIcon = dataUrl;
        document.getElementById('base-img').src = dataUrl;
        localStorage.setItem('iconStudio_baseIcon', dataUrl);
        updateRemoveButtonVisibility();
    };
    reader.readAsDataURL(file);
}

function resetBaseIcon() {
    state.customBaseIcon = null;
    document.getElementById('base-img').src = 'assets/img/base-placeholder.svg';
    localStorage.removeItem('iconStudio_baseIcon');
    document.getElementById('base-icon-upload').value = '';
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

function setIcon(name) {
    if (!name) return;
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
    img.style.width = v + '%';
    img.style.height = v + '%';
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

    const base = document.getElementById('base-img');
    const badge = document.getElementById('badge-wrap');
    
    base.style.filter = v ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' : 'none';
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

// Listen for Esc to exit screenshot mode
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('screenshot-mode')) {
        toggleScreenshotMode();
    }
});

init();
