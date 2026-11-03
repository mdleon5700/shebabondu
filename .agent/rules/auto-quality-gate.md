<!-- quality-gate -->
# Automated Pre-Flight & Quality Gate Rules

For every code change, prompt response, or feature implementation in Next.js / TypeScript projects:

1. **Always Type-Check Automatically**: Before completing any coding task or committing code, always execute `npm run typecheck` (`tsc --noEmit`). Zero TypeScript errors are permitted.
2. **Defensive Property Access**: Never assume an optional property exists on an object (e.g. `obj.slug`). Always provide fallback values (`(obj as any).slug || obj.id || fallback`).
3. **Route & 404 Protection**: Ensure every dynamic route (`[...slug]`, `[id]`) handles null/undefined params and has a graceful fallback redirect or friendly UI instead of hard unhandled exceptions.
4. **Browser & UI Verification**: When modifying UI components or routing, verify that pages render with HTTP 200 and zero console errors using `npm run test:browser` or Playwright.
5. **Zero Broken Commits**: Git pre-push and pre-commit hooks will abort any push containing type or compile errors. Always confirm clean builds before pushing to remote repository.
<!-- quality-gate -->

