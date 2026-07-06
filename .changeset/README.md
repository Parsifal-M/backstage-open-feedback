# Changesets

This directory contains changeset files used to track changes for release.

## Adding a changeset

Run the following command and follow the prompts to describe what changed and the semver bump type:

```bash
yarn changeset
```

This will create a new markdown file in this directory. Commit it alongside your PR.

## Releasing

When changesets are merged to `main`, a "Version Packages" PR is automatically created by CI.
Merging that PR bumps all affected package versions and updates `CHANGELOG.md` files.

Publishing to npm is done manually by running `yarn changeset publish` after the version PR is merged.
