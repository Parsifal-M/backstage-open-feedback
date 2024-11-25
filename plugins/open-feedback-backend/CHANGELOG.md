# Changelog

All notable changes to this project will be documented in this file.

## 0.4.0

### Major Changes

We now use the whole user entity ref instead of the users display name when saving feedback, this is a major change and will require a migration to update the feedback table, I recommend deleting any current feedback you have before updating to this version. As it will not work correctly with the old feedback.

Feedback comments are now unlimited in length, the comment field in the frontend has been updated to support this.
