// Supabase Edge Function to proxy Open Graph tags from destination URL
// This allows social media platforms to see the destination URL's preview

// @ts-ignore - Deno global is available in Supabase Edge Functions runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore - Deno is available in Supabase Edge Functions
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get slug from URL path
    const url = new URL(req.url)
    const slug = url.pathname.split('/').pop()

    if (!slug) {
      return new Response('Slug required', { status: 400, headers: corsHeaders })
    }

    // Initialize Supabase client
    // @ts-ignore - Deno is available in Supabase Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-ignore - Deno is available in Supabase Edge Functions
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch short link data
    const { data: linkData, error } = await supabase
      .from('short_links')
      .select('*, popups(*)')
      .eq('slug', slug)
      .single()

    if (error || !linkData) {
      return new Response('Link not found', { status: 404, headers: corsHeaders })
    }

    // Track analytics
    await supabase.from('analytics').insert({
      short_link_id: linkData.id,
      popup_id: linkData.popup_id,
      event_type: 'click',
      referrer: req.headers.get('referer') || null,
      browser: req.headers.get('user-agent') || null,
    })

    // Fetch Open Graph data from destination URL
    let ogData = {
      title: linkData.title || 'Check this out!',
      description: linkData.description || 'Click to view content',
      image: '',
      url: linkData.destination_url
    }

    try {
      const destResponse = await fetch(linkData.destination_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Popiup/1.0; +https://popiup.com)'
        }
      })
      
      if (destResponse.ok) {
        const html = await destResponse.text()
        
        // Extract Open Graph tags from destination
        const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/)
        const ogDesc = html.match(/<meta property="og:description" content="([^"]*)"/)
        const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)
        
        if (ogTitle) ogData.title = ogTitle[1]
        if (ogDesc) ogData.description = ogDesc[1]
        if (ogImage) ogData.image = ogImage[1]
      }
    } catch (e) {
      console.error('Error fetching destination OG data:', e)
      // Continue with fallback data
    }

    // Generate HTML with Open Graph tags
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ogData.title}</title>
    <meta name="description" content="${ogData.description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url.href}">
    <meta property="og:title" content="${ogData.title}">
    <meta property="og:description" content="${ogData.description}">
    ${ogData.image ? `<meta property="og:image" content="${ogData.image}">` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url.href}">
    <meta name="twitter:title" content="${ogData.title}">
    <meta name="twitter:description" content="${ogData.description}">
    ${ogData.image ? `<meta name="twitter:image" content="${ogData.image}">` : ''}
    
    <!-- Redirect to React app -->
    <meta http-equiv="refresh" content="0;url=${supabaseUrl.replace('https://', 'https://').replace('.supabase.co', '')}/r/${slug}">
    <script>
        window.location.href = '${ogData.url}';
    </script>
</head>
<body>
    <p>Redirecting to <a href="${ogData.url}">${ogData.title}</a>...</p>
</body>
</html>
    `

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
