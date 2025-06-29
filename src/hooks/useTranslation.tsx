import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Create a context for the translation
const TranslationContext = createContext<{
  language: string;
  t: (key: string) => string;
  setLanguage: (lang: string) => void;
}>({
  language: 'en',
  t: (key: string) => key,
  setLanguage: () => {},
});

// Sample translations for demonstration
const translations: Record<string, Record<string, string>> = {
  en: {
    'welcome': 'Welcome to Vibe Store',
    'featured_apps': 'Featured Apps',
    'discover': 'Discover AI Apps',
    'categories': 'Browse by Category',
    'collections': 'Curated Collections',
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'profile': 'Profile',
    'settings': 'Settings',
    'developer': 'Developer',
    'consumer': 'Consumer',
    'admin': 'Admin',
    'search': 'Search',
    'followers': 'followers',
    'following': 'following',
    'submit_app': 'Submit App',
    'manage_apps': 'Manage Apps',
    'analytics': 'Analytics',
    'revenue': 'Revenue',
    'logout': 'Sign Out',
    'ai_tools': 'AI Tools',
  },
  es: {
    'welcome': 'Bienvenido a Vibe Store',
    'featured_apps': 'Aplicaciones Destacadas',
    'discover': 'Descubre Aplicaciones de IA',
    'categories': 'Explorar por Categoría',
    'collections': 'Colecciones Seleccionadas',
    'sign_in': 'Iniciar Sesión',
    'sign_up': 'Registrarse',
    'profile': 'Perfil',
    'settings': 'Configuración',
    'developer': 'Desarrollador',
    'consumer': 'Consumidor',
    'admin': 'Administrador',
    'search': 'Buscar',
    'followers': 'seguidores',
    'following': 'siguiendo',
    'submit_app': 'Enviar Aplicación',
    'manage_apps': 'Administrar Aplicaciones',
    'analytics': 'Analíticas',
    'revenue': 'Ingresos',
    'logout': 'Cerrar Sesión',
    'ai_tools': 'Herramientas de IA',
  },
  fr: {
    'welcome': 'Bienvenue sur Vibe Store',
    'featured_apps': 'Applications en Vedette',
    'discover': 'Découvrez les Applications IA',
    'categories': 'Parcourir par Catégorie',
    'collections': 'Collections Sélectionnées',
    'sign_in': 'Se Connecter',
    'sign_up': 'S\'inscrire',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'developer': 'Développeur',
    'consumer': 'Consommateur',
    'admin': 'Administrateur',
    'search': 'Rechercher',
    'followers': 'abonnés',
    'following': 'abonnements',
    'submit_app': 'Soumettre une Application',
    'manage_apps': 'Gérer les Applications',
    'analytics': 'Analytiques',
    'revenue': 'Revenus',
    'logout': 'Déconnexion',
    'ai_tools': 'Outils IA',
  },
  de: {
    'welcome': 'Willkommen bei Vibe Store',
    'featured_apps': 'Ausgewählte Anwendungen',
    'discover': 'Entdecke KI-Anwendungen',
    'categories': 'Nach Kategorie durchsuchen',
    'collections': 'Kuratierte Sammlungen',
    'sign_in': 'Anmelden',
    'sign_up': 'Registrieren',
    'profile': 'Profil',
    'settings': 'Einstellungen',
    'developer': 'Entwickler',
    'consumer': 'Verbraucher',
    'admin': 'Administrator',
    'search': 'Suchen',
    'followers': 'Follower',
    'following': 'Folgt',
    'submit_app': 'Anwendung einreichen',
    'manage_apps': 'Anwendungen verwalten',
    'analytics': 'Analysen',
    'revenue': 'Einnahmen',
    'logout': 'Abmelden',
    'ai_tools': 'KI-Werkzeuge',
  },
  ja: {
    'welcome': 'Vibe Storeへようこそ',
    'featured_apps': '注目のアプリ',
    'discover': 'AIアプリを発見する',
    'categories': 'カテゴリーで閲覧',
    'collections': 'キュレーションされたコレクション',
    'sign_in': 'サインイン',
    'sign_up': '登録',
    'profile': 'プロフィール',
    'settings': '設定',
    'developer': '開発者',
    'consumer': '消費者',
    'admin': '管理者',
    'search': '検索',
    'followers': 'フォロワー',
    'following': 'フォロー中',
    'submit_app': 'アプリを提出',
    'manage_apps': 'アプリを管理',
    'analytics': '分析',
    'revenue': '収益',
    'logout': 'サインアウト',
    'ai_tools': 'AIツール',
  },
  zh: {
    'welcome': '欢迎来到Vibe Store',
    'featured_apps': '精选应用',
    'discover': '发现AI应用',
    'categories': '按类别浏览',
    'collections': '精心策划的集合',
    'sign_in': '登录',
    'sign_up': '注册',
    'profile': '个人资料',
    'settings': '设置',
    'developer': '开发者',
    'consumer': '消费者',
    'admin': '管理员',
    'search': '搜索',
    'followers': '粉丝',
    'following': '关注',
    'submit_app': '提交应用',
    'manage_apps': '管理应用',
    'analytics': '分析',
    'revenue': '收入',
    'logout': '退出登录',
    'ai_tools': 'AI工具',
  },
};

// Provider component
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or URL params or default to 'en'
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    return langParam || savedLanguage || 'en';
  });

  // Function to translate a key
  const t = (key: string): string => {
    if (!translations[language]) {
      return key;
    }
    return translations[language][key] || translations['en'][key] || key;
  };

  // Update document language attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook to use translations
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};