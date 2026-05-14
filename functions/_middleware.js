export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const params = url.searchParams;

  // If the link has design parameters (color or text), we show the custom "Banana" preview
  // This works for both /view AND the main root URL /
  if (params.has('color') || params.get('bt')) {
    
    const text = params.get('bt') || 'New Design';
    const icon = params.get('icon') || 'icon';
    const color = (params.get('color') || '3b82f6').replace('#', '');
    
    const title = `"${text}" Design | Icon Studio`;
    const description = `Check out this custom ${icon} design created in Icon Studio.`;
    
    const cleanText = encodeURIComponent(text.replace(/[#&?%]/g, '').toUpperCase());
    
    // The "Premium" dynamic image
    const imageUrl = `https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,e_colorize:100,co_rgb:${color}/l_text:Arial_100_bold:${cleanText},co_rgb:ffffff,w_1000,c_fit/l_text:Arial_30_bold_letter_spacing_10:ICON%20STUDIO,co_rgb:ffffff,g_north,y_100,o_50/l_text:Arial_30:VIEW%20SHARED%20DESIGN,co_rgb:ffffff,g_south,y_100,o_80/one_pixel.png`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Icon Studio">
    <meta property="og:url" content="${url.origin}/">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    
    <meta name="theme-color" content="#${color}">

    <style>
        body { background: #0f172a; color: white; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #${color}; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="spinner"></div>
    <script data-cfasync="false">
        (function() {
            // If we are on the /view path, redirect to root
            // If we are already on root, just let the app load
            if (window.location.pathname.startsWith('/view')) {
                window.location.replace('/' + window.location.search);
            } else {
                // We are already on root, but we served the "preview" HTML.
                // We need to force a reload or just let the app boot.
                // Actually, for real users, we want them to see the ACTUAL app.
                // So we'll only serve this preview HTML to CRAWLERS (iMessage, Slack, etc.)
            }
        })();
    </script>
</body>
</html>`;

    // CRITICAL: We only serve this preview HTML if it looks like a Crawler
    // Otherwise, we let the real app load so the user doesn't see a spinner.
    const userAgent = request.headers.get('user-agent') || '';
    const isCrawler = userAgent.match(/Twitterbot|facebookexternalhit|Facebot|Slackbot|Discordbot|Applebot|Googlebot|LinkedInBot|Embedly/i);

    if (isCrawler || url.pathname.startsWith('/view')) {
        return new Response(html, {
            headers: { "content-type": "text/html;charset=UTF-8" },
        });
    }
  }

  return next();
}
