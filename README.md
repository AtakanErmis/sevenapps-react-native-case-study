# SevenApps React Native Case Study

## Overview

This repository contains a case study for React Native developers applying to SevenApps. The project is a task/todo management application where candidates will demonstrate their ability to handle asynchronous operations and implement proper UI components.

## What's Provided

- **Database Schema** (`db/schema.ts`): Contains table definitions for tasks and lists
- **API Queries**:
  - `queries/tasks.ts`: Complete set of functions for task management (create, read, update, delete, search, filter)
  - `queries/lists.ts`: Complete set of functions for list management (create, read, update, delete, search)
- **Project Setup**: Expo-based React Native app with basic configuration

All API functions simulate network latency to emulate real-world scenarios, giving candidates the opportunity to implement proper loading states, error handling, and optimistic updates.

## Task Requirements

Candidates should build a functional task management application using the provided database schema and query functions. **You do not need to modify the files in `db/schema.ts`, `queries/tasks.ts`, or `queries/lists.ts`**. Instead, focus on:

1. Creating a clean, functional UI for managing tasks and lists
2. Implementing proper async call handling:
   - Loading states
   - Error handling
   - Data fetching and refreshing
   - Optimistic updates where appropriate
3. Creating a smooth user experience despite the simulated network delays

## Evaluation Criteria

We will primarily evaluate:

1. **Async Operation Handling**: How you manage loading states, errors, and data refreshing
2. **Code Organization**: Clean architecture and separation of concerns
3. **TypeScript Usage**: Proper typing and type safety
4. **Component Design**: Reusable and maintainable components

## Bonus Points

While not required, we appreciate candidates who demonstrate:

- **Data Validation**: Usage of Zod or similar validation libraries
- **Styling**: Effective use of NativeWind (provided in the project)
- **Data Fetching**: Implementation of TanStack Query (React Query) for data management
- **State Management**: Usage of a global state solution (Zustand is already provided)
- **Testing**: Addition of unit and/or integration tests
- **Error Handling**: Well-thought-out error management, fallbacks, and recovery
- **Optimistic Updates**: Implementation of optimistic UI updates for a smoother user experience

## UI Design

While impressive UI design is not the primary focus of this case study, a clean and functional interface is expected. We appreciate attention to detail and thoughtful user experience design, but the main evaluation will be on your code implementation and handling of asynchronous operations.

## Getting Started

```bash
# Install dependencies (use your preferred package manager)
npm install
# or
yarn install
# or
pnpm install

# Prebuild the app
npm run prebuild

# Generate the database schema (IMPORTANT: do this before starting development)
npm run generate-schema

```

Follow the Expo CLI instructions to run the app on your preferred platform (iOS, Android, or web).

## Important Note

**Before starting development, you MUST run the database schema generation command and prebuild the app** to set up the SQLite database structure and Expo Development Client properly:

```bash
npm run generate-schema
npm run prebuild
```
