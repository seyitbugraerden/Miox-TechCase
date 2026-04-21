# AI-Powered Claim Orchestrator

Mobile-first insurance claim dashboard built for the technical case study. The product goal is to reduce repetitive status-check calls by giving the user a clearer, more proactive self-service experience.

The interface is designed to answer the case's core questions quickly:

- What is my claim number and current stage?
- How much longer will this process take?
- Is there anything I need to do right now?

## Submission Summary

- Stack requested by the case is used: `React + TypeScript + Vite`, `TanStack React Query`, `Zod`, `Zustand`, `Tailwind CSS`, and `shadcn/ui`
- Mobile-first responsive experience is implemented
- Dynamic node insertion and removal is implemented
- Heterogeneous `processDetails` rendering is handled with a registry-driven pattern
- "Explain with AI" interaction is implemented
- Simulated AI document analyzer is implemented
- README includes design decisions, trade-offs, improvements, and AI tools used

## Case Compliance Matrix

| Case Requirement | Implementation |
| --- | --- |
| Show current status, claim number, ETA, and immediate action | Overview and Action Center surface these answers above the fold |
| Mobile-first responsive design | Desktop uses a persistent sidebar; mobile uses a lighter header and bottom navigation |
| Touch-friendly interactions | Primary actions, timeline controls, drawers, dialogs, and bottom nav are optimized for mobile tap targets |
| Dynamic insert/remove nodes | Users can add `Information Note` and `Additional Attachment` nodes between API steps and remove them later |
| Polymorphic handling of heterogeneous payload | Timeline rendering is registry-driven instead of relying on step-specific `if/else` branching |
| Explain with AI | Every step can open a contextual explanation dialog |
| AI document analyzer | Simulated pre-submission document validation flow checks file type, size, filename quality, and review context |
| React Query for data fetching | Claim payload is loaded through `useQuery` |
| Zod for API and form validation | Claim payload and form inputs are validated before use |
| Zustand for node and AI state | Inserted nodes, cached AI insights, and document analysis state are managed in Zustand |
| Tailwind + shadcn/ui | All UI is built with the requested styling/component approach |
| README with decisions and improvements | Included below |

## Product Walkthrough

### 1. Overview

The landing area prioritizes the most important claim answers:

- `Claim Number`
- `Current Status`
- `Estimated Remaining Time`
- `Immediate Action`

This is the part of the UI meant to satisfy the "under 3-second answer" expectation from the case.

### 2. Timeline

The claim timeline shows each process step with step-specific metadata. The payload contains different field shapes for different steps, so the UI first normalizes the payload and then renders it through a registry.

Users can:

- inspect detailed metadata for each step
- ask for an AI explanation
- insert a custom node after any API step
- remove user-created nodes later

### 3. Action Center

The Action Center keeps the current blocker visible and contains the simulated AI document analyzer.

The analyzer supports:

- selecting a document type
- uploading a file
- optionally adding reviewer context
- validating before submission
- clearing the current analysis and trying another file

### 4. Mobile Experience

The mobile layout is intentionally treated as an app-like experience instead of a compressed admin dashboard:

- lighter header treatment
- bottom navigation for thumb reach
- touch-friendly primary actions
- desktop sidebar preserved only for larger screens

## Why The Architecture Fits The Case

### Registry-driven rendering

The `processDetails` payload is heterogeneous by design. Instead of tightly coupling rendering logic to each step shape, the project uses a registry-based approach where each known step type defines:

- icon
- stage label
- metadata fields to show
- visual tone

This makes the interface easier to extend when new claim step types are introduced.

### Immutable API payload plus overlay state

The original payload remains untouched. User-created nodes are stored separately in Zustand and merged into the base timeline at render time.

This makes the behavior safer and easier to reason about because:

- server payload stays immutable
- temporary user state remains isolated
- removal of custom nodes is straightforward

### Validation before rendering

The claim payload is validated with Zod before the dashboard renders. Form inputs for node creation and analyzer actions are also validated.

This reduces the chance of unsafe UI assumptions and keeps the demo more robust during evaluation.

### Device-specific interaction model

Desktop and mobile share the same data and feature set, but not the same interaction pattern:

- desktop favors persistent overview and sidebar context
- mobile favors bottom navigation and shorter action paths

This was a deliberate product decision, not just a CSS breakpoint change.

## Simulated AI: Why This Was A Deliberate Choice

The case explicitly allows a simulated AI node for document validation, so the analyzer is intentionally implemented as a deterministic, explainable pre-submission checkpoint rather than a live model call.

This was chosen on purpose because it improves the review experience:

- it aligns with the case wording
- it behaves consistently during offline or local evaluation
- it avoids introducing network or API-key dependencies
- it makes validation outcomes reproducible for the reviewer
- it keeps the demo honest about what is simulated versus what is production-ready

Current analyzer checks include:

- supported file type
- file size limit
- filename quality for occupational certificate uploads
- review note/context quality

The "Explain with AI" flow is also positioned as a UX simulation layer rather than a production LLM backend.

## Project Structure

Reviewer-facing file map:

- `src/App.tsx`
  Main screen orchestration, navigation wiring, action center, analyzer flow, dialogs
- `src/data/claim-process.ts`
  Mock case-study payload
- `src/lib/api.ts`
  React Query data-fetching entry point
- `src/types/claim.ts`
  Zod schemas and shared claim types
- `src/stores/claim-store.ts`
  Zustand store for inserted nodes, AI insight cache, and analyzer state
- `src/lib/claim-utils.ts`
  Timeline normalization, merge logic, AI explanation builder, document analyzer logic
- `src/components/claim/constants.ts`
  Timeline step registry
- `src/components/claim/timeline-section.tsx`
  Main timeline rendering flow
- `src/components/claim/timeline-step-card.tsx`
  Individual step card UI and interactions
- `src/components/claim/add-node-drawer.tsx`
  Dynamic node insertion form
- `src/components/claim/remove-node-dialog.tsx`
  Confirmation dialog for removing custom nodes
- `src/components/claim/mobile-bottom-nav.tsx`
  Mobile navigation experience
- `src/components/claim/dashboard-sidebar.tsx`
  Desktop sidebar experience

## Main Features

- Claim overview with progress and next-action emphasis
- Registry-driven process timeline
- Step-specific metadata rendering
- Insert/remove custom nodes between claim stages
- AI explanation dialog for each step
- Simulated AI document analyzer with reset/clear support
- Mobile bottom navigation plus desktop sidebar
- React Query loading flow with Zod validation before render

## Setup

### Environment

- Package manager: `npm`
- Lockfile included: `package-lock.json`
- Environment variables: none required
- Backend/API dependency: none required for local evaluation

### Recommended local runtime

- Node.js: `20+` recommended

### Install and run

```bash
npm install
npm run dev
```

### Build and verify

```bash
npm run build
npm run lint
npm run preview
```

## Reviewer Notes

### Where the mock data lives

- `src/data/claim-process.ts`

### What to test first

1. Confirm the overview answers the claim number, current status, ETA, and immediate action quickly.
2. Open timeline items and use `Explain with AI`.
3. Add an `Information Note` after a process step.
4. Add an `Additional Attachment` node and then remove it.
5. Use the document analyzer with both valid and weak file inputs.
6. Check the mobile layout and bottom navigation behavior.

### Expected demo behavior

- User-created nodes should appear in the correct timeline position
- Removing a custom node should not affect original API nodes
- The analyzer should not always approve; it should return `approved` or `needs-review` based on the checks
- Mobile and desktop should keep the same functionality with different navigation behavior

## Design Decisions

- Prioritized immediate customer-facing answers before secondary detail
- Used registry-driven rendering to keep heterogeneous timeline logic maintainable
- Kept API payload immutable and layered user-created timeline state on top
- Separated mobile and desktop navigation behavior to better match each device context
- Made the simulated AI flow explicit instead of implying nonexistent production intelligence

## Trade-offs

- Claim fetching is mocked locally instead of being connected to a real backend
- AI explanation and analyzer flows are simulation-oriented UX features, not live LLM integrations
- The project is optimized as a strong case-study prototype rather than a production-complete claim product

## Scalability And Maintainability

This implementation is intended to scale better than a step-specific dashboard because:

- new process step types can be added via the registry
- form validation rules are centralized in Zod schemas
- user-generated workflow state is isolated in Zustand
- timeline transformation logic is separated from presentation components
- mobile and desktop behavior share the same core data model

## Known Gaps

- No real backend persistence for inserted nodes or analyzer results
- No automated test suite yet
- Production bundle size can still be improved with code splitting
- README does not include screenshots in this version

## With More Time

- Add screenshots or a short GIF walkthrough for the main flows
- Add automated tests for timeline merging, node insertion/removal, and analyzer logic
- Connect the payload and document flow to a real backend API
- Persist custom nodes and analyzer state across reloads
- Add route-based code splitting to reduce bundle size
- Add richer desktop analytics without weakening the mobile-first hierarchy

## AI Tools Used

- Codex / GPT-5 for implementation, refactoring, and UX iteration
- `shadcn/ui` CLI for UI scaffolding

