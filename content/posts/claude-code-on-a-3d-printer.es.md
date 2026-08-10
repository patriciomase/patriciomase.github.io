---
eyebrow: Flujos con IA · Herramientas
title: Puse a Claude Code a trabajar con una impresora 3D
lead: "Uso un agente de código todos los días para trabajar con software. Esta vez lo puse frente a un problema de hardware. La pregunta interesante no es si sabe de impresoras 3D, sino qué pasa cuando algo paciente, literal e incansable puede ejecutar comandos y leer los resultados."
excerpt: "Uso un agente de código todos los días para trabajar con software. Esta vez lo puse frente a un problema de hardware: en qué fue mejor que yo, dónde se equivocó con absoluta seguridad y cuál fue el único descubrimiento que nunca podría haber hecho."
metaDescription: "Uso un agente de código todos los días para trabajar con software. Esta vez lo puse a calibrar y depurar una impresora 3D, y encontró tres fallas con las que yo convivía desde hacía meses."
---

## Por qué esto funciona

Los agentes de código se presentan como herramientas que escriben código. Esa descripción les queda chica, y por eso tardé en probar esto. Su verdadera capacidad es a la vez más acotada y más general: **pueden ejecutar comandos, leer el resultado y decidir qué ejecutar después.**

Eso significa que cualquier cosa que se comunique mediante texto entra en juego. Y una impresora 3D habla en texto, uno sorprendentemente simple:

- La placa aparece como un dispositivo serie, `/dev/ttyUSB0`.
- El gcode es un protocolo ASCII por líneas. Mandás `M105` y recibís `ok T:23.79 /0.00 B:23.71 /0.00`.
- El firmware expone toda su configuración con `M503`.
- OctoPrint pone una API REST adelante de todo eso.

Nada de eso es un problema de programación. Todo se reduce a «ejecutar un comando y leer la respuesta», justo el tipo de tarea que estas herramientas hacen bien.

## Cómo funciona el ciclo en la práctica

Mi impresora venía imprimiendo mal desde hacía meses. Las piezas se rajaban por las líneas de capa, y tenía que ajustar un offset de Z apenas distinto antes de cada impresión. Había dejado de tratar cualquiera de las dos cosas como un problema.

El ciclo funcionaba así: el agente escribía un script descartable en Python, lo ejecutaba contra la impresora y leía la respuesta. Yo hacía la parte física —pasar una hoja de papel bajo la boquilla, sentir el roce, girar un tornillo, apretar un bulón— y le contaba qué había sentido. Después decidía qué revisar.

Este es un ejemplo real y el momento en que dejé de ser escéptico. OctoPrint mostraba un gráfico de temperatura vacío aunque el firmware aseguraba admitir el reporte automático de temperatura. En vez de teorizar, el agente volcó los bytes sin procesar que salían del puerto serie:

```
  TT::23.9523.95  //0.000.00  BB::23.7523.75  //0.000.00
```

Un reporte normal se ve así: `T:23.95 /0.00 B:23.75 /0.00`. El firmware enviaba **dos copias de la misma línea, intercaladas campo por campo**: dos procesos escribiendo sobre el mismo búfer serie. Ningún programa podía interpretar eso.

Yo no habría mirado ahí. Habría buscado el síntoma en Google, encontrado un hilo de foro y aplicado el arreglo con más votos. El agente bajó una capa por debajo de la abstracción que estaba mintiendo y leyó los bytes reales.

## Dónde fue genuinamente mejor que yo

### No se aburre

Después de flashear el firmware nuevo, la impresora quedó completamente muda. No con basura — muda. Eso se ve igual que hardware muerto, y es donde yo habría empezado a asustarme por una placa arruinada.

En cambio, probó todas las velocidades de transmisión plausibles en una sola pasada y encontró la respuesta en unos cuarenta segundos: el firmware nuevo funciona a 250000 baudios; el de fábrica usaba 115200. Aburrido, sistemático, correcto.

Mostró la misma paciencia al releer una malla de cama de 25 puntos, comprobar que todos sobrevivieran a una recarga desde la EEPROM y volver a verificar la configuración después de cada cambio. Yo me habría salteado todo ese trabajo.

### Convierte "se siente mejor" en una prueba

Esto fue lo más valioso, y lo menos esperado.

Cuando sospechamos que el eje Z estaba perdiendo posición, apreté un par de bulones y dije que se sentía firme. Eso no fue aceptado como evidencia. En cambio recibí dos pruebas de aceptación, definidas _antes_ del arreglo:

- **Repetibilidad del origen** — llevar el eje al origen, moverlo hasta un punto fijo y hacer la prueba del papel cinco veces. Las cinco tienen que sentirse idénticas.
- **Conservación de la posición** — mover el eje Z hacia arriba y abajo quince veces —cerca de un metro y medio de recorrido del husillo— y volver al mismo punto _sin regresar al origen_. El roce tiene que ser el mismo.

Las dos pasaron. Eso da una confianza muy distinta de «parece que anda bien». Es una disciplina que aplico constantemente al software y que nunca había aplicado a mi propia impresora.

### Escribe todo mientras avanza

Al final había un repositorio privado con el binario exacto del firmware instalado y su suma de comprobación, un volcado de la EEPROM anterior al flasheo, la malla de la cama, los valores de calibración con el razonamiento detrás de cada uno y los scripts usados para verificarlos.

No pedí la mayor parte de eso. Se acumuló como efecto secundario, y es la diferencia entre haber arreglado una impresora y poder volver a arreglarla dentro de un año.

Un detalle me quedó grabado. Descubrimos que la malla de la cama sobrevive a un apagado, pero la opción que la _habilita_ no. Por lo tanto, una impresión ignora la malla sin avisar, a menos que el gcode de inicio vuelva a activarla. En vez de dejarlo escrito en un comentario y confiar, lo convirtió en una validación obligatoria del script de laminado:

```bash
if grep -q 'M420 S1' "$OUT"; then
    echo "  mesh compensation enabled ......... yes"
else
    echo "  mesh compensation enabled ......... NO -- ABORTING" >&2
    exit 1
fi
```

Ahora el script se niega a enviar un gcode que ignoraría la malla. Una lección convertida en mecanismo de seguridad. Es un instinto muy propio del software aplicado a una máquina física, y funciona.

## Dónde se equivocó

Esta parte importa más que los aciertos, porque un asistente que no podés calibrar no sirve.

**Se negó a creer una medición correcta.** Medimos que mi extrusor alimentaba 68 mm cuando se le pedían 100. El valor corregido daba 137,78 pasos/mm contra un default de fábrica de 93. Dijo directamente que no creía el número y se negó a escribirlo, con el argumento de que un error del 48% habría hecho que todas mis impresiones salieran visiblemente rotas.

Premisa razonable. Conclusión equivocada — porque asumía hardware de fábrica, y yo tengo un extrusor de terceros. Apenas lo mencioné, junto con el hecho de que venía corriendo 125% de flujo hacía meses para que las piezas no se rajaran, se corrigió al instante y dijo que su objeción anterior partía de una suposición mala. La medición era correcta. Mi impresora realmente venía alimentando dos tercios de lo que se le pedía.

**Fue demasiado precavido.** Insistió en que una calibración térmica no era válida porque había filamento cargado. La repetimos como correspondía. La diferencia fue de alrededor del 1 %. Después lo reconoció con claridad en vez de hacer como si nada, cosa que valoro, pero yo había perdido diez minutos.

**Sacó un workaround demasiado pronto.** Una sola prueba exitosa lo convenció de que un bug de firmware estaba arreglado, así que borró la mitigación. La conexión se moría noventa segundos después, todas las veces, de una manera que se ve exactamente igual que hardware muerto. Volvió a poner la mitigación con un comentario que ahora dice: _no sacar esto de nuevo sin mirar la conexión por más de dos minutos._

**Exageró su evidencia una vez.** Me dijo que la lectura de posición probaba que el eje se movía bien. No lo prueba — ese número es el conteo de pasos del propio firmware, no una medición, porque la máquina no tiene encoder. Se corrigió cuando esto pasó a ser relevante, pero por un rato estuve tranquilo por algo que no probaba nada.

## Lo que no pudo hacer

El descubrimiento más grande de todo el ejercicio fue mío, y no fue técnico.

Habíamos nivelado la cama esquina por esquina. El centro entonces medía 0,8 mm más alto — un número enorme y alarmante que sugería una cama deformada. El agente estaba subiendo la boquilla sistemáticamente para medir la cúpula, y yo estaba por ponerme a buscar algo atrapado debajo de la placa.

En cambio dije: volvé a la primera esquina, la que calibramos hace veinte minutos, y revisala de nuevo.

Ahí la boquilla también estaba clavada contra la cama. La cama estaba bien. La _referencia_ se había estado moviendo todo el tiempo, y el centro, medido último, había acumulado el error más grande. La falla real eran dos bulones apenas flojos que sujetan la tuerca del husillo al pórtico — lo suficiente como para que el pórtico se moviera verticalmente sin que el husillo girara.

El agente venía midiendo con cuidado y correctamente contra una regla que se movía. No tenía forma de sospecharlo, porque cada lectura que tomaba era internamente consistente. Lo que le faltaba era eso que me hizo decirlo: una desconfianza física y vaga ante un número que se sentía demasiado grande para la máquina que tenía adelante.

Esa es la división honesta del trabajo. Él tiene paciencia, memoria, aritmética y ningún ego sobre equivocarse. Yo tengo manos, ojos y olfato para cuando algo no cierra.

## Cómo sacarle valor de verdad

Cosas que hicieron la diferencia, y que se trasladan a cualquier problema que no sea software:

- **Hacé que produzca mediciones, no opiniones.** "¿Está arreglado?" te devuelve un párrafo plausible. "¿Qué prueba demostraría que está arreglado, y qué resultado lo refutaría?" te devuelve algo útil.
- **Dale el contexto que no puede ver.** Su peor decisión de toda la sesión vino de asumir hardware de fábrica. Una frase mía sobre el extrusor de terceros lo dio vuelta al instante. No puede mirar tu máquina.
- **Contradecilo cuando esté seguro y equivocado.** Se actualizó limpiamente todas las veces, sin discutir ni disculparse de más. Un asistente que se dobla ante la presión es peligroso; uno que se corrige ante la evidencia es un colega.
- **Dejalo documentar.** La documentación salió gratis, y es la parte que voy a seguir usando el año que viene.
- **Hacé bien la mitad física.** Cada lectura que tuvo vino de mí describiendo el roce del papel. Basura entra, basura con seguridad sale.

## El resultado

Tres fallas, cada una tapando a las otras: pasos del extrusor errados por un 48%, el laminador configurado para una boquilla de 0,4 mm cuando había una de 0,6 puesta, y un eje Z que perdía altura en cada movimiento. Las dos primeras hacían que las piezas se rajaran. La tercera hacía que ninguna nivelación quedara firme — y era la razón por la que venía tipeando un offset de Z nuevo antes de cada impresión durante meses sin llamarlo nunca un bug.

La primera impresión después salió más limpia que cualquier cosa que la máquina haya hecho cuando era nueva.

Nada de eso requirió que el agente supiera de impresión 3D. Solo necesitó ejecutar comandos, leer los resultados, hacer cuentas sin cansarse y anotar lo que aprendía. Es una herramienta mucho más amplia de lo que sugiere «te escribe el código», y por eso ahora recurro a ella para problemas que no tienen nada que ver con software.

La terminal resulta ser una interfaz bastante universal. La mayoría de las cosas que vale la pena depurar ya están del otro lado.
