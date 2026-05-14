export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;

  // 1. Extract design parameters from the URL
  const text = params.get('bt') || '';
  const icon = params.get('icon') || 'icon';
  const color = params.get('color') || '3b82f6';
  
  // 2. Fetch the static view.html to use as our base template
  // On Cloudflare Pages, we use env.ASSETS.fetch to get static files
  const templateUrl = new URL('/view.html', url.origin);
  const response = await env.ASSETS.fetch(templateUrl);
  let html = await response.text();

  // 3. Define our dynamic metadata
  const title = text ? `"${text}" Design | Icon Studio` : "Shared Design | Icon Studio";
  const description = `Check out this custom ${icon} design created in Icon Studio.`;
  
  // 4. Generate a dynamic preview image using Cloudinary's overlay API
  // We use your Cloudinary account (rm20abcd26) to create this on the fly
  let imageUrl = "https://iconstudio.ryanmarch.me/assets/img/share-preview.png";
  
  if (text) {
      // Clean text for Cloudinary URL (remove special chars that break URLs)
      const cleanText = encodeURIComponent(text.replace(/[#&?%]/g, ''));
      
      // We'll use a dynamic Cloudinary URL that overlays your text on a nice background
      // This creates a 1200x630 social card with your design's text centered
      imageUrl = `https://res.cloudinary.com/rm20abcd26/image/upload/w_1200,h_630,c_fill,b_rgb:${color.replace('#','')}/l_text:Arial_80_bold:${cleanText},co_rgb:ffffff,w_1000,c_fit/one_pixel.png`;
      
      // Note: If you upload your 'share-preview.png' to Cloudinary and name it 'share-base',
      // we could use that as the background instead of a solid color!
  }

  // 5. Inject the dynamic values into the HTML meta tags
  // We use simple string replacement to swap out the static tags from view.html
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${imageUrl}">`);
  
  // 6. Return the modified HTML to the crawler/user
  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "public, max-age=3600" // Cache for 1 hour
    },
  });
}
