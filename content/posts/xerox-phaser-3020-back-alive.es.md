---
eyebrow: Linux · Hardware
title: Xerox Phaser 3020 de vuelta en línea
lead: "Una impresora láser host-based que no producía salida en Ubuntu 24.04 y reportaba todos los trabajos como completados. Diagnóstico, dos drivers incorrectos, la falla de firmware que provocaron, y la configuración que funciona — incluida la exposición en red por IPP."
excerpt: "Una Xerox Phaser 3020 sacando páginas en blanco bajo Ubuntu 24.04. Por qué CUPS reportaba éxito, por qué dos drivers plausibles fallaron de formas distintas, y la configuración de driver y compartición que funciona."
metaDescription: "Poner a andar una Xerox Phaser 3020 en Ubuntu 24.04 — el driver Samsung ULD (rastertospl + PPD M2020), una aserción de firmware provocada por splix, y cómo compartir la cola por IPP como impresora AirPrint/Mopria."
---

## Resumen

Una Xerox Phaser 3020 conectada por USB a un host Ubuntu 24.04 no imprimía nada. La selección automática de driver de Ubuntu era incorrecta, y la alternativa obvia también lo era y además colgaba el firmware de la impresora. La configuración que funciona es el Unified Linux Driver de Samsung — `rastertospl` más el PPD `Samsung M2020 Series` — porque la Phaser 3020 es una Samsung M2020 rebautizada. Una vez imprimiendo localmente, la cola se compartió por IPP con anuncio Bonjour, lo que la vuelve usable como impresora AirPrint/Mopria sin driver.

## Características del dispositivo

Tres propiedades determinan todo lo demás.

**Es host-based.** También llamada GDI o Winprinter. No hay intérprete PostScript ni PCL en el aparato. No puede renderizar una descripción de página. El host rasteriza la página y transmite un stream de bitmap en un formato del fabricante — acá, **SPL** de Samsung.

**En consecuencia el driver no es aproximado.** En un dispositivo PostScript un PPD imperfecto da una página imperfecta. Acá un driver incorrecto produce un stream de bytes que el dispositivo no puede parsear en absoluto. La falla observable es una hoja en blanco, o ninguna.

**La Phaser 3020 es una Samsung M2020 rebautizada.** Mismo motor, misma línea de firmware, mismo lenguaje de descripción de página. Esto no figura en la caja, ni en el manual, ni en las páginas de drivers de Xerox, y es el único dato del que depende la solución.

Identificación en el host:

```bash
lsusb                       # 0924:42d5, serial 3434417634
lpstat -l -p Phaser-3020    # estado de la cola e interfaz asociada
lpoptions -p Phaser-3020    # device-uri, printer-make-and-model, PPD en uso
```

## Por qué la señal de éxito no es una señal

CUPS reportaba `completed` en todos los trabajos, incluidos los que sacaron papel en blanco. Es el comportamiento correcto, no un bug: **un trabajo completado significa que la cadena de filtros corrió y el backend escribió los bytes al dispositivo sin error.** No afirma nada sobre si el dispositivo los parseó, ni sobre si salió una página.

Por la misma razón `/var/log/cups/error_log` queda limpio durante una falla total. `cupsctl --debug-logging` hace que registre la cadena de filtros completa, útil para confirmar *cuáles* filtros corrieron, pero un log limpio sólo establece que la mitad host del pipeline no tuvo problemas.

Señales utilizables, por orden de confiabilidad:

| Señal | Qué establece |
| --- | --- |
| Salida física | Si el dispositivo parseó el stream. La única evidencia directa. |
| Número de dispositivo USB en `lsusb` | Un dispositivo que se renumera a mitad de trabajo se reinició. |
| Estado de la cola en `lpstat` | Si el backend perdió el dispositivo. |
| Cadena de filtros en `error_log` | Qué driver corrió realmente. No si era el correcto. |

## Falla 1 — foo2hbpl2 (PPD de Xerox Phaser 3010)

La configuración automática de Ubuntu asoció un PPD de Phaser **3010** que usa el filtro `foo2hbpl2`. Ese filtro emite **HBPL**, en color. El dispositivo es monocromático y parsea sólo SPL.

Resultado: la cadena de filtros terminó sin error, el dispositivo recibió varios megabytes que no podía interpretar, produjo ruido mecánico y un ciclo de alimentación, y sacó una hoja en blanco. No se registró ningún error en el host.

## Falla 2 — splix (PPD de Samsung ML-2165) y una aserción de firmware

Segundo intento: **splix**, el driver SPL de código abierto, con un PPD de Samsung ML-2165. Familia de lenguaje correcta, fabricante correcto, modelo plausible.

La cadena de filtros no reportó error de nuevo. Después la cola se deshabilitó sola a mitad del trabajo con *"Unplugged or turned off"*, y el número de dispositivo USB fue incrementando entre intentos — 004, después 005, después 006 — sin ninguna intervención física.

Ese patrón es la firma reconocida de una contención entre `usblp` y el backend libusb, y ése fue el diagnóstico inicial. Era incorrecto. Las páginas que salían no estaban en blanco; decían:

```
Exception report
Assertion failed: file MM_Lib.c line 2226
```

`MM_Lib.c` es un archivo fuente del manejador de memoria en el **firmware de la propia impresora**. El dispositivo estaba pegándole a una aserción fallida mientras parseaba el SPL de splix, emitiendo un reporte de crash y reiniciándose. Un dispositivo USB que se reinicia se desconecta y reenumera con un número nuevo, lo que explica tanto la deshabilitación de la cola como los números incrementales.

:::callout
Números de dispositivo USB incrementales durante un trabajo en una impresora host-based indican un **reinicio de firmware** mucho más seguido que un conflicto de `usblp`. Verificá si hay una página de excepción en la bandeja de salida antes de blacklistear módulos del kernel.
:::

El punto general: cada observación del lado host era exacta y consistente con la hipótesis incorrecta. La evidencia que desambiguaba la produjo el dispositivo que fallaba, en papel, completamente fuera del canal instrumentado.

## Configuración que funciona

El Unified Linux Driver de Samsung provee el filtro `rastertospl` y el PPD `Samsung M2020 Series`. Samsung ya no lo distribuye; el repositorio **SULD** en `bchemnet.com/suldr` lo mantiene. Instalado como archivos `.deb` locales en vez de como apt source de terceros permanente:

```bash
sudo apt-get install -y \
  ./suldr-keyring.deb \
  ./suld-driver2-common.deb \
  ./suld-ppd-4.deb \
  ./suld-driver2.deb

sudo lpadmin -p Phaser-3020 \
  -P /usr/share/ppd/suld/Samsung_M2020_Series.ppd.gz -E
```

Dos notas de dependencias:

- **El orden importa.** `suld-driver2-common` depende de `suldr-keyring`. Omitir el keyring falla con `Depends: suldr-keyring but it is not installable`, fácil de leer como opcional cuando se instala desde archivos locales.
- **`libcupsimage2` no existe con ese nombre en Ubuntu 24.04.** La transición a `time_t` de 64 bits lo renombró a `libcupsimage2t64`, que declara `Provides: libcupsimage2`. `apt` lo resuelve; `dpkg -i` no, y reporta un error de dependencias aparentemente fatal.

Verificación posterior a la instalación:

```bash
ls /usr/lib/cups/filter/rastertospl
ls /usr/share/ppd/suld/Samsung_M2020_Series.ppd.gz
lpoptions -p Phaser-3020 | tr ' ' '\n' | grep printer-make-and-model
```

Una impresión de prueba completó en unos 8,5 s con salida correcta, sin página de excepción y — el chequeo que importa — con el número de dispositivo USB estable antes, durante y después del trabajo.

> Alternativa si esto se rompe: la variante mantenida por HP, `suld-driver2-1.00.39hp` con `suld-ppd-5`.

## Exposición en red

La 3020 tiene WiFi integrado pero no tiene pantalla, así que asociarse a una red requiere WPS o una herramienta USB sólo para Windows, y la impresión en red host-based de Samsung es poco confiable en Linux igual — el dispositivo sigue sin poder renderizar, sólo recibe SPL por un socket en vez de por un cable. Un barrido de las dos subredes locales por el puerto 9100, una revisión de ARP por OUIs de Xerox/Samsung y una consulta mDNS confirmaron que nunca había estado en una red.

Como el host está siempre encendido, se compartió la cola:

```bash
sudo cupsctl --share-printers
sudo lpadmin -p Phaser-3020 -o printer-is-shared=true
```

`cupsd.conf` requiere dos cambios: `Listen *:631`, ya que por defecto escucha sólo en loopback, y `Allow @LOCAL` dentro de `<Location />`. `@LOCAL` resuelve a las subredes a las que el host está directamente conectado, lo que otorga acceso LAN y ningún acceso externo. Hacer backup del archivo, y validar con `cupsd -t` antes de reiniciar para que un error de sintaxis no deje al host sin servicio de impresión. `avahi-daemon` publica el registro DNS-SD.

El registro TXT resultante incluye:

```
mopria-certified=1.3
URF=DM3,IS1,V1.4,W8,CP255,RS300-600,SRGB24,...
```

Ésas son las claves que buscan iOS y Android. CUPS anuncia la cola compartida como una **impresora AirPrint y Mopria sin driver**, lo cual es exacto: el cliente manda PDF estándar o raster PWG, y el servidor corre `rastertospl` para producir el SPL que el dispositivo necesita. Una láser mono host-based de 2013 aparece entonces en el menú de impresión de iOS sin app, driver ni configuración. Verificado con `ipptool -tv ipp://<host>:631/printers/Phaser-3020 get-printer-attributes.test` y una impresión desde un iPhone.

## Limitación

La impresora no puede apagarse entre trabajos. Wake-on-LAN aplica cuando la impresora es el endpoint de red y mantiene su placa escuchando. Acá el endpoint de red es el servidor y la impresora es un periférico USB detrás de él, así que no hay camino de despertado — un trabajo enviado a una impresora apagada queda en cola o falla. Encendida, el dispositivo entra en sueño profundo con unos pocos watts y despierta con el primer byte del trabajo.

## Notas

- Un estado de éxito describe la capa que lo reporta, no la de abajo. `completed` en CUPS significa que la escritura tuvo éxito.
- En hardware host-based, un log limpio es consistente con una falla total, porque la falla ocurre aguas abajo de todo lo que registra.
- Establecer el rebautizado temprano. Buscar soporte Linux para Xerox Phaser 3020 devuelve muy poco; el dispositivo está soportado, bajo el número de modelo de otro fabricante.
- La salida generada por el dispositivo — páginas de estado, reportes de excepción — es un canal de diagnóstico que la instrumentación del lado host no cubre.
