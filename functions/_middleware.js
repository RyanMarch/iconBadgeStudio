export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const params = url.searchParams;

  if (url.pathname.startsWith('/s/')) {
    const text = params.get('bt') || params.get('bbt') || '';
    const color = (params.get('color') || params.get('bcolor') || '3b82f6').replace('#', '');
    const shape = params.get('shape') || 'squircle';
    const isDeepFried = params.get('bdf') === 'true';
    const zoom = params.get('bz') || '100';
    
    let radius = '150';
    if (shape === 'circle') radius = 'max';
    if (shape === 'square') radius = '0';
    if (shape === 'roundrect') radius = '80';

    let imgParam = params.get('img') || '';
    let baseImageId = 'one_pixel.png';
    let version = '';
    let iconTransform = `e_colorize:100,co_rgb:${color}`;

    if (imgParam.startsWith('cld:')) {
        let fullId = imgParam.replace('cld:', '').replace(/ /g, '%20').replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
        const versionMatch = fullId.match(/^(v\d+)\/(.+)$/);
        if (versionMatch) {
            version = versionMatch[1];
            baseImageId = versionMatch[2];
        } else {
            baseImageId = fullId;
        }
        iconTransform = `c_fill,g_center,z_${zoom}`;
        if (isDeepFried) iconTransform += ',e_saturation:100,e_contrast:100,e_sharpen:1000';
    }

    const cleanText = encodeURIComponent(text.replace(/[#&?%]/g, '').toUpperCase());
    
    // FANCY PRODUCT SHOT (Safe side-by-side layout)
    const imageUrl = [
        `https://res.cloudinary.com/rm20abcd26/image/upload`,
        `c_fill,w_400,h_400,r_${radius},${iconTransform}`,
        `l_text:Arial_65_bold:${cleanText},co_rgb:ffffff,w_350,c_fit`,
        `c_pad,w_1200,h_630,b_rgb:0f172a,g_west,x_100`,
        `l_text:Arial_80_bold:Icon%20Studio,co_rgb:a5b4fc,g_west,x_600,y_-70`,
        `l_text:Arial_50_bold:View%20shared%0Aicon%20design,co_rgb:ffffff,g_west,x_600,y_70,w_500,c_fit`,
        `${version ? version + '/' : ''}${baseImageId}.jpg`
    ].join('/');

    const title = text ? `"${text}" | Icon Studio` : "Shared Design | Icon Studio";
    const desc = "Check out this custom icon design I made in Icon Studio! Edit, customize, and share your own high-fidelity icons instantly.";
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="website">
    <meta name="theme-color" content="#${color}">
</head>
<body>
    <script data-cfasync="false">
        (function() {
            window.location.replace('/' + window.location.search);
        })();
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "content-type": "text/html;charset=UTF-8" } });
  }

  return next();
}
