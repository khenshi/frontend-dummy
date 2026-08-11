# Frontend Technical Interview Preparation

This guide prepares you to explain, defend, and improve this frontend in a technical interview. It is based on the code as it currently exists, so use it as a speaking guide rather than memorizing it word for word.

## 1. The 30-second project summary

> This is a responsive property-management CRUD frontend built with React 19, TypeScript, Vite, React Router, Axios, Zod, and Tailwind CSS. Users can list and filter properties, view details, create and edit a property with an optional image, and delete a property after confirmation. The UI communicates with a REST API through a small typed API layer. Forms are controlled, validated client-side with Zod, and submitted as multipart form data because they may include an image. The app includes loading, empty, error, and submission states, and its production build includes an SPA fallback worker.

## 2. Technology choices

| Technology | Role | Why it fits here | Trade-off or alternative |
| --- | --- | --- | --- |
| React 19 | Component-based UI and state | Small ecosystem-friendly CRUD UI | More state/data-fetching conventions must be chosen by the team |
| TypeScript | Static types | Keeps API data, forms, and props consistent | Types do not validate runtime API responses |
| Vite | Development server and bundler | Fast startup/HMR and simple configuration | Larger apps may need more build customization |
| React Router | Client-side routes and navigation | Maps CRUD screens cleanly to URLs | Route loaders/actions could replace some manual effects |
| Axios | HTTP client | Base URL configuration, typed responses, and structured errors | Native `fetch` would reduce dependencies |
| Zod | Runtime form validation | One schema expresses detailed field and cross-field rules | Form values and domain types are still declared separately |
| Tailwind CSS | Styling and responsive design | Fast, consistent utility-driven styling | Long class strings can reduce readability without conventions |
| `Intl` APIs | Money and date display | Locale-aware formatting without extra packages | Date behavior depends on timezone and input semantics |

Version details are in `package.json`. The app currently uses React 19, React Router 7, Zod 4, Tailwind 4, TypeScript 5.9, and Vite 8.

## 3. Architecture and responsibility map

```text
main.tsx
  -> BrowserRouter + App
      -> route-level page
          -> reusable property component
          -> API function
              -> configured Axios client
                  -> REST backend

PropertyForm
  -> local controlled state
  -> Zod schema
  -> validated PropertyFormValues
      -> toFormData()
          -> POST/PATCH request
```

### Important files

| File or folder | Responsibility |
| --- | --- |
| `src/main.tsx` | React root, Strict Mode, and browser router setup |
| `src/App.tsx` | Route table and global page layout |
| `src/pages/` | Route-level data loading, mutations, and page states |
| `src/components/properties/PropertyForm.tsx` | Shared create/edit form and image preview |
| `src/components/properties/DeletePropertyDialog.tsx` | Reusable delete confirmation UI |
| `src/api/client.ts` | Axios instance, environment-based API origin, and error normalization |
| `src/api/properties.api.ts` | Property endpoint functions and multipart serialization |
| `src/schemas/property.schema.ts` | Runtime client-side validation rules |
| `src/types/property.ts` | Domain model, enum-like property types, and form model |
| `src/index.css` | Tailwind setup and reusable component classes |
| `scripts/create-worker.mjs` | Generates a production SPA fallback worker |
| `BACKEND.md` | REST API contract consumed by this app |

### Why this separation is useful

- Pages coordinate route parameters, data fetching, mutations, and navigation.
- Components focus on reusable UI behavior.
- The API layer hides URLs, response envelopes, and multipart encoding from the UI.
- Types document compile-time expectations.
- Zod validates untrusted user input at runtime.

This is deliberately lightweight. For a small application, adding a global state library or a deep abstraction layer would create more concepts than value.

## 4. Routes and user flows

| Route | Screen | Main operation |
| --- | --- | --- |
| `/` | Redirect | Replaces history with `/properties` |
| `/properties` | Property list | Fetch, filter, and delete |
| `/properties/new` | Create form | Validate and create |
| `/properties/:id` | Property details | Fetch one and delete |
| `/properties/:id/edit` | Edit form | Fetch one, validate, and update |
| Any unknown route | Redirect | Replaces history with `/properties` |

### List and filtering flow

1. `PropertyListPage` holds two filter states: the editable `filterForm` and committed `appliedFilters`.
2. Changing an input does not immediately call the API.
3. Submitting validates and converts strings into `PropertyFilters`.
4. A `useEffect` watches `appliedFilters` and invokes `getProperties`.
5. Axios serializes defined filter values as query parameters.
6. The page renders loading skeletons, an error with retry, an empty state, or results.

Why two filter objects? It prevents a network request on every keystroke and lets users edit several fields before applying them together.

### Create flow

1. `PropertyForm` owns controlled input values.
2. Submit calls `propertySchema.safeParse`.
3. Zod issues are mapped to the first error for each field.
4. The page sets a saving state and calls `createProperty`.
5. `toFormData` trims text, converts the inspection date/time to ISO, stringifies values, and appends an optional file.
6. A successful response navigates to the new property details route.
7. A failure is normalized by `getApiError` and displayed above the form.

### Edit flow

1. The page reads `id` from the route and fetches the property.
2. API numbers are converted to strings because HTML controlled number inputs expose strings.
3. ISO inspection time is converted to local date and time fields.
4. The same `PropertyForm` is populated through `initialValues`.
5. Submission sends multipart data with `PATCH`, then returns to the details screen.

### Delete flow

- List deletion removes the deleted item from local state, avoiding an extra request.
- Details deletion navigates to the list with `replace: true`, so the deleted page is not left as a useful back-navigation target.
- Both routes require confirmation through `DeletePropertyDialog`.

## 5. Data modeling and type safety

`Property` represents server data. It uses numbers for numeric domain values and ISO strings for dates because that is how JSON transports them.

`PropertyFormValues` represents browser form state. Numeric fields are strings because an input may temporarily contain `''`, a partial decimal, or another value that is not yet a valid domain number. Keeping them as strings avoids fighting the browser during editing; validation and serialization form the boundary into API data.

`propertyTypes` uses `as const`:

```ts
export const propertyTypes = ['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL'] as const
export type PropertyType = (typeof propertyTypes)[number]
```

This produces both a runtime array for rendering/validation and a compile-time union type, avoiding two independently maintained lists.

### Compile-time types versus runtime validation

TypeScript only checks the code during development/build. It cannot guarantee that a user or server supplies valid runtime data. Zod handles runtime form validation. The API responses are currently trusted via Axios generic types; production hardening could parse responses with Zod too.

## 6. Form validation details

The schema enforces:

- Required, trimmed title and description.
- A parseable available date.
- Latitude from -90 through 90.
- Longitude from -180 through 180.
- Non-negative price.
- A positive whole number of rooms.
- A property type from a fixed set.
- JPEG, PNG, or WebP images no larger than 5 MB.
- Inspection date and time must either both be present or both be empty.

`requiredNumber` centralizes repeated string-to-number checks. `superRefine` handles a rule involving multiple fields, which a single-field validator cannot express cleanly.

The form uses `noValidate` so browser-native messages do not conflict with the application's consistent Zod errors. HTML attributes such as `min`, `step`, and `accept` still improve input behavior, while Zod remains the authoritative client validation layer. The backend must validate again because client validation can always be bypassed.

## 7. API design and error handling

The Axios client is created once with:

- `VITE_API_URL` when configured.
- `http://localhost:3000` as a local fallback.
- `/api` as the shared API prefix.
- `Accept: application/json`.

The trailing slash is removed from the configured origin to prevent malformed double slashes. `getImageUrl` joins the API origin with relative image paths returned by the server.

The property API layer unwraps the backend envelope:

```json
{ "success": true, "data": { } }
```

`getApiError(error: unknown)` safely narrows Axios errors, prefers the backend's user-facing `error.message`, gives network failures a clearer message, and falls back for unknown thrown values.

### Why multipart form data?

Create and update may include a binary image. `FormData` can transport the text fields and file in one request. The browser/Axios sets the multipart boundary; manually setting `Content-Type` could omit the boundary and break the request.

### POST, PATCH, and DELETE semantics

- `POST /properties` creates a new resource.
- `PATCH /properties/:id` updates an existing resource.
- `DELETE /properties/:id` returns no useful body, so the client only awaits completion.

One nuance: the current update function sends all form fields, even though the endpoint supports partial updates. It is a PATCH by endpoint semantics, but the UI behaves more like a full editable replacement of non-image fields.

## 8. React concepts demonstrated

### Controlled components

Every input receives its value from React state and updates through `onChange`. Benefits include immediate validation control, easy reset/population, predictable submission data, and synchronized image/file state. The cost is a re-render on edits, which is negligible for this form size.

### Reusable create/edit form

`PropertyForm` accepts `initialValues`, image context, submit text, submission state, server errors, and an async callback. This removes duplicated markup and validation while leaving network/navigation behavior in each page.

### Effects

- List: refetches when committed filters change.
- Details/edit: fetches when the route ID changes.
- Form: synchronizes changed initial values and manages object URL lifecycle.

The image preview effect revokes its object URL during cleanup. This is important because object URLs retain browser resources until released.

### Strict Mode

`StrictMode` helps expose unsafe side effects during development and may intentionally run effect setup/cleanup more than once. Fetch effects must therefore tolerate repeated or stale requests.

### Stale async result protection

`PropertyDetailsPage` uses an `active` flag in its effect cleanup so a completed old request cannot set state after the effect becomes stale. This avoids a UI race, although request cancellation with `AbortController` would also save network work. The list and edit fetches do not yet use equivalent stale-result protection.

### State ownership

State stays close to where it is used. There is no cross-page shared client state that justifies Context, Redux, or Zustand. Server-state libraries become useful when caching, deduplication, invalidation, background refresh, and optimistic mutations grow more complex.

## 9. Styling and responsive behavior

Tailwind utilities supply layout and responsive breakpoints. Repeated visual patterns such as buttons, form inputs, badges, and page titles are composed in `@layer components` within `src/index.css`.

The UI moves from stacked mobile layouts to multi-column grids/tables at larger breakpoints. Semantic HTML includes forms, labels, fieldsets, tables, definition lists, headings, and alerts. Visible focus rings are defined for key controls.

## 10. Production build and deployment behavior

`npm run build` performs two operations:

1. Vite builds optimized static assets into `dist`.
2. `scripts/create-worker.mjs` creates `dist/server/index.js`.

The generated worker first asks the asset binding for the request. If a GET request returns 404, it serves `/index.html`. That fallback is necessary for client-side routes such as `/properties/:id`: direct navigation must load the SPA shell and allow React Router to resolve the route. Non-GET requests and real assets keep their original responses.

Environment values exposed to the browser must use Vite's `VITE_` prefix. They are build-time public configuration, not a safe location for secrets.

## 11. Quality status

At the time this document was created:

- `npm run build` passes.
- `npm run lint` passes.
- The production JavaScript bundle is approximately 363 KB before gzip and 113 KB after gzip.
- No automated test command or test files are configured.

The ESLint configuration currently targets JavaScript/JSX patterns, while the source is TypeScript/TSX. The build still performs TypeScript checking through Vite's pipeline behavior and TypeScript configuration expectations should be made explicit, but production-grade linting should add `typescript-eslint` with type-aware rules.

## 12. Honest limitations and strong improvement answers

Interviewers usually value clear prioritization more than claiming the app is perfect.

### Highest-priority improvements

1. **Add tests.** Unit-test schema edge cases and serializers; component-test loading/error/form flows; integration-test CRUD interactions; add one end-to-end happy path.
2. **Cancel or ignore every stale request.** Use Axios `signal`/`AbortController`, especially for list and edit effects, and distinguish cancellation from genuine errors.
3. **Improve modal accessibility.** Add initial focus, focus trapping, Escape-to-close, focus restoration, and possibly render through a portal. A mature dialog library can handle these details.
4. **Parse API responses at runtime.** Zod schemas at the network boundary would prevent malformed backend data from silently entering UI state.
5. **Add type-aware linting.** Configure `typescript-eslint` for `.ts` and `.tsx` files.
6. **Handle image failures.** Provide an `onError` fallback for broken or expired image URLs.
7. **Define date semantics explicitly.** Date-only values and local inspection times can shift across timezones if parsed as generic `Date` values. Decide whether each field represents a calendar date, local wall time, or instant.

### Additional improvements

- Persist filters in URL query parameters for shareable/back-button-friendly searches.
- Add pagination or virtualization when the property list becomes large.
- Debounce live search only if product requirements call for search-as-you-type.
- Adopt TanStack Query or route loaders when caching and invalidation complexity warrants it.
- Add authentication/authorization and handle 401/403 centrally if the app becomes private.
- Add API timeouts, observability, and correlation IDs for production diagnosis.
- Add error boundaries for unexpected render failures.
- Use a reusable formatter for property labels, money, and date/time.
- Remove the fully commented-out `PropertyCard` file or restore it as an intentional alternate view.
- Refresh or reconcile data after mutations if multiple users may modify the same records.
- Consider optimistic deletion with rollback only when latency makes it worthwhile.

## 13. Likely technical questions and model answers

### “Walk me through the application.”

Start at `main.tsx`, which mounts the app inside Strict Mode and BrowserRouter. `App.tsx` maps routes to four CRUD pages. Pages own route-level fetching and mutation state. They call a small Axios-based API layer rather than assembling requests in components. Shared types define server and form shapes, while Zod provides runtime form validation. The shared form serves both create and edit flows, and Tailwind handles styling and responsiveness.

### “Why did you not use Redux?”

The state is local to individual routes: form fields, filters, loading flags, errors, and dialog selection. There is no complex shared client state. Adding Redux would increase ceremony without solving a current problem. If server cache synchronization became complex, I would first consider a server-state tool such as TanStack Query rather than treating API data as generic global state.

### “Why Axios instead of fetch?”

Axios gives this app a configured client, typed response generics, convenient query parameter handling, and consistent error narrowing. Native fetch could absolutely handle this app and reduce a dependency; the important design choice is centralizing transport behavior behind the API module.

### “Why are numeric form values strings?”

HTML inputs expose string values, and valid editing states include an empty string or partial value. Converting on every keystroke creates awkward controlled-input behavior. The form keeps UI state as strings, validates numeric meaning with Zod, and serializes at the API boundary.

### “Why both TypeScript and Zod?”

They protect different phases. TypeScript checks trusted program structure at development time. Zod checks runtime values that come from users and, if extended, the network. TypeScript types disappear from the built JavaScript.

### “Why is there client validation if the backend validates?”

Client validation improves feedback speed and usability. Backend validation protects integrity and security because clients can be bypassed or outdated. The server remains authoritative, and its validation messages are surfaced through the common error handler.

### “How does image upload work?”

The file input stores a `File` object. An object URL gives an immediate local preview and is revoked during cleanup. On submit, the file and text fields are appended to `FormData`. The backend returns a relative image URL, which the client joins to the configured API origin.

### “How are dates handled?”

Date-only availability is sent as its input string. Inspection uses separate local date/time controls; the client combines them into a local `Date` and calls `toISOString`, producing a UTC instant. Editing converts the stored instant back into local controls. I would explicitly test DST and cross-timezone behavior and avoid parsing date-only values as instants when they represent calendar dates.

### “How do filters avoid calling the server on every keypress?”

Editable filter state is separate from applied filter state. Only form submission changes `appliedFilters`, and the fetching effect depends on that state. Clear resets both.

### “How do you prevent race conditions?”

The details fetch ignores stale completions using an effect-scoped active flag. A stronger consistent implementation would pass an AbortSignal through the API functions for list, details, and edit. That both blocks stale state updates and cancels unnecessary work.

### “How does error handling work?”

Each async workflow catches unknown errors and passes them to `getApiError`. Axios errors use the backend envelope when available, network failures get a specific message, and unknown errors get a safe fallback. Pages render errors in context and the list offers retry.

### “What happens after a delete?”

On the list, the item is filtered from local state after the server succeeds. On details, the app navigates to the list using history replacement. If deletion fails, the dialog closes and a page error is shown. A future optimistic version would remove first and restore on failure.

### “Why use `replace` for redirects?”

It avoids leaving useless redirect or deleted-resource entries in browser history. Back navigation is less likely to bounce through `/` or return to a deleted detail route.

### “What does Strict Mode change?”

In development, React may repeat rendering and effect setup/cleanup to expose side effects that are not resilient. It does not mean production always performs two fetches. Effects should still be cleanup-safe, which is another reason to use cancellation.

### “How would you test this?”

- Unit: `propertySchema`, cross-field inspection validation, `getImageUrl`, error normalization, and form-data serialization after extracting/exporting it.
- Component: form error rendering, valid submission, image preview, filter conversion, loading/empty/error states, and dialog actions using React Testing Library.
- API integration: Mock Service Worker to simulate success and HTTP failures without coupling tests to Axios internals.
- End-to-end: Playwright tests covering create, filter, edit, delete, direct route navigation, and keyboard interaction.

### “How would you scale this?”

First add pagination and URL-backed filters. Then use a server-state cache for request deduplication, invalidation, and background refresh. Split route bundles with `lazy` if bundle analysis shows value. Generate or share API schemas to reduce contract drift. Add an authentication layer, telemetry, test coverage, and a component system as team/product size grows.

### “How would you improve performance?”

Measure first. Current data and component size are small, so widespread memoization is unlikely to help. Likely wins at scale are route-level lazy loading, responsive/compressed images, pagination or virtualization, request caching, and avoiding stale requests. Use bundle analysis and browser performance tooling before optimizing.

### “What accessibility work is present, and what is missing?”

Present: semantic labels and headings, a fieldset for availability, alert roles for errors, an alertdialog role, disabled submission states, alt text, visible focus styles, and a loading label. Missing or incomplete: dialog focus trap/restoration and Escape behavior, potentially stronger error-to-input association using `aria-describedby`/`aria-invalid`, and live announcements for async status changes.

### “What security concerns apply to this frontend?”

Never place secrets in `VITE_` variables because browser bundles are public. Treat all client validation as bypassable. React escapes interpolated text by default, and the code does not inject raw HTML. The backend must enforce authorization, upload type/size checks, request validation, and appropriate CORS/CSRF policy. File `accept` is only a hint, not a security control.

### “What would you change if the API became slow?”

Add cancellation and timeouts, cache reads, keep previous list data during filter changes, show appropriate progressive states, paginate responses, optimize images, and instrument request timing. Retry only safe/idempotent operations automatically and use backoff rather than retrying all failures blindly.

### “Why not memoize every callback or component?”

Memoization has comparison and complexity costs. These components are small and do not show an identified render bottleneck. I would profile first and memoize only expensive work or props passed to memoized children where identity materially matters.

## 14. Scenario questions

### The user applies filters quickly and an older request finishes last

Current risk: stale list results may win because list requests are not cancelled. Solution: create an `AbortController` in the effect, pass its signal to Axios, abort in cleanup, and ignore cancellation errors.

### The backend returns a property type unknown to the frontend

Current behavior: the Axios generic asserts that it is a valid `Property`, so the bad value is trusted. Solution: parse response data with a Zod API schema, report a contract error, and optionally support a safe “Unknown” display.

### A user changes timezone after creating an inspection

The inspection is an instant stored as ISO UTC and will display in the viewer's current locale/timezone. That may be correct for a real appointment. `availableDate`, however, is probably a calendar date and should not shift; it should be formatted without accidental UTC-to-local conversion.

### The backend accepts the delete but the response is lost

The UI reports failure even though the resource may already be gone. A retry may receive 404. For deletion, the product could treat a subsequent 404 as the desired final state, or refetch/reconcile before showing the final message.

### The image endpoint returns 404

The current `<img>` displays a broken image indicator. Add `onError` state to replace it with the same no-image fallback and optionally log the failure.

## 15. Suggested test matrix

| Area | Happy path | Important edge cases |
| --- | --- | --- |
| List | Loads properties | Empty, 500, network error, retry, stale request |
| Filters | Combined filters serialize correctly | Price order, negative values, fractional rooms, 100-character search |
| Create | Valid multipart submission and redirect | Backend error, double submit, invalid inputs |
| Edit | Existing data maps to form and saves | Missing ID, stale fetch, timezone conversion, image replacement |
| Delete | Confirms and removes/navigates | Cancel, failure, repeated click, keyboard use |
| Image | Valid preview and upload | Wrong MIME, over 5 MB, object URL cleanup, broken remote URL |
| Routing | Direct URL and redirects work | Unknown route, browser back/forward, refreshed detail route |
| Accessibility | Labels and keyboard flow | Focus trap, Escape, error announcements, reduced motion |

## 16. Live code-review observations

If asked to review the implementation, mention these calmly and with solutions:

- `PropertyDetailsPage` protects against stale fetch completion; `EditPropertyPage` and `PropertyListPage` should use the same strategy or cancellation.
- `PropertyForm` synchronizes `initialValues` in an effect. On edit, the parent reconstructs an object on every render, so that effect can run repeatedly. It currently settles because React bails out when given the same object reference from that render path only imperfectly across rerenders; memoizing the derived initial values or keying/resetting the form deliberately would make the lifecycle clearer.
- `getApiError` assumes a backend error shape after Axios narrowing; a guard or schema would make it safer.
- `Date.parse` is permissive, so strict calendar-date validation may be preferable.
- The modal semantics are started but not complete without focus management.
- There are no tests and no configured test runner.
- Type-aware linting is not configured for the TSX source.
- The app trusts API response shapes at runtime.
- The commented `PropertyCard` is dead code and should be removed or restored intentionally.

## 17. Practical commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format:check
```

For local development, the backend defaults to `http://localhost:3000`. To use another API origin:

```bash
VITE_API_URL=https://api.example.com npm run dev
```

Remember: this value becomes visible to the browser.

## 18. A strong five-minute walkthrough

1. Give the 30-second summary.
2. Show `App.tsx` and explain the route-to-page structure.
3. Show `types/property.ts` and contrast server values with form strings.
4. Show `PropertyForm.tsx` and `property.schema.ts`; explain reuse, controlled inputs, and cross-field validation.
5. Show `properties.api.ts`; explain the response envelope, multipart conversion, image URL construction, and PATCH behavior.
6. Show one page's loading/error/success states and deletion flow.
7. Close with two honest improvements: consistent request cancellation and automated testing.

## 19. Final interview checklist

Before presenting, be able to explain without reading:

- The route for every CRUD operation.
- Why form numbers are strings but API numbers are numeric.
- The difference between TypeScript and Zod.
- Why `FormData` is used and why its `Content-Type` is not manually set.
- How local inspection time becomes an ISO instant.
- How loading, error, empty, saving, and deleting states are represented.
- Why global state was unnecessary here.
- How SPA fallback routing works in production.
- At least three accessibility improvements.
- At least three tests you would add first.
- The application's most important race condition and how to fix it.
- Which configuration is public and why secrets must not be stored there.

The best interview posture is: describe the current decision, explain why it was reasonable at this scale, acknowledge its limit, and give a concrete trigger for adopting a more advanced solution.
