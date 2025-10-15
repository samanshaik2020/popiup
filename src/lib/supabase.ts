import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
)

// Utility functions for working with the database

// Popup related functions
export const getPopups = async (userId: string) => {
  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getPopup = async (id: string) => {
  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Alias for getPopup - used in EditPopup component
export const getPopupById = getPopup

export const createPopup = async (popup: Database['public']['Tables']['popups']['Insert']) => {
  const { data, error } = await supabase
    .from('popups')
    .insert(popup)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updatePopup = async (id: string, popup: Database['public']['Tables']['popups']['Update']) => {
  const { data, error } = await supabase
    .from('popups')
    .update(popup)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deletePopup = async (id: string) => {
  const { error } = await supabase
    .from('popups')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Short link related functions
export const getShortLinks = async (userId: string) => {
  const { data, error } = await supabase
    .from('short_links')
    .select('*, popups(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getShortLink = async (id: string) => {
  const { data, error } = await supabase
    .from('short_links')
    .select('*, popups(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Alias for getShortLink - used in EditPopup component
export const getShortLinkById = getShortLink

// Get short link by popup ID
export const getShortLinkByPopupId = async (popupId: string) => {
  const { data, error } = await supabase
    .from('short_links')
    .select('*')
    .eq('popup_id', popupId)
    .maybeSingle() // Use maybeSingle instead of single to avoid errors when no rows are found
  
  if (error) throw error
  return data
}

export const getShortLinkBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('short_links')
    .select('*, popups(*)')
    .eq('slug', slug)
    .maybeSingle() // Use maybeSingle instead of single to avoid errors when no rows are found
  
  if (error) throw error
  return data
}

export const createShortLink = async (shortLink: Database['public']['Tables']['short_links']['Insert']) => {
  try {
    // Check if slug already exists
    if (shortLink.slug) {
      const { data: existingSlug } = await supabase
        .from('short_links')
        .select('id')
        .eq('slug', shortLink.slug)
        .maybeSingle();
      
      // If slug exists, generate a new one
      if (existingSlug) {
        console.log('Slug already exists, generating a new one');
        shortLink.slug = `${shortLink.slug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }
    
    // Insert the short link
    const { data, error } = await supabase
      .from('short_links')
      .insert(shortLink)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating short link:', error);
    throw error;
  }
}

export const updateShortLink = async (id: string, shortLink: Database['public']['Tables']['short_links']['Update']) => {
  const { data, error } = await supabase
    .from('short_links')
    .update(shortLink)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteShortLink = async (id: string) => {
  const { error } = await supabase
    .from('short_links')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// File upload related functions
export const uploadFile = async (
  file: File,
  filePath: string,
  onProgress?: (progress: number) => void
) => {
  try {
    // We'll use a fixed bucket name that we know exists in the Supabase project
    // Based on the Supabase URL in the project configuration
    const bucketName = 'images'; // Use a simple bucket name that likely exists
    
    // Create a clean file path without bucket prefix
    // Extract just the filename to avoid path issues
    const fileName = filePath.split('/').pop() || `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${file.name.split('.').pop()}`;
    
    // Create a clean path with user ID if available
    const userId = filePath.includes('/') ? filePath.split('/')[1] : 'anonymous';
    const uploadPath = `${userId}/${fileName}`;
    
    console.log(`Uploading to bucket: ${bucketName}, path: ${uploadPath}`);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      
    // Since onUploadProgress isn't directly supported in the type,
    // we'll simulate progress after upload completes
    if (onProgress) {
      // Simulate 100% completion
      onProgress(100);
    }

    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);
    
    // Log the URL for debugging
    console.log('Generated public URL:', publicUrlData.publicUrl);
    
    // Return the public URL from Supabase
    return { data, publicUrl: publicUrlData.publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Analytics related functions
export const trackEvent = async (event: Database['public']['Tables']['analytics']['Insert']) => {
  const { data, error } = await supabase
    .from('analytics')
    .insert(event)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getAnalytics = async (userId: string, filters?: { 
  shortLinkId?: string, 
  popupId?: string,
  startDate?: string,
  endDate?: string,
  eventType?: string
}) => {
  let query = supabase
    .from('analytics')
    .select(`
      *,
      short_links!inner(
        *,
        user_id
      )
    `)
    .eq('short_links.user_id', userId)
  
  if (filters?.shortLinkId) {
    query = query.eq('short_link_id', filters.shortLinkId)
  }
  
  if (filters?.popupId) {
    query = query.eq('popup_id', filters.popupId)
  }
  
  if (filters?.eventType) {
    query = query.eq('event_type', filters.eventType)
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Get click statistics for a user
export const getClickStats = async (userId: string) => {
  // Get all short links for the user
  const { data: links, error: linksError } = await supabase
    .from('short_links')
    .select('id')
    .eq('user_id', userId)
  
  if (linksError) throw linksError
  
  if (!links || links.length === 0) {
    return {
      totalClicks: 0,
      avgClicksPerLink: 0,
      clicksByLink: {}
    }
  }
  
  const linkIds = links.map(link => link.id)
  
  // Get all click events for these links
  const { data: analytics, error: analyticsError } = await supabase
    .from('analytics')
    .select('short_link_id, event_type')
    .in('short_link_id', linkIds)
    .eq('event_type', 'click')
  
  if (analyticsError) throw analyticsError
  
  // Calculate statistics
  const totalClicks = analytics?.length || 0
  const avgClicksPerLink = links.length > 0 ? totalClicks / links.length : 0
  
  // Group clicks by link
  const clicksByLink: Record<string, number> = {}
  analytics?.forEach(event => {
    if (event.short_link_id) {
      clicksByLink[event.short_link_id] = (clicksByLink[event.short_link_id] || 0) + 1
    }
  })
  
  return {
    totalClicks,
    avgClicksPerLink,
    clicksByLink
  }
}

// Get clicks for a specific short link
export const getShortLinkClicks = async (shortLinkId: string) => {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('short_link_id', shortLinkId)
    .eq('event_type', 'click')
  
  if (error) throw error
  return data?.length || 0
}
