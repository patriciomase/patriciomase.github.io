---
eyebrow: Flujos con IA · Linux
title: Claude Code resucitando una impresora Xerox
lead: "Una impresora láser que no producía nada y daba todos los trabajos por terminados. Ya me había enfrentado dos veces al problema sin resolverlo. La tercera abrí Claude Code en una terminal y le cedí el control. La falla que terminó encontrando era una que ningún comando ejecutado en el servidor podría haberle mostrado."
excerpt: "Una Xerox Phaser 3020 que no imprimía nada y daba cada trabajo por exitoso. Cómo la depuré con Claude Code, el diagnóstico equivocado que hizo con absoluta seguridad y el mensaje impreso en una hoja que solo yo podía leer."
metaDescription: "Cómo depuré una Xerox Phaser 3020 en Ubuntu 24.04 con Claude Code: por qué CUPS informaba que todo había salido bien ante una falla total, un diagnóstico convincente pero equivocado y la página de error del firmware que resolvió el misterio."
---

## Un éxito que no lo era

Tengo una Xerox Phaser 3020 colgada del equipo con Ubuntu 24.04 que corre la casa. No imprimía nada. No mal — nada. Ruidos mecánicos cortos, un ciclo de alimentación, una hoja en blanco. Y todos los trabajos aparecían en CUPS como `completed`.

Eso es peor que un error. Un error te da un string para buscar. Un éxito que no lo es no te da nada, y encima sugiere en voz baja que el problema está en algún lado donde no estás mirando.

Ya había rebotado dos veces contra esto, las dos buscando el síntoma y aplicando el fix con más votos. La tercera abrí [Claude Code](/blog/claude-code-on-a-3d-printer) en una terminal de esa máquina y lo dejé manejar.

## Por qué una impresora es un problema ideal para un agente

Nada de esto es un problema de programación. Se trata de ejecutar un comando y leer el resultado, justo el tipo de tarea que estas herramientas hacen bien:

```bash
lsusb                       # 0924:42d5, serie 3434417634
lpstat -l -p Phaser-3020    # estado de la cola e interfaz asociada
lpoptions -p Phaser-3020    # device-uri, make-and-model, PPD en uso
```

CUPS funciona con texto de punta a punta: una cadena de filtros, un PPD, un registro, un archivo de configuración. Todo lo que necesitaba saber ya estaba del otro lado de la terminal. Simplemente no había sido sistemático al preguntar.

## Lo primero útil que hizo fue tirar mi evidencia a la basura

Arranqué contándole lo que sabía: los trabajos se completan, no imprime nada, el `error_log` está limpio. Esperaba que empezara a proponer drivers.

En cambio, empezó por desmontar esa señal de éxito. Un trabajo `completed` en CUPS significa que **la cadena de filtros se ejecutó y el backend escribió bytes en el dispositivo sin errores**. No dice nada acerca de si el dispositivo interpretó esos bytes o siquiera movió el papel. Por la misma razón, el `error_log` queda limpio durante una falla total: el problema ocurre después de todo lo que queda registrado.

Después ordenó las señales que quedaban, y eso fue lo verdaderamente útil:

| Señal | Qué establece |
| --- | --- |
| Salida física | Si el dispositivo parseó el stream. La única evidencia directa. |
| Número de dispositivo USB en `lsusb` | Un dispositivo que se renumera a mitad de trabajo se reinició. |
| Estado de la cola en `lpstat` | Si el backend perdió el dispositivo. |
| Cadena de filtros en `error_log` | Qué driver corrió realmente. No si era el correcto. |

El resultado era revelador: la única evidencia directa de toda la tabla era una hoja en una bandeja, en otra habitación, y el agente no podía verla. Esa tabla terminó siendo el hilo conductor de toda la sesión.

## Falla 1 — el driver que eligió Ubuntu

Sacó el PPD que estaba efectivamente asociado a la cola y encontró un perfil de Phaser **3010** manejando el filtro `foo2hbpl2`. Ese filtro emite **HBPL**, en color. El dispositivo es monocromo y habla únicamente **SPL** de Samsung.

También explicó por qué el error es tan silencioso, y esa explicación era lo que me había faltado durante dos fines de semana. La 3020 es una impresora **basada en el host**: GDI, una Winprinter. No tiene un intérprete PostScript ni PCL. No puede renderizar una descripción de página; el equipo convierte la página en una imagen y envía un flujo de datos en el formato del fabricante. Por eso no alcanza con que el controlador sea «más o menos» correcto. En un dispositivo PostScript, un PPD apenas equivocado produce una página apenas equivocada. Acá, un controlador incorrecto genera bytes que el dispositivo no puede interpretar en absoluto, y la falla es binaria: una hoja en blanco o nada.

Varios megabytes de HBPL en color entraron a una impresora SPL monocroma. Hizo ruido y alimentó una hoja en blanco. Nada en el host registró un problema, porque desde el punto de vista del host no lo había.

## Falla 2 — donde se equivocó con total seguridad

El siguiente intento fue **splix**, el driver SPL open source, con un PPD de Samsung ML-2165. Familia de lenguaje correcta, fabricante correcto, modelo plausible. Razonable.

Una vez más, la cadena de filtros no informó ningún error. Después, la cola se deshabilitó sola a mitad del trabajo con *"Unplugged or turned off"*, y el número de dispositivo USB fue aumentando entre intentos —004, después 005, después 006— sin que nadie tocara el cable.

Claude Code diagnosticó un conflicto entre `usblp` y el backend libusb. Es el diagnóstico de manual para este patrón y lo que sugerían los primeros resultados de búsqueda, pero estaba equivocado. Estábamos a un comando de agregar un módulo del kernel a la lista negra en una máquina cuyo kernel no tenía ningún problema.

La hipótesis se derrumbó cuando caminé hasta la otra habitación.

Las páginas que salían no estaban en blanco. Decían:

```
Exception report
Assertion failed: file MM_Lib.c line 2226
```

Copié esa línea en la terminal. Cambió de diagnóstico al instante: `MM_Lib.c` es un archivo fuente del administrador de memoria **del firmware de la impresora**. El dispositivo disparaba una aserción fallida mientras interpretaba el SPL de splix, imprimía un informe del fallo y se reiniciaba. Un dispositivo USB que se reinicia se desconecta y vuelve a enumerarse con un número nuevo. Eso explicaba tanto los números crecientes como la cola deshabilitándose sola, sin que hubiera ningún módulo del kernel involucrado.

:::callout
Si el número de dispositivo USB aumenta durante un trabajo en una impresora basada en el host, es mucho más probable que se trate de un **reinicio del firmware** que de un conflicto con `usblp`. Antes de agregar nada a una lista negra, fijate si hay una página de excepción en la bandeja.
:::

Es la misma división del trabajo que encontré cuando [apunté la misma herramienta a mi impresora 3D](/blog/claude-code-on-a-3d-printer). Cada observación del lado del host que hizo era correcta, y todas eran consistentes con la hipótesis equivocada. La evidencia que desempataba la generó el dispositivo que fallaba, en papel, completamente fuera del canal instrumentado. No tenía ningún camino hacia ese dato. Yo tenía piernas.

## El dato del que dependía la solución

Una vez entendido el fallo del firmware, la pregunta pasó a ser qué dialecto de SPL aceptaba realmente el aparato. Acá hizo algo que a mí me cuesta: averiguó la identidad real del hardware en vez de quedarse con la etiqueta.

**La Phaser 3020 es una Samsung M2020 rebautizada.** Mismo motor, mismo linaje de firmware, mismo lenguaje de descripción de página. Esto no está en la caja, ni en el manual, ni en ninguna parte de las páginas de drivers de Xerox. Buscar "Xerox Phaser 3020 Linux" no devuelve casi nada, que es por lo que no había llegado a ningún lado dos veces — el aparato está bien soportado, bajo el número de modelo de otra empresa.

Ese único dato es toda la solución.

## La instalación, y dos trampas adentro

El Unified Linux Driver de Samsung trae el filtro `rastertospl` y el PPD `Samsung M2020 Series`. Samsung ya no lo distribuye; lo mantiene el repositorio SULD en `bchemnet.com/suldr`. Bajó los `.deb` y los instaló localmente en lugar de agregar un repositorio apt de terceros permanente — sugerencia suya, y la decisión correcta para una sola impresora.

```bash
sudo apt-get install -y \
  ./suldr-keyring.deb \
  ./suld-driver2-common.deb \
  ./suld-ppd-4.deb \
  ./suld-driver2.deb

sudo lpadmin -p Phaser-3020 \
  -P /usr/share/ppd/suld/Samsung_M2020_Series.ppd.gz -E
```

Dos trampas de dependencias, las dos de las que yo habría dicho "fatal" y habría abandonado:

- **El orden importa.** `suld-driver2-common` depende de `suldr-keyring`. Si salteás el keyring te da `Depends: suldr-keyring but it is not installable`, que parece un paquete roto y en realidad es un problema de secuencia.
- **`libcupsimage2` no existe con ese nombre en Ubuntu 24.04.** La transición a `time_t` de 64 bits lo renombró `libcupsimage2t64`, que declara `Provides: libcupsimage2`. `apt` resuelve eso. `dpkg -i` no, y reporta un error de dependencias aparentemente fatal contra un paquete que está instalado.

Después verificó, que es la costumbre por la que lo tengo cerca:

```bash
ls /usr/lib/cups/filter/rastertospl
ls /usr/share/ppd/suld/Samsung_M2020_Series.ppd.gz
lpoptions -p Phaser-3020 | tr ' ' '\n' | grep printer-make-and-model
```

Una impresión de prueba terminó en unos 8,5 segundos, salida correcta, sin página de excepción — y, el chequeo que realmente importaba, un **número de dispositivo USB estable antes, durante y después del trabajo**. Ese último es un test que solo existe porque habíamos pasado una hora aprendiendo cómo se ve una impresora reiniciándose. Quedó en las notas como criterio de aceptación.

> Fallback si esto alguna vez se rompe: la variante mantenida por HP, `suld-driver2-1.00.39hp` con `suld-ppd-5`.

## Ponerla en la red

La 3020 tiene WiFi integrado y no tiene display, así que unirse a una red requiere WPS o una herramienta USB solo para Windows. Antes de que yo pudiera salir a buscar cualquiera de las dos, ya había barrido las dos subredes locales por el puerto 9100, revisado ARP buscando OUIs de Xerox y Samsung, y corrido una consulta mDNS — estableciendo en menos de un minuto que la impresora nunca había estado en una red.

Es de nuevo lo de no aburrirse. Yo habría asumido, o habría perdido veinte minutos, y no habría anotado el resultado.

También señaló que perseguir el WiFi propio de la impresora era el objetivo equivocado igual: el aparato sigue sin poder renderizar, solo estaría recibiendo SPL por un socket en lugar de por un cable. Como el host está siempre prendido, compartimos la cola:

```bash
sudo cupsctl --share-printers
sudo lpadmin -p Phaser-3020 -o printer-is-shared=true
```

`cupsd.conf` necesita `Listen *:631` — por defecto escucha solo en loopback — y `Allow @LOCAL` dentro de `<Location />`. `@LOCAL` resuelve a las subredes a las que el host está directamente conectado, o sea acceso LAN y ningún acceso externo. Hizo backup del archivo primero y validó con `cupsd -t` antes de reiniciar, sin que se lo pidiera, para que un error de tipeo no pudiera dejar a la casa sin servicio de impresión. Es un instinto de software correctamente aplicado a un electrodoméstico.

Después `avahi-daemon` publica el registro DNS-SD, y el TXT incluye:

```
mopria-certified=1.3
URF=DM3,IS1,V1.4,W8,CP255,RS300-600,SRGB24,...
```

Esas son las claves que buscan iOS y Android. Así que una láser monocroma host-based de 2013 ahora aparece en la hoja de impresión del iPhone como impresora AirPrint sin driver, sin app y sin configuración — el teléfono manda PWG raster estándar, y el servidor corre `rastertospl` para producir el SPL que el hardware necesita. Verificado con `ipptool` y con una impresión real desde un teléfono.

Una limitación honesta que marcó en lugar de dejar que la descubriera después: la impresora no puede apagarse entre trabajos. Wake-on-LAN aplica cuando la impresora es el endpoint de red. Acá el endpoint es el servidor y la impresora es un periférico USB detrás de él, así que no hay camino de despertar. Dejada prendida, queda en reposo consumiendo unos pocos watts.

## Lo que me llevo

- **Cuestioná primero la señal de éxito.** La parte más cara de todo esto fueron dos fines de semana confiando en la palabra `completed`. Lo primero que hizo el agente fue establecer qué afirma realmente esa palabra, que es mucho menos de lo que parece.
- **Un registro limpio es compatible con una falla total** cuando el problema ocurre después de todo lo que queda registrado. En hardware basado en el host, eso sucede con la mayoría de las fallas.
- **Averiguá qué es realmente el hardware, no qué dice ser.** El cambio de marca hacía que pareciera que no había información en internet. El número de modelo correcto lo convirtió en un problema resuelto.
- **Se va a equivocar con total seguridad y va a abandonar el error al instante.** El diagnóstico de `usblp` estaba bien razonado y bien respaldado, pero era falso. Seis palabras de evidencia tomadas de la bandeja de salida bastaron para revertirlo sin discusión.
- **La salida propia del dispositivo es un canal de diagnóstico que tu instrumentación no cubre.** Todo lo que el agente podía ver era consistente y equivocado. La respuesta estaba impresa en papel, a tres metros, donde no podía mirar.

Ese último es toda la lección, y es la misma que me enseñó la impresora 3D. Él tiene la paciencia, la memoria, y ningún ego respecto de equivocarse. Yo tengo piernas y ojos. La impresora anda.
