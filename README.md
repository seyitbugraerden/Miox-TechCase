<div align="center">

# 🛡️ AI-Powered Claim Orchestrator

### Mobile-first insurance claim dashboard built with React 19, TypeScript, TanStack Query and Zustand

A technical case study focused on **insurance claim tracking, timeline orchestration, dynamic workflow nodes, simulated AI assistance and document validation**.

<br />

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## About the Project

**AI-Powered Claim Orchestrator** is a mobile-first insurance claim management dashboard created as a technical case study.

The interface is designed to answer three important customer questions as quickly as possible:

```text
What is my claim number and current stage?
How much longer will the process take?
Is there anything I need to do right now?
```

The project combines:

- Claim overview
- Process timeline
- Dynamic workflow nodes
- Action center
- Simulated AI explanations
- Simulated document analysis
- Responsive desktop/mobile navigation
- Validated state and form flows
- Automated tests

---

## Main Features

### Claim Overview

The overview surfaces the most relevant information above the fold:

- Claim number
- Current status
- Estimated remaining time
- Immediate customer action
- Claim progress

---

## Claim Timeline

The claim process is rendered as a structured timeline.

Current stages in the mock claim include:

```text
Towing Service
Claim Notification
Appraisal
Substitute Rental Vehicle
File Review
Deduction Reason
Payment Information
Closed
```

---

## Current Claim Example

The mock payload includes:

```text
Claim Number: 9239182380
Current Status: File Review Process Continues
Estimated Remaining Time: 20 Days
Immediate Action: Upload Occupational Certificate
```

---

## Architecture

```text
                    Claim Dashboard
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
       Overview        Timeline       Action Center
                          │                │
                          ▼                ▼
                  Dynamic Node Layer   AI Analyzer
                          │                │
                          ▼                ▼
                       Zustand        Validation
                          │
                          ▼
                   React Query Data
                          │
                          ▼
                    Zod Validation
```

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| **React 19.2** | UI architecture |
| **TypeScript 6** | Type safety |
| **Vite 8** | Development/build tooling |
| **TanStack React Query 5** | Claim data fetching |
| **Zustand 5** | Workspace state |
| **Zod 4** | Runtime validation |
| **React Hook Form** | Form management |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** | Component system |
| **Base UI** | Accessible UI primitives |
| **Lucide React** | Icons |
| **Sonner** | Toast notifications |
| **Vaul** | Drawer interaction |
| **Vitest** | Unit/component tests |
| **Testing Library** | User interaction tests |
| **jsdom** | Browser-like test runtime |

---

## Data Fetching

The claim payload is loaded through:

```text
TanStack React Query
```

using:

```text
src/lib/api.ts
```

The main query key is:

```ts
['claim-process']
```

---

## Loading State

While claim data is being resolved, the application renders:

```text
DashboardSkeleton
```

instead of the final interface.

---

## Error State

If claim data cannot be loaded or validated, the application displays a dedicated error state with:

```text
Retry payload
```

action.

---

## Zod Validation

The project validates both:

- Claim API payload
- User form inputs

before those values are used.

This prevents the UI from making unsafe assumptions about heterogeneous claim data.

---

## Claim Data Model

The main claim payload contains:

```text
title
fileNo
estimatedRemainingTime
currentStatus
processDetails
```

Each item inside:

```text
processDetails
```

may contain a different metadata shape.

---

## Heterogeneous Process Steps

Different claim steps expose different fields.

For example:

### Towing Service

```text
Pickup Location
Towing Date
```

### Claim Notification

```text
Date
Report Type
Damage Reason
Reporting Party
Contact
```

### Deduction Reason

```text
Action Required
Occupational Deduction
Appreciation Deduction
Policy Deductible
Non-Damage Amount
```

This is intentionally handled as heterogeneous data rather than a single rigid step interface.

---

## Timeline Normalization

Raw claim steps are transformed through:

```text
normalizeProcessSteps()
```

into a common internal model.

Each normalized step receives:

```text
id
title
status
kind
source
createdAt
metadata
```

---

## Registry-Driven Rendering

Step rendering is controlled by a registry defined in:

```text
src/components/claim/constants.ts
```

Instead of writing large blocks of:

```text
if / else
```

for every process type, each known claim step can define:

- Icon
- Stage name
- Metadata fields
- Labels
- Visual tone

This makes future claim stages easier to add.

---

## Generic Step Fallback

Unknown process steps are still supported.

If a step does not exist in the registry, the UI generates a generic configuration from its metadata.

Example:

```text
Unexpected Stage
    │
    ▼
Generic Registry Entry
    │
    ▼
Metadata Fields Rendered Automatically
```

---

## Dynamic Timeline Nodes

One of the primary case requirements is the ability to insert new nodes into the existing claim timeline.

The application supports:

```text
Information Note
Additional Attachment
```

nodes.

---

## Add Node Flow

```text
Existing Process Step
        │
        ▼
     Add Node
        │
        ├── Information Note
        └── Additional Attachment
        │
        ▼
     Zustand Store
        │
        ▼
    Timeline Merge
```

---

## Immutable API Data

Original claim API data is not modified.

Instead:

```text
API Timeline
+
User-Created Nodes
=
Rendered Timeline
```

This keeps external data separate from local workspace state.

---

## Timeline Merge Logic

Custom nodes are inserted immediately after their selected claim step.

If multiple nodes are attached to the same stage, they are sorted by:

```text
createdAt
```

before rendering.

---

## Removing Custom Nodes

User-created nodes can be removed through a confirmation dialog.

Removing a node affects only the custom overlay state.

Original API claim stages remain untouched.

---

## Zustand State Management

Workspace state is managed through:

```text
src/stores/claim-store.ts
```

The store manages:

```text
insertedNodes
aiInsights
documentAnalysis
```

alongside actions for:

```text
addNode
removeNode
cacheInsight
setDocumentAnalysis
```

---

## AI Insight

Every process step can open an:

```text
Explain with AI
```

dialog.

The current implementation is deterministic and simulated rather than connected to a real LLM API.

---

## AI Explanation Flow

```text
Timeline Step
     │
     ▼
Explain with AI
     │
     ▼
buildAiInsight()
     │
     ├── Summary
     ├── Context Bullets
     └── Recommended Next Action
```

---

## AI Insight Content

The generated explanation includes:

- Current stage status
- Number of contextual metadata fields
- Whether the user has an explicit action
- Whether the step came from API or local user state
- Recommended next action

---

## Insight Cache

Generated explanations can be cached in the Zustand store:

```text
aiInsights
```

using the timeline step ID as the key.

---

## Document Analyzer

The Action Center includes a simulated AI document analyzer.

This flow is intentionally implemented without an external model or API key.

---

## Analyzer Inputs

The analyzer works with:

```text
Document Type
Uploaded File
Reviewer Note
```

---

## File Validation

Current analyzer checks include:

### Supported Type

Accepted:

```text
PDF
Image
```

---

### Maximum Size

Recommended maximum:

```text
5 MB
```

---

### Filename Quality

For:

```text
Occupational Certificate
```

the analyzer checks whether the filename strongly indicates the expected content.

Examples it recognizes include terms such as:

```text
occupational
certificate
meslek
cert
```

---

### Review Context

The reviewer note should contain enough context.

Current threshold:

```text
8+ characters
```

---

## Analyzer Decision

The analyzer evaluates four checks.

If at least:

```text
3 / 4
```

checks pass, the result becomes:

```text
approved
```

otherwise:

```text
needs-review
```

---

## Analyzer Result

The generated analysis contains:

```text
status
fileName
documentType
analyzedAt
summary
checks
```

---

## Why the AI Layer Is Simulated

The current implementation intentionally avoids a real LLM backend.

This makes the technical case:

- Deterministic
- Offline-review friendly
- API-key independent
- Reproducible
- Transparent about simulated behavior

The project does not claim that these flows are production AI integrations.

---

## Search

Timeline content can be searched directly from the dashboard.

Search matches against:

```text
Title
Status
Metadata Values
```

---

## Deferred Search

The application uses:

```text
useDeferredValue
```

for timeline search.

This keeps immediate typing interactions decoupled from filtering work.

---

## Claim Progress

Progress is derived from claim states.

Current logic considers:

```text
Completed → full progress
In Progress → partial progress
```

and calculates an overall percentage from all process steps.

---

## Action Step Detection

The application looks first for a step containing:

```text
actionRequired
```

If none exists, it falls back to a:

```text
Pending
```

or:

```text
In Progress
```

step.

---

## Responsive Navigation

The project deliberately uses different interaction models depending on screen size.

### Desktop

```text
Persistent Sidebar
```

### Mobile

```text
Bottom Navigation
```

This is more than a visual breakpoint—the navigation model itself changes.

---

## Desktop Sidebar

The desktop dashboard uses:

```text
DashboardSidebar
```

for persistent navigation.

Primary destinations include:

```text
Overview
Timeline
Action Center
AI Desk
```

---

## Mobile Navigation

Mobile devices use:

```text
MobileBottomNav
```

with four touch-friendly actions.

This improves thumb reach compared with shrinking a desktop sidebar.

---

## Active Section Tracking

The dashboard tracks scroll position and determines which navigation section is active.

The main sections are:

```text
#overview
#timeline
#action-center
#ai-desk
```

---

## UI Components

The project contains reusable UI components including:

```text
Alert
Alert Dialog
Avatar
Badge
Button
Card
Dialog
Drawer
Input
Progress
Scroll Area
Select
Separator
Sheet
Sidebar
Skeleton
Table
Tabs
Textarea
Tooltip
```

---

## shadcn/ui

The component architecture follows:

```text
shadcn/ui
```

patterns on top of accessible primitive components.

---

## Toast Feedback

The project uses:

```text
Sonner
```

for user feedback such as successful node operations and relevant interactions.

---

## Mock Claim Payload

Current case data lives in:

```text
src/data/claim-process.ts
```

The project does not currently depend on an external production backend.

---

## Current Data Example

The mock process contains eight steps:

```text
1. Towing Service
2. Claim Notification
3. Appraisal
4. Substitute Rental Vehicle
5. File Review
6. Deduction Reason
7. Payment Information
8. Closed
```

---

## Payment Data

The mock process includes payment-related fields such as:

```text
Paid To
IBAN
Payment Amount
Note
```

These are displayed as part of the case-study timeline and are not connected to a live payment system.

---

## Project Structure

```text
Miox-TechCase/
│
├── src/
│   ├── components/
│   │   ├── claim/
│   │   │   ├── add-node-drawer.tsx
│   │   │   ├── ai-insight-dialog.tsx
│   │   │   ├── analysis-result.tsx
│   │   │   ├── constants.ts
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── dashboard-skeleton.tsx
│   │   │   ├── mobile-bottom-nav.tsx
│   │   │   ├── native-select.tsx
│   │   │   ├── overview-section.tsx
│   │   │   ├── remove-node-dialog.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── summary-card.tsx
│   │   │   ├── timeline-section.tsx
│   │   │   └── timeline-step-card.tsx
│   │   │
│   │   └── ui/
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       └── tooltip.tsx
│   │
│   ├── data/
│   │   └── claim-process.ts
│   │
│   ├── hooks/
│   │   └── use-mobile.ts
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── claim-utils.ts
│   │   └── utils.ts
│   │
│   ├── stores/
│   │   └── claim-store.ts
│   │
│   ├── test/
│   │   └── setup.ts
│   │
│   ├── types/
│   │   ├── claim.ts
│   │   └── index.ts
│   │
│   ├── App.case.test.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── components.json
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

---

## Testing

The repository includes automated tests for:

```text
Claim UI flows
Timeline transformation
Zustand store
Document analyzer
AI insight generation
Fallback registry behavior
```

---

## Test Stack

Tests use:

```text
Vitest
Testing Library
jest-dom
user-event
jsdom
```

---

## Acceptance Tests

The main case test verifies that the dashboard exposes:

```text
Claim Number
Current Status
ETA
Immediate Action
```

from the provided payload.

---

## Timeline Tests

The test suite verifies:

- Heterogeneous API normalization
- Correct custom-node insertion
- Node ordering
- Original API immutability
- Unknown-stage fallback rendering

---

## AI Tests

Tests verify that:

- AI insights preserve the claim number
- Explicit user actions are retained
- Recommended next actions are generated

---

## Document Analyzer Tests

The project verifies both:

```text
approved
```

and:

```text
needs-review
```

scenarios.

A valid certificate PDF with strong context should pass all checks, while an unsupported oversized file with weak context should be rejected.

---

## Zustand Tests

Store tests verify:

- Note creation
- Attachment creation
- Unique node IDs
- Node removal
- AI insight caching
- Document analysis storage

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/seyitbugraerden/Miox-TechCase.git
```

Navigate into the project:

```bash
cd Miox-TechCase
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Available Scripts

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Runs TypeScript validation before producing the Vite build.

### Lint

```bash
npm run lint
```

### Tests

```bash
npm test
```

Runs the Vitest test suite.

### Preview

```bash
npm run preview
```

---

## Environment

The current project does not require environment variables or external API credentials for local evaluation.

```text
Backend dependency: None
LLM API key: None
Database: None
```

---

## Current Development Status

### Implemented

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn/ui
- TanStack React Query
- Zustand
- Zod
- Claim overview
- Claim timeline
- Dynamic custom nodes
- Node removal
- Registry-driven step rendering
- Timeline search
- AI explanation simulation
- Document analyzer simulation
- Responsive desktop sidebar
- Mobile bottom navigation
- Loading state
- Error state
- Toast feedback
- Unit tests
- Component tests

### Current Limitations

- No production backend
- No database persistence
- No real authentication
- No real claim API
- No real file upload service
- No real AI/LLM API
- Custom nodes disappear after refresh
- AI results are local/in-memory
- No browser-level E2E suite
- No production monitoring

---

## Potential Improvements

Natural next steps include:

- Real claims API
- Authentication
- Database persistence
- Persistent custom timeline nodes
- Object storage for documents
- Real AI inference endpoint
- Streaming AI explanations
- Document OCR
- Claim messaging
- Push/email notifications
- Audit logs
- Role-based access
- File security scanning
- Error monitoring
- E2E tests
- Route-based code splitting
- Analytics dashboard

---

## Technical Highlights

The project demonstrates:

- React 19 architecture
- TypeScript 6
- TanStack Query
- Zustand
- Zod runtime validation
- Heterogeneous payload normalization
- Registry-driven rendering
- Immutable server-state design
- Local overlay state
- Dynamic timeline manipulation
- Responsive interaction design
- Mobile-first UX
- Simulated AI product flows
- Deterministic document analysis
- Component and business-logic testing

---

## Developer

<div align="center">

### Seyit Buğra Erden

**Full Stack Developer · Software Engineer**

[GitHub](https://github.com/seyitbugraerden) ·
[LinkedIn](https://www.linkedin.com/in/sbugraerden/)

<br />

Built with **React · TypeScript · TanStack Query · Zustand · Zod · Tailwind CSS**

</div>
