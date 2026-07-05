# Referral App Step-by-Step Prompt Guide

## How to use this guide

You can ask for one step at a time.

For manual setup or verification steps, I should guide you like this:

1. go to a specific Firebase or hosting screen
2. check a small set of values
3. paste the result here
4. I will validate it and give the next step

For implementation steps, each step is split into:

1. create or update tests
2. implement code to satisfy those tests

After sub-step 2, I should tell you exactly which local command to run. I should not run tests unless you explicitly ask me to.

## Conversation template

Use prompts like these:

- `Start step 1`
- `Start step 3.1`
- `Here is what I see in Firebase console: ...`
- `Tests failed for step 4.2. Here is the short output: ...`
- `Step 5 is done, move to the next step`

## Step 1. Confirm deployment target

Goal:

- decide whether this project will deploy to GitHub Pages or GitLab Pages

Why this comes first:

- Vite base path and CI config depend on it

Prompt to ask me:

`Start step 1`

Expected interaction:

- I ask you whether the target is GitHub Pages or GitLab Pages
- if already decided, I adapt the later steps to that target

Manual action:

- none required yet

## Step 2. Verify Firebase project and enabled products

Goal:

- confirm the Firebase project exists
- confirm Authentication and Firestore are enabled
- confirm the right sign-in providers are available

Prompt to ask me:

`Start step 2`

Expected interaction:

- I ask you to open Firebase Console
- I ask you to check a few exact screens and paste the result

Manual checks likely required:

- Firebase project ID
- Spark vs Blaze plan
- Authentication enabled status
- enabled sign-in methods:
  - Email/Password
  - Google
  - GitHub
- Firestore database created or not
- Firestore location

What you will paste back:

- short text summary of what you see

## Step 3. Verify Firebase web app config

Goal:

- confirm the frontend Firebase config exists and matches the Firebase project

Prompt to ask me:

`Start step 3`

Expected interaction:

- I ask you to open Project settings in Firebase Console
- I ask you to compare the Web app config fields with `.env.local`
- if needed, I ask you to paste only the non-secret identifiers that are safe to compare

Manual checks likely required:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

Note:

- Firebase web config is safe for frontend use
- do not paste anything unrelated to this check

## Step 4. Configure authorized domains and provider details

Goal:

- make sure authentication can work locally and later on the Pages domain

Prompt to ask me:

`Start step 4`

Expected interaction:

- I ask you to open Authentication settings
- I ask you to check Authorized domains
- I ask you to confirm provider-specific configuration

Manual checks likely required:

- localhost domain present
- production Pages domain added later if needed
- Google provider enabled
- GitHub provider enabled and configured

Possible manual setup:

- for GitHub login, you may need to create a GitHub OAuth app and copy:
  - client ID
  - client secret

If GitHub provider is incomplete:

- I should stop and guide that setup before moving on

## Step 5. Confirm Firestore security model baseline

Goal:

- verify the current Firestore structure and rules still match the intended architecture

Prompt to ask me:

`Start step 5`

Expected interaction:

- I inspect the current `firestore.rules`
- I tell you whether the current baseline is acceptable
- if manual Firestore setup is missing, I ask you to create the database in test mode or production mode as appropriate for the project stage

Manual checks likely required:

- Firestore database exists
- Native mode is used

Current intended model:

```text
/publicRows/{rowId}
/users/{uid}/rows/{rowId}
```

## Step 6. Public home route

Goal:

- default route should be public
- anonymous visitors can stay on home
- profile route should be protected

Prompt to ask me:

`Start step 6.1`

### Step 6.1. Tests first

What I should do:

- add or update route tests for:
  - anonymous user can access home
  - anonymous user is redirected away from profile
  - authenticated user can access home
  - authenticated user can access profile

Expected output from me:

- changed files
- brief summary
- exact command for you to run locally

Then ask me:

`Start step 6.2`

### Step 6.2. Implement without running tests

What I should do:

- update router and app rendering to support:
  - public home route
  - protected profile route
  - logout returns to home

Expected output from me:

- changed files
- brief summary
- exact command for you to run locally

Recommended local command:

- `npm test`

## Step 7. Public home UI shell

Goal:

- build the main page structure before data wiring

Prompt to ask me:

`Start step 7.1`

### Step 7.1. Tests first

What I should do:

- add or update UI-oriented tests for home-page state logic where practical

Then ask me:

`Start step 7.2`

### Step 7.2. Implement without running tests

What I should do:

- add public home layout with:
  - app title
  - login/register area
  - logout button for signed-in user
  - button to open profile when signed in
  - buttons for public data loading
  - placeholder public data area

Recommended local command:

- `npm test`

## Step 8. Public data read feature

Goal:

- anonymous and authenticated users can fetch public rows

Prompt to ask me:

`Start step 8.1`

### Step 8.1. Tests first

What I should do:

- add unit tests for public row mapping or rendering logic
- add or update rules tests only if the data model changes

Then ask me:

`Start step 8.2`

### Step 8.2. Implement without running tests

What I should do:

- create:
  - `src/features/publicRows/publicRows.api.js`
  - `src/features/publicRows/publicRows.ui.js`
- load public rows from Firestore
- render visible public rows on the home page

Recommended local commands:

- `npm test`
- `npm run test:rules`

## Step 9. Personal profile UI shell

Goal:

- authenticated users can open a profile page prepared for CRUD

Prompt to ask me:

`Start step 9.1`

### Step 9.1. Tests first

What I should do:

- add tests for profile route behavior and any extracted state helpers

Then ask me:

`Start step 9.2`

### Step 9.2. Implement without running tests

What I should do:

- add profile view with:
  - signed-in user info
  - empty-state private rows area
  - add-row form shell

Recommended local command:

- `npm test`

## Step 10. Create private rows

Goal:

- signed-in user can create their own private row

Prompt to ask me:

`Start step 10.1`

### Step 10.1. Tests first

What I should do:

- add unit tests for validation or input mapping
- add rules tests if needed for create behavior changes

Then ask me:

`Start step 10.2`

### Step 10.2. Implement without running tests

What I should do:

- create `privateRows.api.js` and `privateRows.ui.js` if not already created
- implement create form submission
- write only under `/users/{uid}/rows/{rowId}`

Recommended local commands:

- `npm test`
- `npm run test:rules`

## Step 11. Read private rows

Goal:

- signed-in user can list their own private rows

Prompt to ask me:

`Start step 11.1`

### Step 11.1. Tests first

What I should do:

- add unit tests for row rendering or mapping logic

Then ask me:

`Start step 11.2`

### Step 11.2. Implement without running tests

What I should do:

- load current user's rows from Firestore
- render them in profile view

Recommended local command:

- `npm test`

## Step 12. Update private rows

Goal:

- signed-in user can edit their own row

Prompt to ask me:

`Start step 12.1`

### Step 12.1. Tests first

What I should do:

- add unit tests for edit state or update payload mapping

Then ask me:

`Start step 12.2`

### Step 12.2. Implement without running tests

What I should do:

- add edit controls
- update the selected row in the authenticated user's collection

Recommended local commands:

- `npm test`
- `npm run test:rules`

## Step 13. Delete private rows

Goal:

- signed-in user can delete their own row

Prompt to ask me:

`Start step 13.1`

### Step 13.1. Tests first

What I should do:

- add unit tests for delete state handling if needed

Then ask me:

`Start step 13.2`

### Step 13.2. Implement without running tests

What I should do:

- add delete action in profile UI
- delete only from the authenticated user's collection

Recommended local commands:

- `npm test`
- `npm run test:rules`

## Step 14. Review Firebase Console settings for production

Goal:

- prepare auth and Firestore for deployed usage

Prompt to ask me:

`Start step 14`

Expected interaction:

- I ask you to verify:
  - authorized production domain
  - provider status
  - Firestore rules deployed later when ready

Manual checks likely required:

- Pages domain added to Authorized domains
- GitHub OAuth app callback URL updated if GitHub auth is used

## Step 15. Configure static deployment

Goal:

- make the Vite app deploy cleanly to the selected Pages platform

Prompt to ask me:

`Start step 15.1`

### Step 15.1. Tests first

Usually:

- no tests needed unless deployment-related code changes affect routing behavior

Then ask me:

`Start step 15.2`

### Step 15.2. Implement without running tests

What I should do:

- add deployment config for GitHub Pages or GitLab Pages
- adjust Vite base path if required

Recommended local command:

- `npm run build`

## Step 16. Final manual Firebase checks before release

Goal:

- ensure the deployed app can authenticate and use Firestore correctly

Prompt to ask me:

`Start step 16`

Expected interaction:

- I give you a short checklist for final console verification
- you paste back only the relevant results if something looks wrong

## Working rules for future implementation prompts

When you ask me to execute a code step, I should:

1. work only on the current step
2. avoid unrelated refactors
3. create or update tests first
4. implement second
5. not run tests unless you explicitly ask
6. tell you the exact local command to run
7. if tests fail, ask you only for the shortest relevant failure output

## Recommended starting point

Ask next:

`Start step 1`
