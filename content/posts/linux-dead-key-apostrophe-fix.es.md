---
eyebrow: AI workflows · Linux
title: Un bug de tecla muerta, resuelto leyendo la tabla de Compose
lead: Escribir "I'm" en mi máquina con Ubuntu daba "Iḿ". Este es el problema, lo que le pedí a Claude Code que arreglara, y el único archivo que cambió para resolverlo.
excerpt: La tecla de apóstrofe en mi teclado de Linux componía acentos sobre consonantes, no solo sobre vocales, así que "I'm" salía como "Iḿ". Cómo Claude Code encontró el archivo exacto del sistema responsable y lo arregló con una anulación personal de tres líneas.
metaDescription: Por qué el layout de teclado intl de X11 en Ubuntu convierte "I'm" en "Iḿ", y cómo Claude Code lo diagnosticó y arregló con una anulación en ~/.XCompose.
---

## El problema

En mi máquina con Ubuntu, escribir `I'm` daba `Iḿ` en lugar de `I'm`. Escribir `it's` daba `it'ś`. La única forma de evitarlo era escribir un espacio de más después del apóstrofe y borrarlo después, algo que no pasa en mi Mac. Alterno entre las dos máquinas todo el tiempo, así que la inconsistencia era una molestia diaria.

## Lo que pedí

Uso la tecla de apóstrofe como tecla muerta a propósito, para escribir vocales acentuadas: `'` + `e` debería dar `é`, y lo mismo para á, í, ó, ú. No quería perder eso. Solo quería que dejara de hacer algo con las consonantes, y que se comportara como en macOS.

## Cómo Claude Code encontró la causa

Empezó leyendo la configuración real del teclado en lugar de adivinar:

```bash
setxkbmap -query   # layout: us, variant: intl
localectl status   # confirmado: X11 Variant: intl
```

El layout `intl` ("US International") mapea `'` a `dead_acute`. Una tecla muerta no escribe un carácter de inmediato — espera la siguiente tecla y se combina con ella, que es exactamente lo que uno quiere para las vocales.

El siguiente paso fue revisar a qué está conectada realmente esa tecla muerta en la tabla de Compose de X11 del sistema:

```bash
grep -nE "^<dead_acute> <[A-Za-z]>[[:space:]]*:" \
  /usr/share/X11/locale/en_US.UTF-8/Compose
```

Eso listó cada letra afectada por la tecla muerta — y no son solo vocales. La tabla también define combinaciones para consonantes que tienen una forma acentuada precompuesta en algún lugar de Unicode, usadas sobre todo en lenguas eslavas o sistemas de transliteración: `'`+`m` → `ḿ` (U+1E3F), `'`+`s` → `ś` (U+015B), y lo mismo para c, g, j, k, l, n, p, r, v, w, y, z. La tabla de teclas muertas de macOS está limitada a las vocales, por eso la misma costumbre de tipeo nunca causa problemas ahí.

Ese resultado del grep también explicó el workaround del espacio: la misma tabla de Compose define `<dead_acute> <space> : "'"`, así que un espacio después del apóstrofe cancela la tecla muerta y emite uno normal.

## La solución

X11 y Wayland (a través de libxkbcommon, que usan las apps GTK y Qt) leen un archivo personal `~/.XCompose` si existe, superpuesto al del sistema. La solución fue crearlo:

```
include "%L"

# Restringir dead_acute (la tecla ' en el layout intl) solo a vocales.
<dead_acute> <m> : "'m"
<dead_acute> <M> : "'M"
<dead_acute> <s> : "'s"
<dead_acute> <S> : "'S"
# ...e igual para c, g, j, k, l, n, p, r, v, w, y, z, mayúsculas y minúsculas
```

`include "%L"` trae primero el archivo de Compose del locale del sistema, así que `'`+vocal sigue produciendo á/é/í/ó/ú. Las líneas explícitas de abajo tienen prioridad para cada consonante, revirtiendo la forma compuesta a un apóstrofe simple seguido de la letra.

## Resultado

`'` + vocal sigue componiendo acentos, en mayúscula y minúscula. `'` + consonante ahora solo escribe el apóstrofe y la letra — sin marca combinada, sin necesidad de espacio de más. `I'm`, `it's` y `don't` se escriben igual que en la Mac.

## Por qué esto es un post de Claude Code, y no uno de teclados

Nada de esto fue un problema de programación. Fue una cadena de archivos del sistema — un keymap activo, un locale, una tabla de Compose tres directorios adentro de `/usr/share/X11` — que había que encontrar y leer en el orden correcto antes de que el bug real fuera visible. Ese es el tipo de fricción diaria de Linux que es fácil evitar para siempre (escribir un espacio, borrarlo, repetir) y fácil de resolver para un agente con acceso a la terminal, con solo ir y leer hasta el final. Apuntar a Claude Code en la terminal y describir el síntoma alcanzó: corrió los comandos de diagnóstico, aisló la línea exacta en el archivo exacto responsable, y escribió la anulación mínima en lugar de tocar algo a nivel de todo el sistema.
