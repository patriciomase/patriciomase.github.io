---
publishedAt: 2026-08-25
readMinutes: 3
status: published
eyebrow: AI workflows · Linux
title: A dead-key bug, fixed by reading the Compose table
lead: Typing "I'm" on my Ubuntu machine produced "Iḿ". Here is the problem, what I asked Claude Code to fix, and the one file it changed to solve it.
excerpt: The apostrophe key on my Linux keyboard was composing accents on consonants, not just vowels, so "I'm" came out as "Iḿ". How Claude Code found the exact system file responsible and fixed it with a three-line personal override.
metaDescription: Why the intl X11 keyboard layout on Ubuntu turns "I'm" into "Iḿ", and how Claude Code diagnosed and fixed it with a ~/.XCompose override.
---

## The problem

On my Ubuntu machine, typing `I'm` produced `Iḿ` instead of `I'm`. Typing `it's` produced `it'ś`. The only workaround was to type an extra space after the apostrophe and delete it afterward, which is not how it behaves on my Mac. I switch between the two machines constantly, so the inconsistency was a daily annoyance.

## What I asked for

I use the apostrophe key as a dead key on purpose, to type accented vowels: `'` + `e` should give `é`, and the same for á, í, ó, ú. I did not want to lose that. I just wanted it to stop doing anything to consonants, and behave like it does on macOS.

## How Claude Code found the cause

It started by reading the actual keyboard configuration rather than guessing:

```bash
setxkbmap -query   # layout: us, variant: intl
localectl status   # confirmed: X11 Variant: intl
```

The `intl` ("US International") layout maps `'` to `dead_acute`. A dead key does not type a character immediately — it waits for the next keystroke and combines with it, which is exactly what you want for vowels.

The next step was checking what that dead key is actually wired to in the system's X11 Compose table:

```bash
grep -nE "^<dead_acute> <[A-Za-z]>[[:space:]]*:" \
  /usr/share/X11/locale/en_US.UTF-8/Compose
```

That listed every letter the dead key affects — and it is not just vowels. The table also defines combinations for consonants that happen to have a precomposed accented form somewhere in Unicode, mostly used by Slavic or transliteration systems: `'`+`m` → `ḿ` (U+1E3F), `'`+`s` → `ś` (U+015B), and the same for c, g, j, k, l, n, p, r, v, w, y, z. macOS's dead-key table is scoped to vowels only, which is why the same keyboard habit never causes trouble there.

That grep result also explained the space workaround: the same Compose table defines `<dead_acute> <space> : "'"`, so a space after the apostrophe cancels the dead key and emits a plain one.

## The fix

X11 and Wayland (via libxkbcommon, used by GTK and Qt apps) read a personal `~/.XCompose` file if it exists, layered on top of the system one. The fix was to create it:

```
include "%L"

# Restrict dead_acute (the ' key under the intl layout) to vowels only.
<dead_acute> <m> : "'m"
<dead_acute> <M> : "'M"
<dead_acute> <s> : "'s"
<dead_acute> <S> : "'S"
# ...and the same for c, g, j, k, l, n, p, r, v, w, y, z, upper and lower
```

`include "%L"` pulls in the system locale's Compose file first, so `'`+vowel still produces á/é/í/ó/ú. The explicit lines after it win for every consonant, overriding the composed form back to a plain apostrophe followed by the letter.

## Result

`'` + vowel still composes accents, upper and lower case. `'` + consonant now just types the apostrophe and the letter — no combining mark, no extra space needed. `I'm`, `it's`, and `don't` type the same way they do on the Mac.

## Why this is a Claude Code post, not a keyboard post

Nothing here was a programming problem. It was a chain of system files — an active keymap, a locale, a Compose table three directories deep in `/usr/share/X11` — that had to be found and read in the right order before the actual bug was visible. That is the kind of daily Linux friction that is easy to work around forever (type a space, delete it, repeat) and easy for an agent with shell access to just go and read to the end. Pointing Claude Code at the terminal and describing the symptom was enough; it ran the diagnostic commands, isolated the exact line in the exact file responsible, and wrote the minimal override rather than touching anything system-wide.
