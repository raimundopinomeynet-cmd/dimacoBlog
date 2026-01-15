# CLAUDE.md - AI Assistant Guide for dimacoBlog

This document provides comprehensive guidance for AI assistants working on the dimacoBlog project. It covers codebase structure, development workflows, and key conventions to follow.

## Project Overview

**Project Name:** dimacoBlog
**Type:** Blog/Content Management System
**Status:** Early Development
**Repository:** raimundopinomeynet-cmd/dimacoBlog

### Purpose
This project is a blog platform designed for content creation, management, and publication.

## Codebase Structure

> **Note:** This section will be updated as the project structure evolves.

### Recommended Directory Structure

```
dimacoBlog/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components/routes
│   ├── api/               # API routes and handlers
│   ├── lib/               # Utility functions and libraries
│   ├── hooks/             # Custom React hooks (if React-based)
│   ├── styles/            # CSS/styling files
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── content/               # Blog posts and content
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── config/               # Configuration files
├── scripts/              # Build and utility scripts
└── docs/                 # Documentation

```

### Key Files
- **Configuration Files:** Look for `package.json`, `tsconfig.json`, `next.config.js`, etc.
- **Environment Variables:** `.env`, `.env.local`, `.env.example`
- **Documentation:** `README.md`, `CONTRIBUTING.md`, this file
- **CI/CD:** `.github/workflows/`, `.gitlab-ci.yml`, etc.

## Technology Stack

> **To be determined as project develops**

### Expected Technologies (Common for blog platforms)
- **Frontend Framework:** React, Next.js, Gatsby, Astro, or similar
- **Styling:** CSS Modules, Tailwind CSS, Styled Components, or SCSS
- **Content Management:** Markdown, MDX, or Headless CMS
- **Backend:** Node.js, Express, or serverless functions
- **Database:** PostgreSQL, MongoDB, or file-based storage
- **Authentication:** NextAuth, Auth0, or similar
- **Deployment:** Vercel, Netlify, AWS, or similar

## Development Workflow

### Branch Strategy

- **Main Branch:** `main` or `master` (production-ready code)
- **Feature Branches:** `feature/description` or `feat/description`
- **Bug Fix Branches:** `fix/description` or `bugfix/description`
- **Claude Branches:** `claude/claude-md-mkfslpvds9w90np0-r6BE7` (AI-generated work)

### Git Workflow

1. **Branching:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Committing:**
   - Write clear, descriptive commit messages
   - Use conventional commits format: `type(scope): description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat(blog): add markdown rendering support`

3. **Pushing:**
   ```bash
   git push -u origin branch-name
   ```

4. **Pull Requests:**
   - Provide clear descriptions
   - Reference related issues
   - Include test plans
   - Request reviews when appropriate

### Testing Strategy

- **Unit Tests:** Test individual functions and components
- **Integration Tests:** Test component interactions
- **E2E Tests:** Test complete user workflows
- **Coverage Goals:** Aim for >80% code coverage on critical paths

### Code Quality

- **Linting:** Run linters before committing
- **Formatting:** Use consistent code formatting (Prettier, ESLint)
- **Type Safety:** Leverage TypeScript for type checking
- **Pre-commit Hooks:** Husky, lint-staged for automated checks

## Coding Conventions

### General Principles

1. **Keep It Simple:** Avoid over-engineering
2. **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions
3. **YAGNI (You Aren't Gonna Need It):** Don't add features speculatively
4. **Separation of Concerns:** Keep business logic separate from UI
5. **Consistent Naming:** Use clear, descriptive names

### Naming Conventions

- **Files:**
  - Components: `PascalCase.tsx` (e.g., `BlogPost.tsx`)
  - Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
  - Constants: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)
  - Types: `PascalCase.types.ts` or `types.ts`

- **Variables/Functions:**
  - Variables: `camelCase` (e.g., `postTitle`, `authorName`)
  - Functions: `camelCase` with verb prefix (e.g., `getPost`, `formatDate`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_POST_LENGTH`)
  - Boolean variables: Use `is`, `has`, `can` prefix (e.g., `isPublished`)

- **Components:**
  - React Components: `PascalCase` (e.g., `BlogPost`, `CommentSection`)
  - Props interfaces: `ComponentNameProps` (e.g., `BlogPostProps`)

### Code Style

```typescript
// ✅ Good: Clear function with type safety
interface Post {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
}

async function getPostById(id: string): Promise<Post | null> {
  try {
    const post = await db.posts.findById(id);
    return post;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
}

// ❌ Bad: Unclear, no types, poor error handling
async function get(x) {
  return await db.posts.findById(x);
}
```

### Comments

- **When to Comment:**
  - Complex algorithms or business logic
  - Non-obvious workarounds or hacks
  - API documentation (JSDoc)
  - TODOs with context

- **When NOT to Comment:**
  - Obvious code that's self-explanatory
  - Redundant descriptions of what code does
  - Outdated comments (remove them!)

```typescript
// ✅ Good: Explains WHY
// Using a delay here because the external API rate-limits to 10 req/sec
await delay(100);

// ❌ Bad: Explains WHAT (already obvious)
// Increment counter by 1
counter++;
```

### Error Handling

- **User-facing errors:** Provide helpful, actionable messages
- **Internal errors:** Log with context for debugging
- **Validation:** Validate at boundaries (API endpoints, user input)
- **Graceful degradation:** Handle failures without breaking the entire app

```typescript
// ✅ Good: Specific error handling
try {
  const post = await publishPost(postId);
  return { success: true, post };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: 'Invalid post data' };
  }
  if (error instanceof AuthError) {
    return { success: false, error: 'Unauthorized' };
  }
  // Log unexpected errors
  console.error('Unexpected error publishing post:', error);
  return { success: false, error: 'Failed to publish post' };
}
```

## AI Assistant Guidelines

### Do's ✅

1. **Read Before Modifying:**
   - Always read existing files before suggesting changes
   - Understand the current implementation and patterns
   - Check for similar existing solutions

2. **Follow Existing Patterns:**
   - Match the existing code style and structure
   - Use established conventions in the codebase
   - Don't introduce new patterns without good reason

3. **Be Thorough:**
   - Consider edge cases
   - Add appropriate error handling
   - Update tests when modifying functionality
   - Update documentation when changing behavior

4. **Security First:**
   - Validate user input
   - Sanitize data before rendering
   - Avoid SQL injection, XSS, CSRF vulnerabilities
   - Use secure authentication practices
   - Don't commit secrets or credentials

5. **Ask When Uncertain:**
   - Clarify requirements before implementing
   - Present options for architectural decisions
   - Confirm breaking changes before proceeding

6. **Use Todo Tracking:**
   - Use TodoWrite for multi-step tasks
   - Keep todos updated as you progress
   - Mark tasks complete immediately after finishing

### Don'ts ❌

1. **Don't Over-Engineer:**
   - No premature optimization
   - No unnecessary abstractions
   - No speculative features
   - Keep solutions simple and focused

2. **Don't Make Unrelated Changes:**
   - Stay focused on the requested task
   - Don't refactor unrelated code
   - Don't add unrequested features
   - Don't reformat unmodified code

3. **Don't Skip Testing:**
   - Don't assume code works without verification
   - Don't skip running tests
   - Don't ignore failing tests
   - Don't commit broken code

4. **Don't Guess:**
   - Don't assume project structure
   - Don't guess API endpoints or schemas
   - Don't make up configuration values
   - Ask for clarification instead

5. **Don't Commit Directly to Main:**
   - Always work on feature branches
   - Never force push to protected branches
   - Follow the established git workflow

## Blog-Specific Conventions

### Content Management

- **Post Format:** Markdown (.md) or MDX (.mdx)
- **Frontmatter:** Metadata at the top of posts
  ```yaml
  ---
  title: "Post Title"
  date: "2026-01-15"
  author: "Author Name"
  tags: ["tag1", "tag2"]
  description: "Brief description"
  published: true
  ---
  ```

- **Content Location:** `/content/posts/` or `/posts/`
- **Images:** Store in `/public/images/` or CDN
- **Drafts:** Use `published: false` in frontmatter

### SEO Considerations

- **Meta Tags:** Always include title, description, and OG tags
- **Semantic HTML:** Use proper heading hierarchy (h1, h2, h3)
- **Alt Text:** All images must have descriptive alt text
- **URLs:** Use slug-based URLs, lowercase with hyphens
- **Sitemap:** Auto-generate from published posts
- **RSS Feed:** Provide RSS/Atom feed for subscribers

### Performance

- **Image Optimization:** Use next/image or similar
- **Code Splitting:** Lazy load non-critical components
- **Caching:** Cache static content aggressively
- **Build Time:** Pre-render static pages where possible
- **Bundle Size:** Monitor and minimize JavaScript bundle

### Accessibility

- **Keyboard Navigation:** All interactive elements must be keyboard accessible
- **ARIA Labels:** Use appropriate ARIA attributes
- **Color Contrast:** Meet WCAG AA standards
- **Screen Readers:** Test with screen reader software
- **Focus Management:** Clear focus indicators

## Environment Setup

### Prerequisites

> To be updated when technology stack is finalized

Likely requirements:
- Node.js (LTS version)
- npm/yarn/pnpm
- Git
- Code editor (VS Code recommended)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd dimacoBlog

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

Document all required environment variables:
- `DATABASE_URL`: Database connection string
- `API_KEY`: External API keys
- `AUTH_SECRET`: Authentication secret
- `NEXT_PUBLIC_*`: Client-side variables

## Common Tasks

### Adding a New Blog Post

```bash
# Create new post file
touch content/posts/new-post-title.md

# Add frontmatter and content
# Preview locally
npm run dev

# Commit and deploy
git add content/posts/new-post-title.md
git commit -m "feat(content): add new blog post about X"
git push
```

### Adding a New Component

```typescript
// 1. Create component file: src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  content: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, content }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
};

// 2. Create test file: src/components/NewComponent.test.tsx
// 3. Add to exports if needed
// 4. Use in parent component
```

### Debugging

1. **Check Logs:** Application logs for errors
2. **Browser DevTools:** Network, console, React DevTools
3. **Breakpoints:** Use debugger statements
4. **Tests:** Write failing tests to reproduce bugs
5. **Git Bisect:** Find when bugs were introduced

## Resources

### Documentation
- Project README: `README.md`
- API Documentation: `/docs/api.md` (when available)
- Architecture Decisions: `/docs/adr/` (when available)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs) (if using Next.js)
- [React Documentation](https://react.dev) (if using React)
- [MDN Web Docs](https://developer.mozilla.org)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Troubleshooting

### Common Issues

**Issue: Dependencies not installing**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: Port already in use**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
# Or use a different port
PORT=3001 npm run dev
```

**Issue: Build failures**
```bash
# Clear build cache
rm -rf .next
npm run build
```

## Changelog

This file tracks the evolution of the project and should be updated as major changes occur.

### 2026-01-15
- Initial CLAUDE.md created
- Established project structure guidelines
- Defined development workflows and conventions
- Set up AI assistant guidelines

---

## Notes for AI Assistants

When working on this project:

1. **First-time setup:** Read this entire document before starting work
2. **Before each task:** Review relevant sections of this guide
3. **When uncertain:** Refer to existing code patterns or ask for clarification
4. **After implementation:** Update this document if you discover new patterns or conventions
5. **Keep it updated:** This is a living document - improve it as the project evolves

**Remember:** The goal is to maintain consistency, quality, and maintainability across the entire codebase. When in doubt, favor simplicity and clarity over cleverness.

---

*Last updated: 2026-01-15*
*Document version: 1.0.0*
