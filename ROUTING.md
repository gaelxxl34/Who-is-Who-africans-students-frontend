# Routing in Who Is Who Frontend

## Important: Router Configuration

This project uses the **Pages Router** (pages directory) for routing, not the newer App Router.

### Common Issues

If you encounter this error:
```
Error: App Router and Pages Router both match path: /
Next.js does not support having both App Router and Pages Router routes matching the same path.
```

Follow these steps to fix it:

1. Make sure there is no `app` directory in your project, or if there is, it doesn't contain route files (page.js, layout.js, etc.)
2. Ensure all your routes are defined in the `pages` directory
3. In `next.config.js`, set `experimental.appDir: false`

### Project Structure

- All routes should be defined in the `src/pages` directory
- Components should be placed in `src/components`
- No routing components should be placed in `src/app` (if it exists)

This configuration ensures compatibility and prevents routing conflicts.
