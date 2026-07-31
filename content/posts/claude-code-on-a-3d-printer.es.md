---
eyebrow: Flujos con IA · Herramientas
title: Claude Code, apuntado a una impresora 3D
lead: "Uso un agente de código todos los días para software. Esta vez lo apunté a un problema de hardware. Resulta que la pregunta interesante no es si sabe de impresoras 3D — es qué pasa cuando algo paciente, literal e incansable puede correr comandos y leer la salida."
excerpt: "Uso un agente de código todos los días para software. Esta vez lo apunté a un problema de hardware. En qué fue mejor que yo, dónde se equivocó con seguridad, y el único descubrimiento que no podría haber hecho."
metaDescription: "Uso un agente de código todos los días para software. Lo apunté a un problema de hardware — calibrar y depurar una impresora 3D — y encontró tres fallas con las que venía conviviendo hacía meses."
---

## Por qué esto funciona

Los agentes de código se venden como cosas que escriben código. Ese encuadre los subestima, y por eso tardé en probar esto. La capacidad real es más angosta y más general al mismo tiempo: **pueden correr comandos, leer la salida y decidir qué correr después.**

Lo que significa que cualquier cosa que hable texto entra en juego. Y una impresora 3D habla texto — texto notablemente simple:

- La placa aparece como un dispositivo serie, `/dev/ttyUSB0`.
- El gcode es un protocolo ASCII por líneas. Mandás `M105` y recibís `ok T:23.79 /0.00 B:23.71 /0.00`.
- El firmware expone toda su configuración con `M503`.
- OctoPrint pone una API REST adelante de todo eso.

Nada de eso es un problema de programación. Todo eso es un problema de "correr un comando, leer la respuesta", que es exactamente la forma en la que estas herramientas son buenas.

## Cómo es el loop en la práctica

Mi impresora venía imprimiendo mal desde hacía meses. Las piezas se rajaban por las líneas de capa, y tenía que ajustar un offset de Z apenas distinto antes de cada impresión. Había dejado de tratar cualquiera de las dos cosas como un problema.

El loop funcionaba así. El agente escribía un script de Python descartable, lo corría contra la impresora y leía lo que volvía. Yo hacía la mitad física — pasar una hoja de papel bajo la boquilla, sentir el roce, girar un tornillo, apretar un bulón — y reportaba lo que sentía. Después él decidía qué revisar a continuación.

Un ejemplo real, y el momento en que dejé de ser escéptico. OctoPrint mostraba un gráfico de temperatura vacío aunque el firmware decía soportar reporte automático de temperatura. En vez de teorizar, el agente volcó los bytes crudos que salían del puerto serie:

```
  TT::23.9523.95  //0.000.00  BB::23.7523.75  //0.000.00
```

Un reporte normal se lee `T:23.95 /0.00 B:23.75 /0.00`. El firmware mandaba **dos copias de la misma línea, intercaladas campo por campo** — dos escritores golpeando un mismo buffer serie. Imposible de parsear para cualquiera.

Yo no habría mirado ahí. Habría buscado el síntoma en Google, encontrado un hilo de foro y aplicado el arreglo con más votos. El agente bajó una capa por debajo de la abstracción que estaba mintiendo y leyó los bytes reales.

## Dónde fue genuinamente mejor que yo

### No se aburre

Después de flashear el firmware nuevo, la impresora quedó completamente muda. No con basura — muda. Eso se ve igual que hardware muerto, y es donde yo habría empezado a asustarme por una placa arruinada.

En cambio barrió todos los baud rates plausibles en una sola pasada y encontró la respuesta en unos cuarenta segundos: el firmware nuevo corre a 250000 donde el de fábrica usaba 115200. Aburrido, sistemático, correcto.

La misma paciencia apareció al releer una malla de cama de 25 puntos, verificar que los 25 sobrevivieran una recarga desde la EEPROM y re-verificar la configuración después de cada reescritura. Eso es trabajo que yo habría salteado.

### Convierte "se siente mejor" en una prueba

Esto fue lo más valioso, y lo menos esperado.

Cuando sospechamos que el eje Z estaba perdiendo posición, apreté un par de bulones y dije que se sentía firme. Eso no fue aceptado como evidencia. En cambio recibí dos pruebas de aceptación, definidas _antes_ del arreglo:

- **Repetibilidad de homing** — hacer homing, ir a un punto fijo, prueba del papel, cinco veces. Las cinco tienen que sentirse idénticas.
- **Retención en movimiento** — ciclar el eje Z arriba y abajo quince veces, cerca de un metro y medio de recorrido de husillo, y volver al mismo punto _sin volver a hacer homing_. El roce tiene que estar igual.

Las dos pasaron. Esa es una calidad de confianza distinta a "parece que anda bien", y es una disciplina que aplico constantemente en software y que nunca había aplicado a mi propia impresora.

### Escribe todo mientras avanza

Al final había un repositorio privado con el binario del firmware que realmente corre en la máquina y su checksum, un volcado de la EEPROM previo al flasheo, la malla de la cama, los valores de calibración con el razonamiento detrás de cada uno, y los scripts usados para verificarlos.

No pedí la mayor parte de eso. Se acumuló como efecto secundario, y es la diferencia entre haber arreglado una impresora y poder volver a arreglarla dentro de un año.

Un detalle me quedó grabado. Descubrimos que la malla de la cama sobrevive a un apagado pero el flag que la _habilita_ no — así que una impresión ignora la malla en silencio a menos que el gcode de inicio la vuelva a prender. En vez de escribir eso en un comentario y confiar, fue directo al script de laminado como un chequeo duro:

```bash
if grep -q 'M420 S1' "$OUT"; then
    echo "  mesh compensation enabled ......... yes"
else
    echo "  mesh compensation enabled ......... NO -- ABORTING" >&2
    exit 1
fi
```

El script ahora se niega a mandar gcode que ignoraría la malla. Una lección convertida en barandilla. Es un instinto muy de software aplicado a una máquina física, y está bien que así sea.

## Dónde se equivocó

Esta parte importa más que los aciertos, porque un asistente que no podés calibrar no sirve.

**Se negó a creer una medición correcta.** Medimos que mi extrusor alimentaba 68 mm cuando se le pedían 100. El valor corregido daba 137,78 pasos/mm contra un default de fábrica de 93. Dijo directamente que no creía el número y se negó a escribirlo, con el argumento de que un error del 48% habría hecho que todas mis impresiones salieran visiblemente rotas.

Premisa razonable. Conclusión equivocada — porque asumía hardware de fábrica, y yo tengo un extrusor de terceros. Apenas lo mencioné, junto con el hecho de que venía corriendo 125% de flujo hacía meses para que las piezas no se rajaran, se corrigió al instante y dijo que su objeción anterior partía de una suposición mala. La medición era correcta. Mi impresora realmente venía alimentando dos tercios de lo que se le pedía.

**Advirtió de más.** Insistió en que una calibración térmica era inválida porque había filamento cargado. La rehicimos bien. La diferencia fue cerca del 1%. Lo dijo claramente después en vez de pasar de largo, cosa que valoro, pero perdí diez minutos.

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

Nada de eso requirió que el agente supiera de impresión 3D. Requirió que pudiera correr comandos, leer la salida, hacer cuentas sin cansarse y anotar lo que aprendía. Es una herramienta mucho más amplia de lo que sugiere "te escribe el código" — y es la razón por la que ahora la agarro para problemas que no tienen nada que ver con software.

La terminal resulta ser una interfaz bastante universal. La mayoría de las cosas que vale la pena depurar ya están del otro lado.
