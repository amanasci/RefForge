# RefForge - Reference Manager

RefForge is a modern desktop reference manager built with Next.js and Tauri, designed to help researchers organize, manage, and cite their research materials. The application combines a React-based frontend with a Rust backend and SQLite database for local storage.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test
Run these commands in sequence to set up a working development environment:

```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf build-essential

# Install Node.js dependencies
npm install  # Takes ~15-30 seconds

# Type check the codebase
npm run typecheck  # Takes ~2-3 seconds

# Lint the codebase  
npm run lint  # Takes ~2-3 seconds

# Build the Next.js frontend
npm run build  # Takes ~15-20 seconds

# Build the complete Tauri application  
npm run tauri build  # Takes ~5-6 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
```

### Development Servers
Choose the appropriate development mode:

**Frontend-only development (when working on UI/components):**
```bash
npm run dev  # Starts Next.js on http://localhost:9002
```

**Full application development (when working with database/Tauri features):**
```bash
npm run tauri dev  # Takes ~2 minutes first compile, then quick. NEVER CANCEL. Set timeout to 5+ minutes for first run.
```

**IMPORTANT:** `npm run tauri dev` will fail in headless environments (CI/remote servers) because it requires a GUI display. Use `npm run dev` for frontend development in such environments.

## Validation

### Manual Testing Scenarios
Always validate functionality by running through these complete user scenarios after making changes:

**Core Reference Management Workflow:**
1. Start the application: `npm run tauri dev` (or `npm run dev` for frontend-only)
2. Create a new project: Click "+ Projects" → Enter name and select color → Save
3. Add a reference manually: Click "Add Reference" → Fill in title, authors, year, abstract, tags → Select project → Save
4. Import from ArXiv: Click "Add Reference" → Enter ArXiv DOI in DOI field → Click fetch → Verify metadata is populated → Save
5. Test search: Enter terms in search bar → Verify filtering works
6. Test filtering: Use sidebar tags, priority filters, project filters → Verify results update
7. Edit reference: Click reference → Edit → Modify fields → Save → Verify changes persist
8. Delete reference: Click reference → Delete → Confirm deletion

**Critical Validation Steps:**
- **Database persistence**: After adding references, restart the app and verify data is retained
- **Project organization**: Switch between projects and verify references are properly filtered
- **Tag system**: Add tags to references and verify tag filtering works in sidebar
- **Priority system**: Set different priority levels and verify priority filtering
- **Search functionality**: Test search across titles, authors, and abstracts

### Pre-commit Validation
Always run these commands before committing changes:
```bash
npm run typecheck  # Must pass with no errors
npm run lint       # Must pass with minimal warnings (font warning is acceptable)
npm run build      # Must complete successfully
```

## Common Tasks

### Repository Structure
```
RefForge/
├── src/                          # Next.js frontend source
│   ├── app/                      # Next.js app router (main application logic)
│   │   ├── globals.css          # Global styles and CSS variables
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Main application component
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components (shadcn/ui)
│   │   ├── app-sidebar.tsx      # Application sidebar component
│   │   ├── reference-list.tsx   # Reference display components
│   │   └── add-reference-dialog.tsx  # Reference creation/editing
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-tauri-storage.ts # **CRITICAL**: Database operations hook
│   │   └── use-filtered-references.ts  # Reference filtering logic
│   ├── lib/                     # Utility functions
│   │   └── utils.ts            # Tailwind utility functions
│   └── types/                   # TypeScript type definitions
│       └── index.ts            # Main type definitions for Reference, Project
├── src-tauri/                   # Rust backend
│   ├── src/main.rs             # Main Tauri application entry point
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── package.json                 # Node.js dependencies and scripts
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

### Key Development Files
When making changes, you'll frequently work with:

- **`src/hooks/use-tauri-storage.ts`**: Database operations, reference/project CRUD
- **`src/app/page.tsx`**: Main application logic and state management  
- **`src/components/add-reference-dialog.tsx`**: Reference creation/editing forms
- **`src/components/app-sidebar.tsx`**: Project navigation and filtering
- **`src/types/index.ts`**: Type definitions for Reference and Project interfaces
- **`src-tauri/src/main.rs`**: SQLite database schema and migrations

### Database Schema
The application uses SQLite with two main tables:

```sql
-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

-- References table  
CREATE TABLE references (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,        -- JSON array of strings
    year INTEGER NOT NULL,
    journal TEXT,
    doi TEXT,
    abstract TEXT NOT NULL,
    tags TEXT NOT NULL,           -- JSON array of strings  
    priority INTEGER NOT NULL DEFAULT 0,  -- 0-5 priority scale
    project_id TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Finished',
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### Common Commands Reference
```bash
# Development
npm run dev              # Next.js dev server (frontend only)
npm run tauri dev        # Full Tauri dev environment (requires GUI)

# Building  
npm run build            # Build Next.js frontend (~15-20 seconds)
npm run tauri build      # Build complete desktop app (~5-6 minutes, NEVER CANCEL)

# Code Quality
npm run lint             # ESLint linting (~2-3 seconds)
npm run typecheck        # TypeScript type checking (~2-3 seconds)

# Dependencies
npm install              # Install all dependencies (~15-30 seconds)
```

### Build Time Expectations
- **NEVER CANCEL**: Build operations may take significant time, especially initial Rust compilation
- `npm install`: ~15-30 seconds
- `npm run build`: ~15-20 seconds  
- `npm run tauri build`: ~5-6 minutes (NEVER CANCEL - set timeout to 10+ minutes)
- `npm run tauri dev`: ~2 minutes first compile, quick subsequent runs (NEVER CANCEL - set timeout to 5+ minutes for first run)
- `npm run lint`: ~2-3 seconds
- `npm run typecheck`: ~2-3 seconds

### Troubleshooting

**"Failed to initialize GTK backend" when running `npm run tauri dev`:**
- Expected in headless environments (CI, remote servers)
- Use `npm run dev` for frontend-only development instead
- Desktop app requires a GUI display to run

**Build takes longer than expected:**
- Normal for Rust compilation, especially first time
- Subsequent builds are much faster due to caching
- NEVER cancel - let builds complete

**AppImage bundling fails during `npm run tauri build`:**
- Common in CI environments
- Other bundles (.deb, .rpm) usually succeed
- Main binary still builds successfully

**Database not persisting between restarts:**
- Check that SQLite file `refforge.db` is being created in the correct location
- Verify `use-tauri-storage.ts` hook is properly initializing the database
- Database is stored locally and persists across application restarts

### Working with the Codebase
- **UI Components**: Uses shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks with local component state, no external state library
- **Data Flow**: Database operations flow through `use-tauri-storage.ts` hook
- **Type Safety**: Strict TypeScript with defined interfaces for all data structures

Always check `src/hooks/use-tauri-storage.ts` after making changes to database schema or data operations.