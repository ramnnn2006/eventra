# Eventra

Event report generator for Microsoft Innovations Club, VIT Chennai.

## What it does

- Walk through a step-by-step form with your event details, and it spits out a formatted Word doc matching VIT's official report template.
- Smart Fill: describe your event in plain text or voice, and the form fills itself using Groq LLM. No manual entry needed.
- Upload a CSV for attendance. Columns get auto-mapped so you don't have to reformat anything.
- Admin panel for managing coordinators, venues, event types, and templates.

## Tech stack

- Vite 5
- React
- Vanilla CSS
- Groq API (LLaMA 3.3 70B)
- Docxtemplater + PizZip
- PapaParse
- Lucide React
- Convex (optional backend)

## Getting started

```bash
git clone https://github.com/ramnnn2006/reporter.git
cd reporter
npm install
npm run dev
```

Create a `.env` file if you need these:

```
VITE_GROQ_API_KEY=your_key_here
VITE_CONVEX_URL=your_convex_url_here
```

Both are optional. The Groq key has a built-in fallback, and the app works fine without Convex.

## Deployment

```bash
npm run build
```

Works on Vercel out of the box.

If you're using Convex:

```bash
npx convex deploy
```

Then add `VITE_CONVEX_URL` to your hosting provider's environment variables.

## Project structure

```
src/App.jsx          - everything (single-file app)
src/index.css        - all styles
public/template.docx - report template
convex/              - optional Convex backend
```
