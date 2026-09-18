# Onboarding

Route: `Onboarding` (native stack, initial route)
Summary: First-run title page that states the app's three rules, lets the user pick English or Arabic, and hands off to the tab shell.

## Related
- Connects to: [[Main Tabs]] — the "Start writing" button calls `navigation.replace('Main')`, so onboarding is removed from the stack and cannot be returned to
- Features: [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: none found
- Enhancements: none

## Notes
`src/screens/OnboardingScreen.tsx`. The English / العربية pair calls `setLang` directly, so the whole app flips script, typeface and direction before the user ever reaches a task list.
