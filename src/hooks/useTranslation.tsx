import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the translation context type
interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

// Create the context with default values
const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

// Define available languages
const LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

// Translation provider props
interface TranslationProviderProps {
  children: ReactNode;
}

// Translation provider component
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});

  // Load translations on mount and when language changes
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && LANGUAGES.includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    // Initialize with English translations
    setTranslations({
      en: {
        // General
        welcome: 'AI App Store',
        app_store_description: 'Discover, share, and monetize cutting-edge AI applications. Join thousands of developers and users in the world\'s most vibrant AI marketplace.',
        search_placeholder: 'Search for AI apps, tools, or categories...',
        explore_apps: 'Explore Apps',
        watch_demo: 'Watch Demo',
        ai_apps: 'AI Apps',
        active_users: 'Active Users',
        categories_count: 'Categories',
        trusted_by: 'Trusted by developers worldwide',
        
        // Auth
        sign_in: 'Sign In',
        sign_up: 'Sign Up',
        welcome_back: 'Welcome Back',
        join_vibe_store: 'Join Vibe Store',
        continue_with: 'Continue with',
        or_continue_with_email: 'Or continue with email',
        full_name: 'Full Name',
        email: 'Email',
        password: 'Password',
        enter_full_name: 'Enter your full name',
        enter_email: 'Enter your email',
        enter_password: 'Enter your password',
        create_account: 'Create Account',
        no_account: 'Don\'t have an account?',
        have_account: 'Already have an account?',
        terms_agreement: 'By creating an account, you agree to our Terms of Service and Privacy Policy.',
        logout: 'Sign Out',
        
        // Navigation
        home: 'Home',
        developer: 'Developer',
        consumer: 'Consumer',
        admin: 'Admin',
        profile: 'Profile',
        settings: 'Settings',
        switch_to: 'Switch to',
        contact_support: 'Contact Support',
        view_profile: 'View Profile',
        upgrade_plan: 'Upgrade Plan',
        manage_subscription: 'Manage Subscription',
        purchase_history: 'Purchase History',
        
        // Categories
        categories: 'Browse by Category',
        category_description: 'Find AI apps tailored to your specific needs',
        all_categories: 'All Categories',
        browse_all_categories: 'Browse All Categories',
        unknown_category: 'Unknown Category',
        uncategorized: 'Uncategorized',
        category: 'Category',
        
        // Collections
        collections: 'Curated Collections',
        collection_description: 'Handpicked app collections for specific use cases',
        view_collection: 'View Collection',
        browse_all: 'Browse All Collections',
        
        // Apps
        apps: 'Apps',
        all_ai_apps: 'All AI Apps',
        applications: 'applications',
        explore: 'Explore',
        filtered_by: 'Filtered by',
        clear_filter: 'Clear Filter',
        view_all: 'View All',
        featured_apps: 'Featured Apps',
        featured_description: 'Handpicked AI applications that are making waves',
        discover: 'Discover AI Apps',
        discover_description: 'Explore the latest AI applications tailored for you',
        no_apps_found: 'No Apps Found',
        no_apps_in_category: 'No apps found in',
        try_other_categories: 'Try browsing other categories.',
        adjust_search_criteria: 'Try adjusting your search or filter criteria',
        showing: 'Showing',
        of: 'of',
        in: 'in',
        close: 'Close',
        
        // App details
        try_free: 'Try Free',
        open_app: 'Open App',
        buy: 'Buy',
        owned: 'Owned',
        free: 'Free',
        freemium: 'Freemium',
        one_time: 'One-time',
        subscription: 'Subscription',
        visit_app: 'Visit App',
        try_demo: 'Try Demo',
        github_repo: 'GitHub Repository',
        repository: 'Repository',
        tags: 'Tags',
        stats: 'Stats',
        downloads: 'Downloads',
        rating: 'Rating',
        reviews: 'Reviews',
        comments: 'Comments',
        likes: 'Likes',
        followers: 'Followers',
        add_comment: 'Add a comment...',
        post: 'Post',
        loading_comments: 'Loading comments...',
        no_comments: 'No comments yet',
        be_first_comment: 'Be the first to share your thoughts!',
        
        // Social
        like: 'Like',
        liked: 'Liked',
        save: 'Save',
        saved: 'Saved',
        share: 'Share',
        follow: 'Follow',
        unfollow: 'Unfollow',
        
        // Notifications
        notifications: 'Notifications',
        mark_all_read: 'Mark all read',
        all_notifications_read: 'All notifications marked as read',
        no_notifications: 'No new notifications',
        
        // Developer Portal
        developer_portal: 'Developer Portal',
        manage_apps_description: 'Manage your AI applications and track performance',
        become_developer: 'Become a Developer',
        become_developer_description: 'Join thousands of developers sharing their AI innovations on Vibe Store. Submit your apps, track analytics, and monetize your creations.',
        easy_submission: 'Easy Submission',
        easy_submission_description: 'Upload your apps with drag & drop interface',
        realtime_analytics: 'Real-time Analytics',
        analytics_description: 'Track downloads, ratings, and revenue',
        monetization: 'Monetization',
        monetization_description: '70% revenue share with Stripe integration',
        start_developing: 'Start Developing',
        developer_upgrade_success: 'Successfully upgraded to developer mode!',
        developer_upgrade_failed: 'Failed to upgrade to developer mode',
        
        // Developer Dashboard
        overview: 'Overview',
        my_apps: 'My Apps',
        submit_app: 'Submit App',
        analytics: 'Analytics',
        revenue: 'Revenue',
        ready_to_submit: 'Ready to Submit?',
        share_innovation: 'Share your latest AI innovation with the community',
        manage_your_apps: 'Manage Your Apps',
        update_edit_track: 'Update, edit, and track your published applications',
        your_profile: 'Your Profile',
        manage_profile_settings: 'Manage your developer profile and settings',
        view_all: 'View All Apps',
        recent_activity: 'Recent Activity',
        earned_from: 'earned from',
        new_downloads_this_week: 'new downloads this week',
        new_followers: 'new followers',
        
        // App Management
        published_apps: 'Published Apps',
        drafts: 'Drafts',
        submit_new_app: 'Submit New App',
        no_apps_yet: 'No Apps Yet',
        no_apps_description: 'You haven\'t submitted any apps yet. Start by submitting your first app!',
        submit_first_app: 'Submit Your First App',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        created: 'Created',
        last_updated: 'Last updated',
        screenshots: 'screenshots',
        videos: 'videos',
        docs: 'docs',
        no_drafts: 'No Drafts',
        no_drafts_description: 'You don\'t have any saved drafts. Start creating an app to save drafts!',
        continue: 'Continue',
        app_deleted: 'App deleted successfully',
        app_delete_error: 'Error deleting app. Please try again.',
        draft_deleted: 'Draft deleted successfully',
        draft_delete_error: 'Error deleting draft. Please try again.',
        confirm_delete_app: 'Are you sure you want to delete "{appTitle}"? This action cannot be undone.',
        confirm_delete_draft: 'Are you sure you want to delete the draft "{draftTitle}"?',
        app_url_not_available: 'App URL not available',
        draft_editing_coming_soon: 'Draft editing coming soon',
        app_submission_coming_soon: 'App submission form coming soon',
        app_updated: 'App updated successfully',
        
        // App Submission
        basic_information: 'Basic Information',
        short_description: 'Short Description',
        short_description_placeholder: 'Brief description of your app (max 160 characters)',
        detailed_description: 'Detailed Description',
        detailed_description_placeholder: 'Provide a detailed description of your app, its features, and benefits...',
        tags_placeholder: 'Add tags (e.g., AI, NLP, Computer Vision)',
        add: 'Add',
        pricing: 'Pricing',
        price_usd: 'Price (USD)',
        links_resources: 'Links & Resources',
        app_url: 'App URL',
        demo_url: 'Demo URL',
        repository_url: 'Repository URL',
        documentation_url: 'Documentation URL',
        optional: 'Optional',
        media_assets: 'Media & Assets',
        app_logo: 'App Logo',
        app_packages: 'App Packages',
        documentation: 'Documentation',
        demo_videos: 'Demo Videos',
        save_draft: 'Save Draft',
        submit_for_review: 'Submit for Review',
        app_submission_success: 'App submitted successfully!',
        app_submission_success_message: 'App submitted successfully! It will be reviewed within 24-48 hours.',
        app_submission_error: 'Error submitting app. Please try again.',
        
        // Analytics
        total_revenue: 'Total Revenue',
        monthly_revenue: 'Monthly Revenue',
        total_sales: 'Total Sales',
        avg_order_value: 'Avg. Order Value',
        revenue_trend: 'Revenue Trend',
        transaction_volume: 'Transaction Volume',
        revenue_by_app: 'Revenue by App',
        payout_information: 'Payout Information',
        available_balance: 'Available Balance',
        ready_for_payout: 'Ready for payout',
        pending: 'Pending',
        processing_days: 'Processing (7 days)',
        total_paid_out: 'Total Paid Out',
        lifetime_earnings: 'Lifetime earnings',
        revenue_share: 'Revenue Share',
        revenue_share_description: 'You keep 70% of all sales revenue. Platform fee is 30% which covers payment processing, hosting, marketing, and platform maintenance.',
        downloads_over_time: 'Downloads Over Time',
        rating_trend: 'Rating Trend',
        downloads_by_category: 'Downloads by Category',
        top_performing_apps: 'Top Performing Apps',
        csv_download_success: 'CSV file downloaded successfully',
        
        // Profile
        edit_profile: 'Edit Profile',
        avatar_updated: 'Avatar updated successfully!',
        avatar_update_failed: 'Error uploading avatar. Please try again.',
        
        // Social Interactions
        sign_in_to_like: 'Please sign in to like apps',
        app_liked: 'App liked!',
        like_removed: 'Like removed',
        like_failed: 'Failed to update like status',
        sign_in_to_bookmark: 'Please sign in to bookmark apps',
        bookmark_removed: 'Bookmark removed',
        app_bookmarked: 'App bookmarked!',
        bookmark_failed: 'Failed to update bookmark',
        link_copied: 'Link copied to clipboard!',
        copy_failed: 'Failed to copy link',
        profile_view_coming: 'Profile view coming soon!',
        
        // Comments
        enter_comment: 'Please enter a comment',
        comment_posted: 'Comment posted successfully!',
        comment_updated: 'Comment updated successfully!',
        comment_failed: 'Failed to post comment. Please try again.',
        
        // Admin
        admin_dashboard: 'Admin Dashboard',
        admin_dashboard_description: 'Manage platform content and monitor performance',
        total_users: 'Total Users',
        total_apps: 'Total Apps',
        pending_reviews: 'Pending Reviews',
        platform_revenue: 'Platform Revenue',
        this_week: 'this week',
        vs_last_month: 'vs last month',
        needs_attention: 'Needs attention',
        recent_platform_activity: 'Recent Platform Activity',
        new_users_registered_today: '15 new users registered today',
        hours_ago: '2 hours ago',
        new_apps_submitted: '3 new apps submitted for review',
        apps_require_review: '2 apps require content review',
        app_moderation: 'App Moderation',
        user_management: 'User Management',
        
        // Status
        approved: 'Approved',
        pending: 'Pending',
        rejected: 'Rejected',
        
        // Footer
        platform: 'Platform',
        browse_apps: 'Browse Apps',
        featured: 'Featured',
        new_releases: 'New Releases',
        developers: 'Developers',
        api_docs: 'API Documentation',
        guidelines: 'Guidelines',
        all_rights_reserved: 'All rights reserved.',
        made_with: 'Made with',
        by_indie_devs: 'by indie developers',
        
        // Sorting
        most_popular: 'Most Popular',
        newest: 'Newest',
        highest_rated: 'Highest Rated',
        
        // Error handling
        error_title: 'Oops! Something went wrong',
        error_message: 'We\'re sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.',
        refresh_page: 'Refresh Page',
        go_home: 'Go Home',
        error_details: 'Error Details (Development)',
        
        // Language
        language_changed_to: 'Language changed to',
        
        // Loading
        loading: 'Loading...',
      },
      es: {
        welcome: 'Tienda de Aplicaciones IA',
        app_store_description: 'Descubre, comparte y monetiza aplicaciones de IA de vanguardia. Únete a miles de desarrolladores y usuarios en el mercado de IA más vibrante del mundo.',
        search_placeholder: 'Buscar aplicaciones de IA, herramientas o categorías...',
        explore_apps: 'Explorar Aplicaciones',
        watch_demo: 'Ver Demo',
        ai_apps: 'Aplicaciones IA',
        active_users: 'Usuarios Activos',
        categories_count: 'Categorías',
        sign_in: 'Iniciar Sesión',
        sign_up: 'Registrarse',
        try_free: 'Probar Gratis',
        open_app: 'Abrir App',
        buy: 'Comprar',
        free: 'Gratis',
        developer: 'Desarrollador',
        consumer: 'Consumidor',
        // Add more Spanish translations as needed
      },
      fr: {
        welcome: 'Boutique d\'Applications IA',
        app_store_description: 'Découvrez, partagez et monétisez des applications IA de pointe. Rejoignez des milliers de développeurs et d\'utilisateurs dans la marketplace IA la plus dynamique au monde.',
        search_placeholder: 'Rechercher des applications IA, des outils ou des catégories...',
        explore_apps: 'Explorer les Applications',
        watch_demo: 'Voir la Démo',
        ai_apps: 'Applications IA',
        active_users: 'Utilisateurs Actifs',
        categories_count: 'Catégories',
        // Add more French translations as needed
      }
      // Add more languages as needed
    });
  }, []);

  // Translation function
  const t = (key: string, params?: Record<string, any>): string => {
    // Get the translation for the current language, fallback to English
    const translation = translations[language]?.[key] || translations['en']?.[key] || key;
    
    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce((result, [param, value]) => {
        return result.replace(`{${param}}`, String(value));
      }, translation);
    }
    
    return translation;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use the translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};