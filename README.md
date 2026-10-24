# OddlyGo — Fun Web Expansion & Originals Polish (v28)

A pre-release discovery expansion based on the working v27 project. The Originals collection, Saved/Recent, Prism Shift daily puzzle, and Arcade Passport are retained.

## What's changed

- **53 curated experiences:** added 20 external discoveries across physics sandboxes, drawing, multiplayer party games, puzzles, music, space, wildlife, and interactive experiments. External links open in a new tab from the experience modal.
- **Web finds filter:** filter the Explore collection to external websites only; the existing Originals filter remains separate.
- **Discovery polish:** improved hover and focus feedback, reduced-motion support, and clearer section labels for external discoveries.

- **Wrong Answer Only:** expanded from 8 questions to a bank of 64. Each run shuffles the question deck and does not repeat a question until all 64 have been played. The run ends with a completion screen and can be reshuffled/replayed.
- **Wrong Answer Only records:** best streak is saved in browser local storage; completing a full run emits a game-result event for Arcade Passport.
- **Odd One Out records:** best streak is saved locally, and ending a run emits a game-result event.
- **Responsive polish:** clearer instructions, completion state, touch-sized answer controls, and mobile spacing for the longer quiz.
- No theme shop or global theme-filter changes are included.

## Run locally

```bash
npm install
npm run dev
```

## Test checklist

1. Open **Wrong Answer Only** and verify the run shows `QUESTION 1 / 64`.
2. Answer and advance through the run; no question should repeat before the 64th question.
3. Finish the run, confirm the completion screen, then replay and confirm the deck reshuffles.
4. Refresh and confirm the best streak persists.
5. Play Odd One Out until game over and check the best streak remains after refresh.
6. Smoke-test Prism Shift, Pocket Heist, Word Scramble, Memory Overload, Maze Mind, Green Light, Shape Lab, and Infinite Canvas.

Progress and best streaks are browser-local. They do not sync across devices.

## Additional checks

- The catalog has 53 unique experience IDs.
- External sites are third-party services; availability, ads, sign-in requirements, and mobile support can change independently of OddlyGo.
- Test the Web finds and Originals filters, search, sorting, Saved/Recent, external launch buttons, and each internal game before release.


## Brand refresh
This release introduces the OddlyGo orange/amber accent palette, a new planet favicon, refined header wordmark, and refreshed SEO/social metadata. Existing game logic and the Vite/Cloudflare Pages setup are preserved.
