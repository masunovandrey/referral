# AGENTS.md

## Project overview
This project is a static web application hosted on GitHub Pages.
The frontend uses Firebase directly for authentication and database access. There is no custom backend server.
The app should remain compatible with Firebase Spark/free-tier usage where possible.

## Token and cost discipline
Work efficiently and minimize token usage.
Do not inspect unrelated files.
Do not run tests unless explicitly requested by the user.
By default, write or update tests and implementation code, then tell the user which local command to run.
The user will run tests locally and provide only the shortest relevant failure output if something fails.
Do not run the full test suite unless explicitly requested.
If a test command is needed, recommend the most targeted command possible.

Prefer outputs with only:

1. Changed files
2. Brief summary
3. Exact command the user should run locally


## Target architecture

- GitHub Pages for static frontend hosting
- Vite for local development and static build output
- Firebase Authentication for user login
- Cloud Firestore for database storage
- Firestore Security Rules for authorization
- Firebase Emulator Suite for local testing
- Vitest for unit and integration tests
- Playwright for end-to-end tests, when needed

## Firebase requirements

The app must support:

1. Public page available to both anonymous and logged-in users
2. User login via:
   - email/password
   - Google
   - GitHub
3. Authenticated user page with user-specific rows
4. Authenticated users can add, edit, and delete only their own rows
5. Public page can display selected public rows from Firestore

## Data model

Preferred Firestore structure:

```text
/publicRows/{rowId}
  title
  description
  visible
  createdAt
  updatedAt

/users/{uid}/rows/{rowId}
  title
  description
  createdAt
  updatedAt
```

Private user rows must be stored under the authenticated user's UID:

/users/{uid}/rows/{rowId}

Do not store private user data in a shared collection unless there is a clear reason and Security Rules are updated accordingly.

## Security model
Authorization must be enforced by Firestore Security Rules, not by frontend checks alone.
Frontend route guards and UI checks are allowed, but they are not sufficient for security.

Required security behavior:

Anyone can read public rows intended for public display
Anonymous users cannot write public rows
Anonymous users cannot read private user rows
Authenticated users can read their own private rows
Authenticated users can create, update, and delete their own private rows
Authenticated users cannot read, create, update, or delete another user's private rows

Never put private secrets in frontend code.

Forbidden in frontend code:

Firebase service account keys
Firebase Admin SDK credentials
Database passwords
Private API keys
Supabase-style service role keys
Any server-side secret

Firebase public config is allowed in frontend code.

## Auth UI strategy

Prefer FirebaseUI for common authentication flows instead of custom-built auth screens.

FirebaseUI should cover:

- email/password registration
- email/password sign-in
- Google sign-in
- GitHub sign-in
- forgot password
- common authentication errors
- account linking where supported

Do not reimplement FirebaseUI internals unless explicitly requested.

Custom app code should focus on:

- mounting FirebaseUI on the login page
- reacting to Firebase Auth state changes
- navigation after login/logout
- route protection
- Firestore data access
- Firestore Security Rules

## Free-tier constraints

Avoid features that require Firebase Blaze/pay-as-you-go unless explicitly requested.

Do not add:

Cloud Functions
Firebase App Hosting
Phone/SMS authentication
Cloud SQL
SQL Connect
Paid Google Cloud services
Custom backend server

The intended free architecture is:

GitHub Pages
+ Firebase Auth
+ Cloud Firestore
+ Firestore Security Rules

## Development approach

Use test-driven development.

For each scenario:

Write or update tests first
Keep the first implementation minimal
Make the targeted tests pass
Avoid unrelated refactoring
Avoid changing unrelated files

Prefer small, focused changes.

Do not implement multiple large scenarios in one step unless explicitly requested.

When changing code, output only:

Changed files
Brief summary
Exact command the user should run locally

Do not paste full files unless requested.

When tests fail, ask the user for the shortest relevant failure output instead of requesting full logs.

## Testing strategy
Use separate layers of tests:
Unit tests
Use unit tests for pure frontend logic:

form validation
row normalization
route state logic
UI state helpers
data mapping functions
Firebase emulator tests

Use Firebase Emulator Suite for:

Firebase Auth behavior
Firestore read/write behavior
Firestore Security Rules

Do not test against production Firebase during automated tests.

Security rules tests

Security Rules tests are mandatory for access control.

Required test cases:

anonymous user can read public rows
authenticated user can read public rows
anonymous user cannot write public rows
authenticated normal user cannot write public rows
anonymous user cannot read private rows
user A can read user A rows
user A cannot read user B rows
user A can create user A rowsFV
user A cannot create user B rows
user A can update user A rows
user A cannot update user B rows
user A can delete user A rows
user A cannot delete user B rows
End-to-end tests

Use Playwright only for important user flows:

public page loads without login
user can log in
user can view own rows
user can add a row
user can edit a row
user can delete a row
user can log out
private page is blocked or redirected when logged out

Avoid testing real Google/GitHub OAuth flows in automated E2E tests unless explicitly requested.

Prefer Firebase Auth Emulator for automated login tests.

## Implementation rules

Use modular code.

Prefer this structure unless the existing project already uses another structure:

src/
  firebase/
    app.js
    auth.js
    firestore.js
  features/
    publicRows/
      publicRows.api.js
      publicRows.ui.js
    privateRows/
      privateRows.api.js
      privateRows.ui.js
  router.js
  main.js

tests/
  unit/
  rules/
  integration/
  e2e/

Keep Firebase access functions separate from UI rendering.

Avoid mixing Firestore queries directly into DOM event handlers when a reusable API function would be clearer.

## Coding style

Use modern JavaScript modules.

Prefer explicit function names.

Avoid unnecessary dependencies.

Avoid large framework additions unless explicitly requested.

Handle errors clearly, especially:

unauthenticated access
permission denied errors
network or emulator connection issues
invalid form input

## TDD workflow for Codex

When asked to implement a scenario:

1. Identify the smallest relevant test file
2. Add or update failing tests
3. Implement the smallest code/rules change
4. Do not run tests unless explicitly requested by the user
5. Return changed files and the exact local test command for the user to run

The default workflow is:

```text
Codex writes or updates tests
Codex implements the minimum required code
Codex does not run tests
User runs tests locally
User provides compact failure output if a patch is needed
Codex patches only the failing part
```

Example response format:

Changed files:
- firestore.rules
- tests/rules/privateRows.rules.test.js

Summary:
Added rules for private user rows and tests for user-owned access.

Run:
npm run test:rules

## Important constraints

Do not create a custom backend.
Do not return database secrets to the frontend.
Do not rely on frontend-only checks for authorization.
Do not weaken Firestore Security Rules to make tests pass.
Do not use production Firebase resources in tests.
Do not add paid Firebase features unless explicitly requested.