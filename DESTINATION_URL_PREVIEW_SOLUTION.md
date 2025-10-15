# Showing Destination URL Preview on Social Media

## 🎯 The Problem

You want social media platforms to show the **destination URL's preview** (e.g., YouTube video, article, product page) instead of generic Popiup metadata.

## 🚨 The Challenge

Social media crawlers (Facebook, Twitter, etc.) need to see Open Graph tags **immediately** when they fetch your short link. However:

- ❌ React apps render on the client-side (too late for crawlers)
- ❌ Crawlers don't execute JavaScript
- ❌ They only read the initial HTML response

## ✅ Solutions (Choose One)

### **Option 1: Server-Side Rendering (SSR) - Best for Production**

Use a framework that supports SSR to fetch and render destination URL meta tags.

#### Using Next.js (Recommended)

1. **Convert to Next.js** or create a separate Next.js app for `/r/*` routes
2. **Server-side fetch destination URL**
3. **Extract and render OG tags**

```typescript
// pages/r/[slug].tsx
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string
  
  // Fetch link from Supabase
  const { data: link } = await supabase
    .from('short_links')
    .select('*')
    .eq('slug', slug)
    .single()
  
  // Fetch destination URL's OG tags
  const response = await fetch(link.destination_url)
  const html = await response.text()
  
  // Extract OG tags
  const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/)
  const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)
  
  return {
    props: {
      ogTitle: ogTitle?.[1] || link.title,
      ogImage: ogImage?.[1] || '',
      destinationUrl: link.destination_url
    }
  }
}
```

---

### **Option 2: Supabase Edge Functions - Easiest**

Create an Edge Function that:
1. Fetches destination URL
2. Extracts OG tags
3. Returns HTML with those tags

**Steps:**

1. **Deploy Edge Function** (already created: `supabase/functions/og-proxy/index.ts`)

```bash
# Deploy the function
supabase functions deploy og-proxy
```

2. **Update your short links to use:**
```
https://rpwcxkbubficduwofqhw.supabase.co/functions/v1/og-proxy/your-slug
```

**Pros:**
- ✅ No infrastructure changes
- ✅ Works with current setup
- ✅ Serverless and scalable

**Cons:**
- ⚠️ Requires Supabase Pro plan for Edge Functions
- ⚠️ Additional latency for fetching destination

---

### **Option 3: Pre-render Service - Quick Fix**

Use a service like **Prerender.io** or **Rendertron** to pre-render your pages for crawlers.

**Steps:**

1. **Sign up for Prerender.io** (free tier available)
2. **Add middleware to detect crawlers**
3. **Serve pre-rendered HTML to bots**

```typescript
// In your server or Netlify/Vercel config
if (isCrawler(userAgent)) {
  return fetch(`https://service.prerender.io/${url}`)
}
```

---

### **Option 4: Static HTML Generation - Manual**

Generate static HTML files for each short link with destination OG tags.

**When creating a link:**

1. Fetch destination URL's OG tags
2. Generate HTML file with those tags
3. Upload to `/public/r/slug.html`
4. Configure server to serve these files

**Pros:**
- ✅ Fast (static files)
- ✅ No runtime overhead

**Cons:**
- ❌ Manual process
- ❌ Doesn't scale well
- ❌ Requires regeneration on updates

---

### **Option 5: Cloudflare Workers - Advanced**

Use Cloudflare Workers to intercept requests and serve custom HTML to crawlers.

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const userAgent = request.headers.get('user-agent') || ''
  
  // Detect social media crawlers
  if (isCrawler(userAgent)) {
    const slug = getSlugFromUrl(request.url)
    const link = await fetchLinkData(slug)
    const ogData = await fetchDestinationOG(link.destination_url)
    
    return new Response(generateHTML(ogData), {
      headers: { 'content-type': 'text/html' }
    })
  }
  
  // Regular users get React app
  return fetch(request)
}
```

---

## 🎯 Recommended Solution for Your Setup

### **Use Supabase Edge Functions** (Option 2)

This is the best fit because:
- ✅ Works with your current Supabase setup
- ✅ No major code changes needed
- ✅ Serverless (no server management)
- ✅ Scales automatically

### Implementation Steps:

#### 1. Deploy Edge Function

```bash
cd popiup
supabase functions deploy og-proxy --project-ref rpwcxkbubficduwofqhw
```

#### 2. Update Link Sharing

When sharing links, use the Edge Function URL:
```
https://rpwcxkbubficduwofqhw.supabase.co/functions/v1/og-proxy/your-slug
```

Instead of:
```
https://popiup.com/r/your-slug
```

#### 3. How It Works

```
User shares link on Facebook
        ↓
Facebook crawler fetches Edge Function
        ↓
Edge Function:
  1. Looks up slug in database
  2. Fetches destination URL
  3. Extracts OG tags from destination
  4. Returns HTML with those OG tags
        ↓
Facebook shows destination's preview!
        ↓
User clicks → Redirects to destination
```

---

## 🔧 Alternative: Hybrid Approach

**For the best user experience:**

1. **Edge Function URL** for social sharing (shows destination preview)
2. **React App URL** for direct access (shows popup)

```typescript
// In Dashboard, provide two URLs:
const socialUrl = `https://rpwcxkbubficduwofqhw.supabase.co/functions/v1/og-proxy/${slug}`
const directUrl = `https://popiup.com/r/${slug}`

// Copy buttons:
<Button onClick={() => copy(socialUrl)}>Copy for Social Media</Button>
<Button onClick={() => copy(directUrl)}>Copy Direct Link</Button>
```

---

## 📊 Comparison Table

| Solution | Complexity | Cost | Preview Quality | Popup Works |
|----------|-----------|------|-----------------|-------------|
| SSR (Next.js) | High | Medium | ⭐⭐⭐⭐⭐ | ✅ |
| Edge Functions | Medium | Low* | ⭐⭐⭐⭐⭐ | ✅ |
| Prerender.io | Low | Medium | ⭐⭐⭐⭐ | ✅ |
| Static HTML | Medium | Free | ⭐⭐⭐⭐ | ❌ |
| Cloudflare Workers | High | Low | ⭐⭐⭐⭐⭐ | ✅ |

*Requires Supabase Pro ($25/mo) for Edge Functions

---

## 🚀 Quick Start: Deploy Edge Function

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Link your project
supabase link --project-ref rpwcxkbubficduwofqhw

# 3. Deploy function
supabase functions deploy og-proxy

# 4. Test it
curl https://rpwcxkbubficduwofqhw.supabase.co/functions/v1/og-proxy/test-slug
```

---

## 🎨 User Experience Flow

### With Edge Function:

1. **User creates link** → Gets two URLs
2. **Shares on social media** → Uses Edge Function URL
3. **Facebook fetches** → Sees destination preview
4. **User clicks** → Sees popup → Redirects to destination

### Without Edge Function (Current):

1. **User creates link** → Gets one URL
2. **Shares on social media** → Generic Popiup preview
3. **User clicks** → Sees popup → Redirects to destination

---

## ✅ Next Steps

1. **Choose a solution** (I recommend Edge Functions)
2. **Deploy the function** (already created for you)
3. **Test with Facebook Debugger**
4. **Update Dashboard** to show both URLs
5. **Enjoy rich previews!** 🎉

Would you like me to help you deploy the Edge Function or implement one of the other solutions?
