# Grocery-style auto-categorize

Status: shipped
Summary: Group a list's items by category the way a grocery list groups produce, dairy and so on.

## Details
`src/lib/autoCategorize.ts` holds a local English + Arabic keyword table that maps an item's text to a category, with no network call. `src/screens/InboxScreen.tsx` uses it to group a list's captured items by category. Captures flow in from [[Quick Add Sheet]].

## Related
- Page: [[Inbox]], [[Quick Add Sheet]]
