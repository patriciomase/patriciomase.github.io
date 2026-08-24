---
publishedAt: 2026-08-24
readMinutes: 4
status: published
eyebrow: Linux · GNOME
title: Disabling the Bluetooth toggle in GNOME's Quick Settings
lead: The Bluetooth icon in Ubuntu's top-right system menu turns Bluetooth off on a single click, with no confirmation. Here is the extension that disables that click while leaving the menu it opens untouched.
excerpt: A small GNOME Shell extension that blocks the click-to-toggle body of the Quick Settings Bluetooth button, so it can no longer disconnect Bluetooth by accident, while the caret that opens the device menu keeps working.
metaDescription: How to disable the click-to-toggle body of the Bluetooth quick toggle in GNOME Shell 46 on Ubuntu 24.04, with a small local extension, while keeping the device menu caret working.
---

## The problem

Ubuntu 24.04, GNOME Shell 46. The top-right system menu (GNOME calls it Quick Settings) has a Bluetooth button. It is two things stacked into one control:

- A larger clickable area on the left that toggles Bluetooth on or off immediately, with no confirmation.
- A small arrow on the right that opens the device/pairing submenu.

Clicking anywhere on the left side turns Bluetooth off. It is easy to hit by accident when you meant to open the device list, and there is no undo prompt. The goal was to disable that accidental-click behavior without touching the menu functionality.

## Locating the control in GNOME Shell's source

GNOME Shell's Quick Settings toggles are defined in `resource:///org/gnome/shell/ui/quickSettings.js`. The Bluetooth entry is a `BluetoothToggle`, which extends `QuickMenuToggle`. A `QuickMenuToggle` is built from two sibling actors inside its `_box`:

- An inner `QuickToggle` — the clickable body. Clicking it calls the underlying client's `toggleActive()`.
- `_menuButton` — the caret. Clicking it opens the popup menu.

These two are independent Clutter actors with independent event handling. That matters: it means the click behavior of the body can be intercepted without touching `_menuButton`, and without modifying GNOME Shell itself.

## Approach

Patching GNOME Shell's own files is not a good target — it gets overwritten on every shell update. The alternative is a small local extension that, once the panel is built, finds the Bluetooth toggle's body actor and stops its click and touch events from propagating. `Clutter.EVENT_STOP` in a `button-press-event` or `touch-event` handler prevents the actor's own click behavior from firing, without removing the actor or disabling it visually.

The panel's Quick Settings toggles live in a grid, `Main.panel.statusArea.quickSettings.menu._grid`. The extension does two things on `enable()`: it walks that grid's existing children once, and it listens for `child-added` so a toggle rebuilt later (e.g. after a Bluetooth adapter is added/removed) still gets caught.

## The extension

Two files, no build step, no dependencies.

`metadata.json`:

```json
{
  "uuid": "bluetooth-toggle-guard@local",
  "name": "Bluetooth Toggle Guard",
  "description": "Disables the click-to-toggle main body of the built-in Bluetooth quick settings button (so it can't disconnect Bluetooth by accident) while leaving the arrow that opens the device/pairing menu fully working.",
  "shell-version": ["46"],
  "url": ""
}
```

`extension.js`:

```js
import Clutter from 'gi://Clutter';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { QuickToggle, QuickMenuToggle } from 'resource:///org/gnome/shell/ui/quickSettings.js';

export default class BluetoothToggleGuardExtension extends Extension {
    enable() {
        this._grid = Main.panel.statusArea.quickSettings.menu._grid;
        this._handlers = new Map(); // contents actor -> signal ids

        this._childAddedId = this._grid.connect('child-added',
            (_grid, child) => this._maybeGuard(child));
        for (const child of this._grid.get_children())
            this._maybeGuard(child);
    }

    _maybeGuard(toggle) {
        if (!(toggle instanceof QuickMenuToggle) || toggle.constructor.name !== 'BluetoothToggle')
            return;

        const contents = toggle._box?.get_children().find(
            child => child !== toggle._menuButton && child instanceof QuickToggle);
        if (!contents || this._handlers.has(contents))
            return;

        const ids = [
            contents.connect('button-press-event', () => Clutter.EVENT_STOP),
            contents.connect('touch-event', () => Clutter.EVENT_STOP),
            contents.connect('destroy', () => this._handlers.delete(contents)),
        ];
        this._handlers.set(contents, ids);
    }

    disable() {
        this._grid.disconnect(this._childAddedId);
        this._childAddedId = null;

        for (const [contents, ids] of this._handlers) {
            if (contents.get_stage()) {
                for (const id of ids)
                    contents.disconnect(id);
            }
        }
        this._handlers = null;
        this._grid = null;
    }
}
```

`_maybeGuard` filters for `QuickMenuToggle` instances whose constructor name is `BluetoothToggle` — that excludes the other quick toggles (Wi-Fi, power profiles, night light, etc.), which are not menu toggles or are a different class. It then picks out the child of `_box` that is a `QuickToggle` and is not `_menuButton` — that is the clickable body. Handlers are tracked in a `Map` keyed by that actor so the same one is never wired twice, and removed from the map on `destroy` so a rebuilt toggle gets re-guarded rather than skipped.

`disable()` reverses everything explicitly: disconnects the `child-added` listener and every stored handler (guarding with `get_stage()` in case the actor was already destroyed), then drops the references.

## Installing it

GNOME Shell extensions with no metadata in the official repository can be loaded from a local directory named after their UUID:

```bash
mkdir -p ~/.local/share/gnome-shell/extensions/bluetooth-toggle-guard@local
# create metadata.json and extension.js in that directory with the contents above
```

Then enable it:

```bash
gnome-extensions enable bluetooth-toggle-guard@local
```

On Wayland, a brand-new extension directory is only picked up by a fresh GNOME Shell process, so the first `enable` after creating the files needs a log out/log in (there is no "Restart Shell" action under Wayland the way there is under X11).

## Verification

```bash
gnome-extensions info bluetooth-toggle-guard@local
```

```
bluetooth-toggle-guard@local
  Name: Bluetooth Toggle Guard
  Path: /home/pato/.local/share/gnome-shell/extensions/bluetooth-toggle-guard@local
  Enabled: Yes
  State: ACTIVE
```

With the extension active, clicking the body of the Bluetooth button in Quick Settings does nothing — Bluetooth stays in whatever state it was in. Clicking the small arrow still opens the device/pairing submenu as before, and Bluetooth can still be turned on or off from inside that submenu or from Settings → Bluetooth.

To remove the change: `gnome-extensions disable bluetooth-toggle-guard@local`, or delete the extension directory entirely.
