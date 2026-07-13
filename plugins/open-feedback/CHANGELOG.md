# Changelog

## 1.0.2

### Patch Changes

- 0220bbb: Bumps common package

All notable changes to this project will be documented in this file.

## 1.0.0

### Major Changes

**Migrated to the Backstage New Frontend System (NFS)**

The plugin has been fully migrated from `@backstage/core-plugin-api` to `@backstage/frontend-plugin-api`. This is a breaking change — the plugin now requires a New Frontend System app to function.

- `createFrontendPlugin` replaces `createPlugin`; the plugin is now a default export
- `ApiBlueprint`, `PageBlueprint`, and `SubPageBlueprint` replace the old `createRoutableExtension`/`createComponentExtension` pattern
- The `openFeedbackPlugin` named export has been removed; import the default export instead
- The `OpenFeedbackPage` named export has been removed; the page is now registered via `PageBlueprint` with two `SubPageBlueprint` sub-pages (`ActiveFeedbackContent` and `ArchivedFeedbackContent`), which are mounted at `/open-feedback/active` and `/open-feedback/archived` respectively
- `createApiRef` now uses the `.with({ id, pluginId })` form required by the new system
- Route refs now use `createRouteRef()` from `@backstage/frontend-plugin-api` (no `id` string required)

### Minor Changes

- Replaced `alertApiRef` with `toastApiRef` for error notifications, updating the message shape (`message`/`severity` → `title`/`status: 'danger'`)
- Replaced `@mui/material` imports (MUI v5) with `@material-ui/lab` equivalents (Rating, Skeleton) and `@material-ui/icons` to align with the MUI v4 constraint across the plugin
- Plugin now declares a `title` ("Open Feedback") and an icon (`ThumbUpAltIcon`) used by the new frontend system shell

## 0.8.1

### Minor Changes

Feedback comments are now unlimited in length, the comment field in the frontend has been updated to support this.
