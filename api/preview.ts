import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { slug } = req.query;

    console.log(`[Preview Function] Processing slug: ${slug}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('[Preview Function] Missing Supabase configuration');
        return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Fetch Link Data
        const { data: link, error } = await supabase
            .from('short_links')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !link) {
            console.log(`[Preview Function] Link not found for slug: ${slug}`);
            // Link not found, redirect to home
            return res.redirect('/');
        }

        // 2. Fetch the base HTML (index.html)
        // We use the deployment URL to get the built index.html
        const appUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:5173';

        console.log(`[Preview Function] Fetching index.html from: ${appUrl}`);
        const indexResponse = await fetch(`${appUrl}/index.html`);
        let html = await indexResponse.text();

        // 3. Prepare Metadata
        const title = link.og_title || link.title || 'Popiup Link';
        const description = link.og_description || link.description || 'Check this out!';
        const image = link.og_image || `${appUrl}/og-image.png`;
        const url = link.destination_url;

        // 4. Inject Metadata into HTML
        // Replace Title
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

        // Replace Description
        html = html.replace(
            /<meta name="description" content=".*?" \/>/,
            `<meta name="description" content="${description}" />`
        );

        // Replace Open Graph Tags
        const ogReplacements = {
            'og:title': title,
            'og:description': description,
            'og:image': image,
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:url': url
        };

        for (const [property, content] of Object.entries(ogReplacements)) {
            const regex = new RegExp(`<meta property="${property}" content=".*?" \/>`);
            if (regex.test(html)) {
                html = html.replace(regex, `<meta property="${property}" content="${content}" />`);
            } else {
                // If tag doesn't exist, append it to head
                html = html.replace('</head>', `<meta property="${property}" content="${content}" />\n</head>`);
            }
        }

        // Replace Twitter Tags
        const twitterReplacements = {
            'twitter:title': title,
            'twitter:description': description,
            'twitter:image': image
        };

        for (const [name, content] of Object.entries(twitterReplacements)) {
            const regex = new RegExp(`<meta name="${name}" content=".*?" \/>`);
            if (regex.test(html)) {
                html = html.replace(regex, `<meta name="${name}" content="${content}" />`);
            } else {
                html = html.replace('</head>', `<meta name="${name}" content="${content}" />\n</head>`);
            }
        }

        // 5. Return the modified HTML
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=59');
        return res.status(200).send(html);

    } catch (err) {
        console.error('[Preview Function] Error:', err);
        return res.status(500).send('Internal Server Error');
    }
}
