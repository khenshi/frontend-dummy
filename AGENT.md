Build the frontend for the **Property Management CRUD prototype** in this repository.

This is a small dummy application used to test the frontend stack we plan to later use for a Resort Management System. just keep it very simple and minimalist no gradients and excessive colors

## First Step

Before writing code, read:

`backend.md`

Treat it as the source of truth for:

* API routes
* request formats
* response formats
* Property fields and types
* validation requirements
* image upload behavior
* image URLs
* error responses

Make the frontend match the existing backend. Do not modify the backend unless necessary.

## Frontend Stack

Use:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Zod
* `useState` and `useEffect`

Do NOT use:

* React Hook Form
* TanStack Query
* Redux
* Zustand
* Next.js
* UI/component libraries

Keep the project simple and easy to understand.

## Features

Implement the complete CRUD frontend:

* View all properties
* View property details
* Create property
* Edit property
* Delete property
* Upload property image
* Preview selected image
* Display uploaded images
* Loading states
* Error states
* Empty states
* Form validation

Use these routes:

* `/properties`
* `/properties/new`
* `/properties/:id`
* `/properties/:id/edit`

Redirect `/` to `/properties`.

## Structure

Use approximately:

```text id="p2zyhh"
src/
├── api/
│   ├── client.ts
│   └── properties.api.ts
├── components/
│   └── properties/
│       ├── PropertyForm.tsx
│       ├── PropertyCard.tsx
│       └── DeletePropertyDialog.tsx
├── pages/
│   ├── PropertyListPage.tsx
│   ├── PropertyDetailsPage.tsx
│   ├── CreatePropertyPage.tsx
│   └── EditPropertyPage.tsx
├── schemas/
│   └── property.schema.ts
├── types/
│   └── property.ts
├── App.tsx
└── main.tsx
```

Adjust the structure if the existing project already has a reasonable organization.

## Implementation

Keep Axios requests inside the API layer instead of directly inside components.

Use normal React state:

```text id="mnj2ml"
Page
→ useState / useEffect
→ API function
→ Axios
→ Backend
```

Create one reusable `PropertyForm` for both create and edit.

Manage form fields manually with `useState`.

Use Zod for client-side validation.

For image uploads, follow the format documented in `backend.md` and use `FormData` when required.

Use `URL.createObjectURL()` for local image previews and clean up object URLs properly.

After deleting a property, update local state instead of refreshing the entire browser.

## UI

Use Tailwind CSS to create a simple, clean, responsive admin-style interface.

The property list should show the most useful information such as:

* image
* title
* price
* availability
* rooms
* View / Edit / Delete actions

Use a simple confirmation dialog before deletion.

Prioritize functionality and readability over animations or complex design.

## Environment

Use environment variables for backend URLs rather than hardcoding them.

Create/update `.env.example` as needed based on `backend.md`.

## Code Quality

Prioritize:

1. Simple and readable code
2. TypeScript type safety
3. Reusable components where useful
4. Clear separation between API and UI
5. Minimal dependencies
6. Easy-to-explain implementation

Do not overengineer this prototype.

Before adding another dependency or abstraction, determine whether it is actually necessary for this CRUD application.

Inspect the existing repository and `backend.md` first, then implement the frontend incrementally and make sure it matches the backend API exactly.
