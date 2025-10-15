# Social Media Link Preview Guide

## 🎯 Problem Solved

When sharing your Popiup short links on social media platforms (Facebook, Twitter, LinkedIn, etc.), they now display rich previews with:
- ✅ Custom title
- ✅ Description
- ✅ Image preview
- ✅ Proper link metadata

## 🔧 What Was Added

### 1. **Dynamic Open Graph Meta Tags**
Added to `RedirectPage.tsx` to generate social media previews based on your link data.

### 2. **React Helmet Integration**
Installed `react-helmet` to dynamically update meta tags for each short link.

### 3. **Automatic Metadata Extraction**
The system automatically pulls:
- **Title**: From your link's title or popup name
- **Description**: From your link's description
- **Image**: From your popup's image (if available)
- **URL**: The destination URL

## 📊 How It Works

### Before (Empty Preview)
```
┌─────────────────────────┐
│ https://popiup.com/r/abc│
│                         │
│ Popiup - Smart Popup... │ ← Generic
└─────────────────────────┘
```

### After (Rich Preview)
```
┌─────────────────────────┐
│ [Image Preview]         │ ← Your popup image
│                         │
│ Your Link Title         │ ← Custom title
│ Your description here   │ ← Custom description
│                         │
│ 🔗 popiup.com/r/abc     │
└─────────────────────────┘
```

## 🚀 Usage

### When Creating a Link

1. **Fill in Title & Description**
   ```typescript
   title: "Amazing Product Launch"
   description: "Check out our new product features!"
   ```

2. **Add Images to Your Popup**
   - Profile image
   - Main content image
   - These will be used in social previews

3. **Share Your Link**
   - Copy: `https://popiup.com/r/your-slug`
   - Paste on Facebook, Twitter, LinkedIn, etc.
   - Rich preview appears automatically!

## 🔍 Meta Tags Generated

For each short link, the following tags are dynamically created:

### Open Graph (Facebook, LinkedIn)
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://popiup.com/r/abc" />
<meta property="og:title" content="Your Link Title" />
<meta property="og:description" content="Your description" />
<meta property="og:image" content="https://your-image-url.jpg" />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://popiup.com/r/abc" />
<meta name="twitter:title" content="Your Link Title" />
<meta name="twitter:description" content="Your description" />
<meta name="twitter:image" content="https://your-image-url.jpg" />
```

### SEO
```html
<title>Your Link Title</title>
<meta name="description" content="Your description" />
<link rel="canonical" href="https://destination-url.com" />
```

## 🎨 Customization

### Priority Order for Metadata

**Title:**
1. Link title (`short_links.title`)
2. Popup profile name (`popups.content.profile_name`)
3. Fallback: "Check this out!"

**Description:**
1. Link description (`short_links.description`)
2. Popup description (`popups.content.description`)
3. Fallback: "Click to view content"

**Image:**
1. Popup main image (`popups.content.image_url`)
2. Popup profile image (`popups.content.profile_image_url`)
3. No fallback (optional field)

## 📱 Platform-Specific Behavior

### Facebook
- Shows large image preview
- Displays title + description
- Updates when you click "Refresh" in post composer

### Twitter
- Uses Twitter Card format
- Shows summary with large image
- Displays title + description

### LinkedIn
- Shows professional preview
- Displays title, description, and image
- Updates automatically

### WhatsApp
- Shows compact preview
- Displays title + image
- May cache for 7 days

## 🔄 Refreshing Previews

### Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your short link URL
3. Click "Scrape Again" to refresh

### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your short link URL
3. Preview updates automatically

### LinkedIn Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your short link URL
3. Click "Inspect"

## 🐛 Troubleshooting

### Issue: Preview not showing

**Check 1:** Verify meta tags are present
```bash
# View page source
curl https://popiup.com/r/your-slug | grep "og:"
```

**Check 2:** Ensure link data exists
- Title and description are filled in
- Images are publicly accessible

**Check 3:** Clear social media cache
- Use platform-specific debugger tools
- Wait 24 hours for automatic refresh

### Issue: Wrong image showing

**Solution:** Check image URLs
```typescript
// In CreatePopup, ensure images are uploaded correctly
profile_image_url: "https://supabase.co/storage/..."
image_url: "https://supabase.co/storage/..."
```

### Issue: Preview shows old data

**Solution:** Clear cache
1. Update your link data in dashboard
2. Use Facebook Debugger to scrape again
3. Share the link again

## 📈 Best Practices

### 1. **Always Add Title & Description**
```typescript
// Good
title: "Summer Sale - 50% Off"
description: "Limited time offer on all products"

// Bad
title: "" // Empty
description: "" // Empty
```

### 2. **Use High-Quality Images**
- Recommended size: 1200x630px
- Format: JPG or PNG
- File size: < 1MB
- Aspect ratio: 1.91:1 (Facebook) or 2:1 (Twitter)

### 3. **Keep Text Concise**
- Title: 60-90 characters
- Description: 150-200 characters
- Avoid special characters that break formatting

### 4. **Test Before Sharing**
- Use debugger tools
- Preview on multiple platforms
- Check mobile view

## 🔐 Privacy & Security

### What's Shared
- ✅ Title, description, image (public)
- ✅ Short link URL (public)
- ❌ User data (not shared)
- ❌ Analytics data (not shared)

### Image Privacy
- Images must be publicly accessible
- Stored in Supabase public buckets
- URLs are permanent

## 📝 Code Reference

### Files Modified
- `src/pages/RedirectPage.tsx` - Added Helmet and meta tags
- `package.json` - Added react-helmet dependency

### Key Components

**Meta Tags State:**
```typescript
const [metaTags, setMetaTags] = useState<{
  title: string;
  description: string;
  image?: string;
  url: string;
} | null>(null);
```

**Helmet Implementation:**
```tsx
<Helmet>
  <title>{metaTags.title}</title>
  <meta property="og:title" content={metaTags.title} />
  <meta property="og:description" content={metaTags.description} />
  {metaTags.image && <meta property="og:image" content={metaTags.image} />}
</Helmet>
```

## ✅ Verification Checklist

- [ ] react-helmet installed
- [ ] Meta tags appear in page source
- [ ] Facebook debugger shows preview
- [ ] Twitter card validator shows preview
- [ ] LinkedIn inspector shows preview
- [ ] Images load correctly
- [ ] Title and description display properly

## 🎉 Success Criteria

Your social media previews are working when:

✅ Pasting link on Facebook shows rich preview
✅ Sharing on Twitter displays card with image
✅ LinkedIn shows professional preview
✅ WhatsApp displays link preview
✅ Images load without errors
✅ Title and description are accurate

## 🆘 Need Help?

Common issues and solutions:

1. **No preview showing**: Check if title/description are set
2. **Wrong image**: Verify image URL is public and accessible
3. **Old data showing**: Use platform debugger to refresh
4. **Preview not updating**: Wait 24 hours or force refresh

## 📚 Additional Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
