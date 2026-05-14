export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const params = url.searchParams;

  if (params.has('color') || params.get('bt') || params.has('img')) {
    
    const text = params.get('bt') || '';
    const icon = params.get('icon') || 'users';
    const color = (params.get('color') || params.get('bcolor') || '3b82f6').replace('#', '');
    const badgeColor = (params.get('bcolor') || params.get('color') || 'ef4444').replace('#', '');
    const pos = params.get('pos') || 'bottom-right';
    const isDeepFried = params.get('bdf') === 'true';
    
    let imgParam = params.get('img') || '';
    let baseImageId = 'one_pixel.png';
    let baseTransform = `e_colorize:100,co_rgb:${color}`;

    if (imgParam.startsWith('cld:')) {
        // Extract the ID and fix spaces/special characters for Cloudinary path
        baseImageId = imgParam.replace('cld:', '');
        // Cloudinary needs spaces to be %20 and handles slashes naturally in the path
        baseImageId = baseImageId.split('/').map(part => encodeURIComponent(part)).join('/');
        
        baseTransform = 'c_fill';
        if (isDeepFried) {
            baseTransform += ',e_saturation:100,e_contrast:100,e_sharpen:500';
        }
    }
    
    let gravity = 'south_east';
    if (pos === 'top-left') gravity = 'north_west';
    if (pos === 'top-right') gravity = 'north_east';
    if (pos === 'bottom-left') gravity = 'south_west';
    
    // Lucide Icon Fetch (Base64 encoded for Cloudinary l_fetch)
    const lucideUrl = `https://unpkg.com/lucide-static@latest/icons/${icon}.svg`;
    const b64Lucide = btoa(lucideUrl).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
    
    const title = text ? `"${text}" Design | Icon Studio` : "Shared Design | Icon Studio";
    const description = `Check out this custom ${icon} design created in Icon Studio.`;
    const cleanText = encodeURIComponent(text.replace(/[#&?%]/g, '').toUpperCase());
    
    // THE ULTIMATE DYNAMIC IMAGE
    const imageUrl = [
        `https://res.cloudinary.com/rm20abcd26/image/upload`,
        `w_1200,h_630,${baseTransform}`,
        `l_text:Arial_100_bold:${cleanText},co_rgb:ffffff,w_1000,c_fit`,
        `l_text:Arial_30_bold_letter_spacing_10:ICON%20STUDIO,co_rgb:ffffff,g_north,y_50,o_50`,
        `l_one_pixel,w_250,h_250,c_fill,r_max,co_rgb:${badgeColor},e_colorize:100,g_${gravity},x_50,y_50`,
        `l_fetch:${b64Lucide},w_150,h_150,co_rgb:ffffff,e_colorize:100,g_${gravity},x_100,y_100`,
        baseImageId
    ].join('/');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Icon Studio">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta name="theme-color" content="#${color}">
</head>
<body>
    <script data-cfasync="false">
        (function() {
            if (window.location.pathname.startsWith('/view')) {
                window.location.replace('/' + window.location.search);
            }
        })();
    </script>
</body>
</html>`;

    const userAgent = request.headers.get('user-agent') || '';
    const isCrawler = userAgent.match(/Twitterbot|facebookexternalhit|Facebot|Slackbot|Discordbot|Applebot|Googlebot|LinkedInBot|Embedly/i);

    if (isCrawler || url.pathname.startsWith('/view')) {
        return new Response(html, { headers: { "content-type": "text/html;charset=UTF-8" } });
    }
  }

  return next();
}
