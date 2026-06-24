# PPM Frontend - Project Management System Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Folder Structure](#folder-structure)
5. [Core Modules](#core-modules)
6. [Authentication & Authorization](#authentication--authorization)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Routing & Navigation](#routing--navigation)
10. [UI Components](#ui-components)
11. [Development Setup](#development-setup)
12. [Key Features](#key-features)
13. [File Organization](#file-organization)

## Project Overview

**PPM Frontend** is a comprehensive project management system built with Next.js 15 and React 18. It's designed to handle various aspects of project management including:

- **Project Management**: Create, manage, and track projects within workspaces
- **Sprint Management**: Organize work into sprints with groups and tasks
- **Task Management**: Comprehensive task tracking with groups, subtasks, and updates
- **Bug Queue Management**: Track and manage bugs with priority levels
- **Workspace Management**: Multi-workspace support for different organizations
- **User Management**: Role-based access control and team collaboration
- **Dashboard & Analytics**: Overview and recent activity tracking

The application follows a modern React architecture with TypeScript, Material-UI, and TanStack Query for state management.

## Technology Stack

### Core Technologies

- **Next.js 15.1.2** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.5.4** - Type safety and development experience
- **Material-UI 6.2.1** - Component library and theming
- **Tailwind CSS 3.4.17** - Utility-first CSS framework

### State Management & Data Fetching

- **TanStack Query 5.71.10** - Server state management
- **React Context API** - Client state management
- **Axios 1.7.9** - HTTP client

### Form Handling & Validation

- **React Hook Form 7.54.2** - Form management
- **Zod 3.24.1** - Schema validation

### UI & UX

- **React Hot Toast 2.5.1** - Notifications
- **React Perfect Scrollbar 1.5.8** - Custom scrollbars
- **React Datepicker 7.5.0** - Date selection
- **SunEditor React 3.6.1** - Rich text editor
- **React Colorful 5.6.1** - Color picker

### Development Tools

- **ESLint 8.57.1** - Code linting
- **Prettier 3.4.2** - Code formatting
- **Iconify 5.2.0** - Icon management

## Project Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   API Routes    │    │   Backend API   │
│   (Frontend)    │◄──►│   (Middleware)  │◄──►│   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   React Query   │    │   Auth Context  │
│   (Cache)       │    │   (State)       │
└─────────────────┘    └─────────────────┘
```

### Application Flow

1. **Authentication**: JWT-based auth with middleware protection
2. **Workspace Selection**: Multi-workspace support with context
3. **Module Navigation**: Role-based access to different modules
4. **Data Fetching**: TanStack Query for server state management
5. **Real-time Updates**: Context providers for state synchronization

## Folder Structure

### Root Level

```
PPMFrontEnd/
├── public/                 # Static assets
├── src/                    # Source code
├── package.json           # Dependencies and scripts
├── next.config.mjs        # Next.js configuration
├── middleware.ts          # Route protection middleware
└── declarations.d.ts      # TypeScript declarations
```

### Source Code Structure (`src/`)

#### Core Framework (`@core/`)

```
@core/
├── components/            # Reusable UI components
│   ├── custom-inputs/     # Custom form inputs
│   ├── customizer/        # Theme customization
│   ├── mui/              # Material-UI overrides
│   ├── option-menu/      # Dropdown menus
│   └── scroll-to-top/    # Scroll functionality
├── contexts/             # Global contexts
├── hooks/                # Custom React hooks
├── styles/               # Global styles and themes
├── svg/                  # SVG icons and components
├── tailwind/             # Tailwind CSS configuration
├── theme/                # Material-UI theme configuration
├── types.ts              # Core type definitions
└── utils/                # Utility functions
```

#### Layout System (`@layouts/`)

```
@layouts/
├── BlankLayout.tsx       # Layout for auth pages
├── LayoutWrapper.tsx     # Main layout wrapper
├── VerticalLayout.tsx    # Vertical navigation layout
├── components/           # Layout-specific components
├── styles/               # Layout styling
└── utils/                # Layout utilities
```

#### Navigation (`@menu/`)

```
@menu/
├── components/           # Menu components
├── contexts/             # Navigation contexts
├── hooks/                # Navigation hooks
├── styles/               # Menu styling
├── svg/                  # Menu icons
├── types.ts              # Menu type definitions
├── utils/                # Menu utilities
└── vertical-menu/        # Vertical menu implementation
```

#### Application Pages (`app/`)

```
app/
├── (blank-layout-pages)/ # Authentication pages
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── verify-email/
├── (dashboard)/          # Protected dashboard pages
│   ├── dashboard/
│   ├── profile/
│   ├── project/
│   └── workspace/
├── (invitation)/         # Invitation handling
├── api/                  # API routes
│   ├── auth endpoints
│   ├── cookie management
│   └── token verification
├── globals.css           # Global styles
└── layout.tsx            # Root layout
```

#### Business Logic (`views/`)

```
views/
├── auth/                 # Authentication views
├── bug-queue/            # Bug management
├── dashboard/            # Dashboard views
├── invite/               # Invitation handling
├── profile/              # User profile management
├── project/              # Project management
├── recent-activities/    # Activity tracking
├── sidebar/              # Sidebar components
└── sprint-management/    # Sprint management
```

#### Services (`services/`)

```
services/
├── auth/                 # Authentication services
├── locale.ts             # Internationalization
└── modules/              # Business module services
    ├── bug-queue/        # Bug management API
    ├── project/          # Project management API
    ├── sprint-*/         # Sprint-related APIs
    ├── task-*/           # Task management APIs
    ├── workspace/        # Workspace management API
    └── profile/          # User profile API
```

#### State Management (`context/`)

```
context/
├── auth-context.tsx      # Authentication state
├── bug-queue-context.tsx # Bug queue state
├── project-context.tsx   # Project state
├── sprint-context.tsx    # Sprint state
├── task-context.tsx      # Task state
└── workspace-context.tsx # Workspace state
```

## Core Modules

### 1. Authentication Module

**Purpose**: Handles user authentication, registration, and session management

**Key Features**:

- JWT-based authentication
- Role-based access control
- Session persistence with cookies
- Password reset functionality
- Email verification

**Files**:

- `src/context/auth-context.tsx` - Authentication state management
- `src/services/auth/` - Authentication API services
- `src/views/auth/` - Authentication UI components
- `src/app/api/auth/` - Authentication API routes

### 2. Workspace Management

**Purpose**: Multi-workspace support for different organizations

**Key Features**:

- Create and manage workspaces
- Workspace switching
- Organization-based isolation
- Member management

**Files**:

- `src/context/workspace-context.tsx` - Workspace state
- `src/services/modules/workspace/` - Workspace API
- `src/views/sidebar/create-workspace-dialog.tsx` - Workspace creation

### 3. Project Management

**Purpose**: Core project creation and management functionality

**Key Features**:

- Project creation and configuration
- Project member management
- Project status and priority tracking
- Project filtering and search

**Files**:

- `src/context/project-context.tsx` - Project state
- `src/services/modules/project/` - Project API
- `src/views/project/` - Project management UI
- `src/services/modules/project-status/` - Status management
- `src/services/modules/project-priority/` - Priority management

### 4. Task Management

**Purpose**: Comprehensive task tracking and management

**Key Features**:

- Task creation and assignment
- Task grouping and organization
- Subtask management
- Task status tracking
- File attachments
- Task updates and comments

**Files**:

- `src/context/task-context.tsx` - Task state
- `src/services/modules/task/` - Task API
- `src/services/modules/task-group/` - Task grouping
- `src/services/modules/sub-task/` - Subtask management
- `src/services/modules/task-updates/` - Task updates
- `src/views/project/task-group/` - Task UI components

### 5. Sprint Management

**Purpose**: Agile sprint planning and execution

**Key Features**:

- Sprint creation and planning
- Sprint groups and organization
- Sprint task assignment
- Sprint progress tracking
- Sprint workspace management

**Files**:

- `src/context/sprint-context.tsx` - Sprint state
- `src/services/modules/sprint-*/` - Sprint APIs
- `src/views/sprint-management/` - Sprint UI
- `src/services/modules/sprint-workspace/` - Sprint workspace
- `src/services/modules/sprint-group/` - Sprint grouping
- `src/services/modules/sprint-tasks/` - Sprint task management

### 6. Bug Queue Management

**Purpose**: Bug tracking and issue management

**Key Features**:

- Bug creation and categorization
- Priority-based bug management
- Bug status tracking
- Bug filtering and search
- Bug assignment and resolution

**Files**:

- `src/context/bug-queue-context.tsx` - Bug queue state
- `src/services/modules/bug-queue/` - Bug queue API
- `src/views/bug-queue/` - Bug queue UI
- `src/views/bug-queue/bugs/` - Bug management components

### 7. Dashboard & Analytics

**Purpose**: Overview and activity tracking

**Key Features**:

- Project overview dashboard
- Recent activity tracking
- Workspace statistics
- Quick access to key features

**Files**:

- `src/views/dashboard/` - Dashboard components
- `src/views/recent-activities/` - Activity tracking
- `src/services/modules/recent-activity/` - Activity API

## Authentication & Authorization

### Authentication Flow

1. **Login**: User provides credentials via `/login`
2. **Token Generation**: Backend returns JWT token
3. **Cookie Storage**: Token stored in HTTP-only cookies
4. **Middleware Protection**: All protected routes check for valid token
5. **Token Verification**: Periodic token validation via `/api/verify-token`

### Route Protection

```typescript
// Protected routes require authentication
PROTECTED_ROUTES = ['/dashboard', '/recent-activity', '/bug-queue', '/project', '/profile', '/workspace']

// Auth routes redirect if already authenticated
AUTH_ROUTES = ['/login', '/forgot-password']

// Public routes accessible without authentication
PUBLIC_ROUTES = ['/invite', '/404']
```

### Role-Based Access Control

- **Project Roles**: Different permissions within projects
- **Workspace Roles**: Organization-level permissions
- **Feature Access**: Role-based feature visibility

## State Management

### Client State (React Context)

- **AuthContext**: User authentication and session
- **WorkspaceContext**: Current workspace and workspace list
- **ProjectContext**: Current project and project data
- **SprintContext**: Sprint management state
- **TaskContext**: Task management state
- **BugQueueContext**: Bug queue state

### Server State (TanStack Query)

- **Data Fetching**: API calls and caching
- **Background Updates**: Automatic data synchronization
- **Optimistic Updates**: UI updates before server confirmation
- **Error Handling**: Centralized error management

### State Flow

```
User Action → Context Update → API Call → Query Cache → UI Update
```

## API Integration

### API Structure

```
services/
├── auth/                  # Authentication endpoints
├── modules/               # Business logic endpoints
│   ├── project/          # Project CRUD operations
│   ├── task/             # Task management
│   ├── sprint-*/         # Sprint operations
│   ├── bug-queue/        # Bug management
│   └── workspace/        # Workspace operations
└── utils/
    └── api-utils.ts      # Common API utilities
```

### API Patterns

- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Error Handling**: Consistent error response format
- **Type Safety**: TypeScript interfaces for all API responses
- **Caching**: TanStack Query for intelligent caching

### API Utilities

```typescript
// Common API call function
const callApi = ({ uriEndPoint, body, query, pathParams }) => {
  // Handles authentication, error handling, and response formatting
}
```

## Routing & Navigation

### App Router Structure

```
app/
├── (blank-layout-pages)/  # Authentication pages
├── (dashboard)/           # Protected dashboard pages
├── (invitation)/          # Invitation handling
└── api/                   # API routes
```

### Dynamic Routes

- `/project/[id]` - Project-specific pages
- `/workspace/[id]` - Workspace-specific pages
- `/workspace/[id]/sprints` - Sprint management
- `/workspace/[id]/sprint-tasks` - Sprint task management
- `/workspace/[id]/bug-queue` - Bug queue management

### Navigation Components

- **Vertical Menu**: Main navigation sidebar
- **Breadcrumbs**: Page hierarchy navigation
- **Quick Actions**: Context-sensitive action buttons

## UI Components

### Component Hierarchy

```
@core/components/          # Base components
├── custom-inputs/         # Form inputs
├── mui/                   # Material-UI overrides
├── option-menu/           # Dropdowns and menus
└── scroll-to-top/         # Utility components

components/                # Application components
├── button/                # Custom buttons
├── dialog/                # Modal dialogs
├── input/                 # Form inputs
├── layout/                # Layout components
├── spinner/               # Loading indicators
├── stepper-dot/           # Progress indicators
└── ui/                    # UI utilities
```

### Design System

- **Material-UI**: Primary component library
- **Tailwind CSS**: Utility-first styling
- **Custom Theme**: Brand-specific theming
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching support

### Key Components

- **CustomButton**: Consistent button styling
- **FallbackSpinner**: Loading states
- **DeleteDialog**: Confirmation dialogs
- **ProjectFilterButton**: Advanced filtering
- **InviteMemberDialog**: Team member management

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PPMFrontEnd

# Install dependencies
pnpm install

# Build icons (post-install script)
pnpm run build:icons

# Start development server
pnpm dev
```

### Available Scripts

```json
{
  "dev": "next dev",           # Development server
  "build": "next build",       # Production build
  "start": "next start",       # Production server
  "lint": "next lint",         # Code linting
  "lint:fix": "next lint --fix", # Auto-fix linting issues
  "format": "prettier --write", # Code formatting
  "build:icons": "tsx src/assets/iconify-icons/bundle-icons-css.ts" # Icon building
}
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=your-api-url
BASEPATH=/optional-base-path

# Authentication
JWT_SECRET=your-jwt-secret
```

## Key Features

### 1. Multi-Workspace Support

- Create and manage multiple workspaces
- Switch between workspaces seamlessly
- Organization-based data isolation

### 2. Project Management

- Create projects within workspaces
- Assign team members with roles
- Track project status and priority
- Project filtering and search

### 3. Task Management

- Create tasks with detailed information
- Organize tasks into groups
- Add subtasks and dependencies
- Track task progress and updates
- File attachments and comments

### 4. Sprint Management

- Create and manage sprints
- Organize sprint tasks into groups
- Track sprint progress
- Sprint planning and execution

### 5. Bug Queue Management

- Create and categorize bugs
- Priority-based bug management
- Bug assignment and resolution
- Bug filtering and search

### 6. User Management

- User registration and authentication
- Role-based access control
- Team member invitations
- Profile management

### 7. Real-time Updates

- Live data synchronization
- Optimistic UI updates
- Background data refresh
- Error handling and retry logic

## File Organization

### Naming Conventions

- **Components**: PascalCase (e.g., `ProjectCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services**: camelCase (e.g., `projectService.ts`)
- **Types**: PascalCase with descriptive names (e.g., `ProjectData.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Import Organization

```typescript
// 1. React and Next.js imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'
import { Box, Typography } from '@mui/material'

// 3. Internal imports (absolute paths)
import { useAuth } from '@/hooks/useAuth'
import { ProjectCard } from '@/components/ProjectCard'

// 4. Relative imports
import './styles.css'
```

### Code Structure Guidelines

- **Single Responsibility**: Each component/function has one clear purpose
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized rendering and data fetching
- **Accessibility**: WCAG compliance and keyboard navigation

## Conclusion

This PPM Frontend project is a comprehensive project management system built with modern React technologies. It provides a robust foundation for managing projects, tasks, sprints, and bugs in a multi-workspace environment. The architecture follows best practices for scalability, maintainability, and user experience.

The modular design allows for easy extension and modification, while the comprehensive state management ensures data consistency across the application. The use of TypeScript provides type safety and better development experience, while the Material-UI and Tailwind CSS combination offers a flexible and consistent design system.

For developers joining the project, this documentation should provide a solid understanding of the codebase structure, key concepts, and development patterns used throughout the application.
