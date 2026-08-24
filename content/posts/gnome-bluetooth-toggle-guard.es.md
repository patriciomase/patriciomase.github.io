---
eyebrow: Linux · GNOME
title: Deshabilitar el toggle de Bluetooth en Quick Settings de GNOME
lead: El ícono de Bluetooth del menú superior derecho de Ubuntu apaga el Bluetooth con un solo clic, sin confirmación. Esta es la extensión que deshabilita ese clic sin tocar el menú que abre.
excerpt: Una pequeña extensión de GNOME Shell que bloquea el cuerpo clickeable del botón de Bluetooth en Quick Settings, para que no pueda desconectar el Bluetooth por accidente, dejando intacta la flecha que abre el menú de dispositivos.
metaDescription: Cómo deshabilitar el cuerpo clickeable del toggle de Bluetooth en GNOME Shell 46 sobre Ubuntu 24.04, con una extensión local, sin afectar la flecha que abre el menú de dispositivos.
---

## El problema

Ubuntu 24.04, GNOME Shell 46. El menú superior derecho (Quick Settings, en la terminología de GNOME) tiene un botón de Bluetooth compuesto por dos controles en uno:

- Un área clickeable grande, a la izquierda, que apaga o prende el Bluetooth de inmediato, sin confirmación.
- Una flecha pequeña, a la derecha, que abre el submenú de dispositivos y emparejamiento.

Hacer clic en cualquier parte del lado izquierdo apaga el Bluetooth. Es fácil de tocar por error cuando la intención era abrir la lista de dispositivos, y no hay forma de deshacerlo. El objetivo era deshabilitar ese clic accidental sin afectar el resto de la funcionalidad del menú.

La extensión está en GitHub: [patriciomase/gnome-bluetooth-toggle-guard](https://github.com/patriciomase/gnome-bluetooth-toggle-guard).

## Ubicar el control en el código de GNOME Shell

Los toggles de Quick Settings de GNOME Shell están definidos en `resource:///org/gnome/shell/ui/quickSettings.js`. La entrada de Bluetooth es un `BluetoothToggle`, que extiende `QuickMenuToggle`. Un `QuickMenuToggle` se arma con dos actores hermanos dentro de su `_box`:

- Un `QuickToggle` interno — el cuerpo clickeable. Al hacer clic llama a `toggleActive()` del cliente subyacente.
- `_menuButton` — la flecha. Al hacer clic abre el menú popup.

Son dos actores de Clutter independientes, con manejo de eventos independiente. Eso es clave: significa que se puede interceptar el clic del cuerpo sin tocar `_menuButton`, y sin modificar GNOME Shell.

## Enfoque

Parchear los archivos de GNOME Shell no es un buen objetivo: se pisan con cada actualización del shell. La alternativa es una extensión local pequeña que, una vez armado el panel, encuentra el actor del cuerpo del toggle de Bluetooth y detiene la propagación de sus eventos de clic y touch. `Clutter.EVENT_STOP` en un handler de `button-press-event` o `touch-event` evita que se dispare el comportamiento propio del actor, sin quitarlo ni deshabilitarlo visualmente.

Los toggles de Quick Settings viven en una grilla, `Main.panel.statusArea.quickSettings.menu._grid`. La extensión hace dos cosas en `enable()`: recorre una vez los hijos existentes de esa grilla, y escucha `child-added` para que un toggle reconstruido más tarde (por ejemplo, tras agregar o quitar un adaptador Bluetooth) también quede cubierto.

## La extensión

Dos archivos, sin build ni dependencias.

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

`_maybeGuard` filtra instancias de `QuickMenuToggle` cuyo nombre de constructor sea `BluetoothToggle` — eso excluye al resto de los quick toggles (Wi-Fi, perfiles de energía, luz nocturna, etc.), que no son menu toggles o son de otra clase. Después identifica, entre los hijos de `_box`, el que es un `QuickToggle` y no es `_menuButton` — ese es el cuerpo clickeable. Los handlers se guardan en un `Map` indexado por ese actor para no engancharlo dos veces, y se quitan del mapa en `destroy` para que un toggle reconstruido vuelva a protegerse en vez de quedar sin cubrir.

`disable()` revierte todo explícitamente: desconecta el listener de `child-added` y cada handler guardado (verificando `get_stage()` por si el actor ya fue destruido), y después suelta las referencias.

## Instalación

Las extensiones de GNOME Shell sin metadata en el repositorio oficial se pueden cargar desde un directorio local nombrado con su UUID:

```bash
git clone https://github.com/patriciomase/gnome-bluetooth-toggle-guard.git
mkdir -p ~/.local/share/gnome-shell/extensions/bluetooth-toggle-guard@local
cp gnome-bluetooth-toggle-guard/{extension.js,metadata.json} \
   ~/.local/share/gnome-shell/extensions/bluetooth-toggle-guard@local/
```

Después habilitarla:

```bash
gnome-extensions enable bluetooth-toggle-guard@local
```

En Wayland, un directorio de extensión recién creado solo lo detecta un proceso nuevo de GNOME Shell, así que el primer `enable` después de crear los archivos requiere cerrar sesión y volver a entrar (en Wayland no existe la acción "Reiniciar Shell" que sí existe en X11).

## Verificación

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

Con la extensión activa, hacer clic en el cuerpo del botón de Bluetooth en Quick Settings no hace nada — el Bluetooth queda en el estado en que estaba. La flecha pequeña sigue abriendo el submenú de dispositivos como antes, y el Bluetooth se puede prender o apagar desde ese submenú o desde Configuración → Bluetooth.

Para revertir el cambio: `gnome-extensions disable bluetooth-toggle-guard@local`, o borrar directamente el directorio de la extensión.
