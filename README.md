<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1QFxeKIclqbpgg8eAhjUZ8jMCEwEHjFx0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Course generator environment

The course generator defaults to Gemini and can optionally test other providers:

- `GEMINI_API_KEY`: required for Gemini generation and PDF file fallback.
- `COURSE_AI_PROVIDER`: `gemini`, `openrouter`, or `nvidia` (defaults to `gemini`).
- `COURSE_AI_FALLBACK_PROVIDER`: fallback provider if the selected provider fails (defaults to `gemini`).
- `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`: required when `COURSE_AI_PROVIDER=openrouter`.
- `NVIDIA_API_KEY` and `NVIDIA_MODEL`: required when `COURSE_AI_PROVIDER=nvidia`.

PDF and `.docx` files are converted to text server-side before generation when possible. Scanned PDFs may fall back to Gemini File API if text extraction is too weak.

Nanocourse email campaigns are stored as local drafts in the course data. This prototype does not send email automatically yet.
