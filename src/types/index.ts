import { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

// Link/Short Link Types
export interface Link {
    id: string;
    user_id: string;
    slug: string;
    destination_url: string;
    title?: string;
    description?: string;
    created_at: string;
    updated_at?: string;
    clicks?: number;
    is_active?: boolean;
    // Open Graph metadata for social media previews
    og_title?: string;
    og_description?: string;
    og_image?: string;
}

// Popup Content Types
export interface PopupContent {
    type: 'advertisement' | 'announcement' | 'newsletter' | 'custom';
    title?: string;
    message?: string;
    buttonText?: string;
    buttonUrl?: string;
    imageUrl?: string;
    delay_seconds?: number;
    styles?: PopupStyles;
}

export interface PopupStyles {
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    borderRadius?: string;
    padding?: string;
    [key: string]: string | undefined;
}

export interface PopupData {
    id: string;
    user_id: string;
    name: string;
    content: PopupContent | Record<string, unknown> | string;
    type?: string;
    position?: string;
    trigger_type?: string;
    trigger_value?: unknown;
    styles: PopupStyles;
    active: boolean;
    is_active?: boolean;
    created_at: string;
    updated_at?: string;
    targeting_rules?: unknown;
    frequency_cap?: number | null;
}

// User Details Types
export interface UserDetails {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    company?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserMetadata {
    full_name?: string;
    company?: string;
    avatar_url?: string;
    [key: string]: unknown;
}

// Auth Types
export interface AuthResponse {
    user: User | null;
    session: Session | null;
}

export interface SignUpCredentials {
    email: string;
    password: string;
    metadata?: UserMetadata;
}

export interface SignInCredentials {
    email: string;
    password: string;
}

// Error Types
export interface AuthError extends Error {
    message: string;
    status?: number;
    code?: string;
}

export { SupabaseAuthError };
