# Spiritual Journey — job tracker

A single-page job pipeline tracker for Spiritual Journey LLC (roofing and construction).
Tracks jobs through: lead → estimate sent → scheduled → in progress → invoiced → paid.

## Stack

Plain HTML/CSS/JS, no build step. Data is stored in [Supabase](https://supabase.com) (Postgres).

## Setup

1. Create a Supabase project at supabase.com.
2. In the Supabase SQL Editor, run the contents of `schema.sql` to create the `jobs` table.
3. In Supabase, go to Project Settings > API and copy the **Project URL** and **anon public key**.
4. Open `index.html` and replace the two placeholder constants near the top of the `<script>` block:
   ```js
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   with your actual values.

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" and import the repo.
3. No build command or output directory needed — it's a static file. Click Deploy.
4. Once live, add a custom domain under the project's Domains tab whenever you're ready.

## Notes on security

The Supabase anon key is meant to be public — it's safe to ship in client-side code.
Access control is handled by the Row Level Security policy in `schema.sql`, which currently
allows any request with the anon key to read and write. That's fine for a single-user internal
tool with no public sign-up. If this ever gets a login system or multiple users, tighten the
policy in `schema.sql` to scope access by `auth.uid()`.

## Local development

Just open `index.html` in a browser, or serve it with any static file server. No install step.
