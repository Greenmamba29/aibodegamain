# Vibe Store - AI Indie App Marketplace

Vibe Store is a marketplace for AI-powered applications, allowing developers to share and monetize their AI creations while providing users with a curated selection of high-quality AI tools.

## Features

- **App Discovery**: Browse and search for AI applications across multiple categories
- **Developer Portal**: Submit and manage your AI applications
- **User Profiles**: Follow developers and track your favorite apps
- **Payment Integration**: Monetize your apps with Stripe integration
- **Real-time Updates**: Get notifications for new followers, reviews, and more
- **AI Tools**: Built-in AI tools powered by LINGO.dev

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: Zustand
- **Payments**: Stripe
- **AI Compiler**: LINGO.dev

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your API keys
4. Start the development server: `npm run dev`

## LINGO.dev Integration

This project uses LINGO.dev as a TypeScript-first AI compiler to provide AI capabilities:

- Text analysis and sentiment detection
- Content summarization
- Language translation
- Content moderation

### Using LINGO.dev

1. Define AI functions in `src/lingo.ts`
2. Import and use these functions in your React components
3. Run the LINGO compiler: `npm run lingo`

## Development

- **Development Mode**: `npm run dev`
- **Type Checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Run LINGO Compiler**: `npm run lingo`

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `dist` directory to your hosting provider

## License

MIT