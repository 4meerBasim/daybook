# Swipe Row Actions

Status: shipped
Summary: Dragging a task row reveals complete, snooze, pick-date and delete actions, each committed at a different fraction of the row width.

## Details
`src/components/SwipeableRow.tsx`, built on `react-native-gesture-handler`'s `Gesture.Pan`. On release the translation is normalised to a fraction of the row width and matched against four thresholds:

| Direction | Threshold | Action |
|---|---|---|
| Leading | 40% (`DONE`) | complete |
| Trailing | 30% (`SNOOZE`) | snooze to tomorrow |
| Trailing | 55% (`PICK`) | pick date |
| Trailing | 70% (`DELETE`) | delete |

Three absolutely positioned action layers sit behind the row face and cross-fade by opacity as the drag progresses — moss for complete, blue for the two scheduling actions, vermilion for delete, so the destructive layer only appears past 70%. The row always settles back to zero after release.

Direction is mirrored by a `sign` derived from `rtl`, so "leading" is a right-drag in English and a left-drag in Arabic. `activeOffsetX([-12, 12])` with `failOffsetY([-10, 10])` keeps vertical list scrolling intact. A simultaneous `Gesture.LongPress` at 320ms lifts the row onto `paper2` for reordering. Every threshold crossing fires a medium impact haptic; under [[Reduced Motion Mode]] the settle is an instant assignment instead of a timed spring.

Mounted on every task row of [[Project Detail]], which is where tasks are listed since [[Project Grouped Tasks]] turned the tabs into project lists — so it now covers Upcoming and Inbox tasks as well as today's. Complete calls `toggle(id)`; snooze and delete call `clear(id)`, which takes the task out of `useTasks()` and so off every page; pick-date opens [[Calendar]]; the long-press opens [[Task Detail]]. The wrapper owns the row height, the ledger rule and the clipping; `TaskRow` is `flex: 1` inside the sliding face and declares no height or border of its own, so the rule stays printed on the paper while the face slides over it. Sizing the row in both places would overhang the wrapper's border by a pixel and let a completed row's paper background paint out its own rule.

The face is transparent at rest so the red margin line shows through, and only turns opaque paper once the drag starts, which is what hides the action layers between gestures.

The same four actions are exposed to screen readers as `accessibilityActions` on the row, so VoiceOver can reach them from the rotor without performing the gesture. The action layers themselves are held out of the accessibility tree with `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"` — Android does not exclude zero-opacity views on its own, so TalkBack would otherwise read four phantom labels per row.

Pan and long-press are composed with `Gesture.Race`, not `Simultaneous`: a hold that has already navigated must not also commit a swipe when the finger lifts. `onEnd` checks the gesture's success flag before committing, so a pan cancelled by backgrounding or by a parent handler settles back to zero instead of completing or deleting the task.

The thresholds are documented on-screen by the annotation rows in [[Swipe States]], whose copy lives in `src/i18n/strings.ts` as `swipe1`–`swipe4`. That screen draws its own static illustration rather than driving this component, so the reference rows cannot be knocked out of position by a stray touch.

## Related
- Page: [[Project Detail]], [[Swipe States]], [[Settings]], [[Calendar]], [[Task Detail]]
- Features: [[Project Grouped Tasks]], [[Reduced Motion Mode]], [[In-App RTL and Arabic Typography]], [[Ink Strike-Through Completion]]
- Bugs: [[Swipe Actions Not Wired Into Task Lists]]
