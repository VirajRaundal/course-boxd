# CourseBoxd

Your launchpad for building and shipping high-quality learning experiences.

## Project Structure

This is a monorepo using npm workspaces:

- `apps/web` - Next.js 15+ web application
- `packages/*` - Shared packages (coming soon)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

## Available Scripts

### Root Scripts

- `npm run dev` - Start the Next.js dev server
- `npm run build` - Build the Next.js application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without making changes
- `npm run type-check` - Run TypeScript type checking

### Web App Scripts (from root)

- `npm run dev --workspace web`
- `npm run build --workspace web`
- `npm run start --workspace web`
- `npm run lint --workspace web`
- `npm run type-check --workspace web`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## Project Structure

```
course-boxd/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   └── app/      # App Router pages
│       ├── public/       # Static assets
│       └── package.json
├── packages/             # Shared packages (coming soon)
├── .husky/               # Git hooks
├── package.json          # Root package configuration
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env.local` in the `apps/web` directory and adjust the values as needed.

## Contributing

This project uses:

- **Prettier** for code formatting
- **ESLint** for code quality
- **Husky** for pre-commit hooks
- **lint-staged** for running checks on staged files

All code changes will be automatically formatted and linted before commit.

## License

Private repository - All rights reserved.
