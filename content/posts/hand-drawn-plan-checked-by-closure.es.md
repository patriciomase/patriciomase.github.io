---
eyebrow: Flujos con IA · Medición
title: Un croquis a mano, verificado por cierre
lead: "Un dibujo en papel cuadriculado, veintidós cotas escritas a mano, y la pregunta de cuánto piso comprar. La capacidad interesante no es que un agente pueda leer el croquis. Es que puede tratar las cotas como un sistema sobredeterminado, demostrar que son inconsistentes, y ordenar cuál de ellas está mintiendo."
excerpt: "Un croquis de una casa cuyas medidas no cerraban por 50 cm. Cómo un agente de código encontró el error, cómo identificó al culpable midiendo el dibujo mismo, y dónde quedó trabado hasta que un humano salió con la cinta."
metaDescription: "Convertir un croquis a mano en metros cuadrados con un agente de código — cierre de polígono como test de consistencia, medición en píxeles del escaneo para atribuir el error, y fórmula de Gauss para el área."
---

## Resumen

Un croquis a mano de una casa y la vereda que la rodea, fotografiado a PDF por una app de notas. Veintidós cotas escritas a mano. El objetivo era un solo número: metros cuadrados de piso a comprar.

Las medidas no cerraban. Dos caminos independientes alrededor del contorno diferían en 50 cm. Tres rondas de remedición bajaron el residuo a 2 cm, y ahí el área quedó en 84,95 m² netos. Lo que sigue es el método, porque el método se transfiere y el número no.

## La entrada es una fotografía, no un dibujo

El archivo es un PDF de una sola página producido por una app de notas del celular: un escaneo raster de tinta sobre papel cuadriculado. No hay datos vectoriales, ni capas, ni estructura. Las cotas están escritas a mano en notación argentina — `8,40` — y algunas rotadas noventa grados para acompañar líneas verticales.

Leer eso es la parte fácil, y es la parte que la gente espera que sea difícil. Un modelo actual mira la página y extrae los números y aproximadamente dónde están. Pero leer produce una *creencia*, y una creencia sobre la letra de alguien es mala base para comprar 93 m² de cerámico. La lectura hay que testearla.

## El cierre es el test

Todo contorno cerrado, recorrido una vez, vuelve al punto de partida. La suma de los vectores de los lados es cero. En un plano de lados ortogonales las dos componentes se separan, lo que hace el test trivial de enunciar:

```
Σ dx = 0        Σ dy = 0
```

Un contorno completamente acotado está, por lo tanto, sobredeterminado. Cada lado horizontal aparece en una ecuación y cada vertical en la otra, y nada del acto de medir obliga a que ninguna se cumpla. Esa redundancia es todo el valor del ejercicio: convierte *¿medí bien esto?* de un juicio a una cuenta.

Primera pasada, con los números exactamente como están escritos:

```
horizontal   8,40 + 2,40 + 0,80  = 11,60   yendo a la derecha
             0,40 + 4,17 + 7,00  = 11,57   yendo a la izquierda   → 3 cm

vertical     2,60 + 9,00 + 3,53  = 15,13   bajando por la derecha
             3,53 + 6,10 + 6,00  = 15,63   subiendo por la izquierda → 50 cm
```

Tres centímetros en once metros es error de cinta. Cincuenta centímetros es un número mal. El sistema lo dice; no dice cuál.

## La parte difícil es la topología, no la aritmética

Esta es la parte honesta del ejercicio. La aritmética es trivial. Lo que no es trivial es decidir **qué segmento etiqueta cada número escrito a mano**.

Un ejemplo cargó con casi toda la dificultad. Un `1,45` escrito sobre una línea vertical corta cerca del fondo del plano admite dos lecturas plausibles:

- **(a)** el ancho de la franja de vereda contra el fondo de la casa, o
- **(b)** el escalón del propio contorno de la casa en ese punto.

Las dos son consistentes con dónde está la tinta. Implican geometrías distintas y unos 2 m² de diferencia. Mi primera lectura fue la (a). El dueño la corrigió a la (b).

La respuesta útil no resultó ser ninguna de las dos, y salió del sistema de restricciones y no del dibujo. Los dos segmentos son *el mismo segmento* si y sólo si el patio arranca al ras del borde exterior de la vereda — y arranca. Una sola cota estaba haciendo legítimamente dos trabajos, y por eso había un solo número escrito.

Ese es el patrón que vale la pena notar. Resolver las restricciones no sólo encuentra errores. Recupera hechos sobre el objeto físico que nadie escribió, y que a nadie se le habría ocurrido enunciar.

## Una estimación independiente: medir el dibujo

El cierre prueba que existe una inconsistencia. Atribuirla a un número concreto necesita evidencia de afuera del sistema de restricciones, y el escaneo aporta algo, porque un croquis hecho sobre papel cuadriculado está aproximadamente a escala aunque no sea exacto.

El procedimiento es corto:

1. Rasterizar la página a una resolución conocida — `pdftoppm -r 200 -png -gray`.
2. Umbralizar. Los trazos de lapicera son mucho más oscuros que la cuadrícula impresa, así que un corte en `pixel < 110` aísla el dibujo.
3. Sumar la máscara booleana sobre cada eje. Un trazo largo y recto produce un pico en la suma por columnas (líneas verticales) o por filas (horizontales). Las corridas por encima de un umbral son las líneas dibujadas; el argmax dentro de cada corrida es su posición en píxeles.
4. Fijar la escala con una cota en la que confiás. El borde superior de `8,40` ocupa 650 px, lo que da 77,4 px/m.
5. Convertir cada posición detectada a metros y comparar cada segmento contra su etiqueta manuscrita.

Todos los segmentos coincidían con su etiqueta dentro de 0,3 m — salvo uno. El vertical largo de la derecha, etiquetado `9,00`, medía unos 9,8 m a la escala del propio dibujo.

Eso no es prueba; los dibujos a mano distorsionan, y este distorsiona más donde los espacios son angostos. Pero combinado con un error de cierre de 50 cm apunta a un número en vez de a cinco, que es la diferencia entre hacerle al dueño una pregunta útil y una vaga. Notar la precondición: esto funciona sólo porque el croquis está hecho sobre cuadriculado y con proporciones honestas. Un dibujo deliberadamente esquemático no da nada.

## Cuatro rondas

| Ronda | Cadena izquierda | Cadena derecha | Residuo vertical |
|---|---|---|---|
| Como está escrito | 6,00 + 6,10 = 12,10 | 2,60 + 9,00 = 11,60 | 50 cm — falta a la derecha |
| Cota reasignada | 6,00 + 6,10 = 12,10 | 2,60 + 9,00 = 11,60 | 50 cm — propuesta: 9,50 |
| Izquierda remedida | 5,80 + 5,50 = 11,30 | 2,60 + 9,00 = 11,60 | 30 cm — **sobra** a la derecha, propuesta: 8,70 |
| Izquierda remedida otra vez | 5,90 + 5,68 = 11,58 | 2,60 + 9,00 = 11,60 | **2 cm** — cierra |

El cambio de signo en la tercera ronda es el evento instructivo. Bajo la primera hipótesis la corrección al `9,00` era hacia arriba, a 9,50; bajo la segunda era hacia abajo, a 8,70. Las dos estaban correctamente derivadas de los datos disponibles en ese momento, y se contradicen.

Un residuo te dice la magnitud de una inconsistencia, no su causa. La atribución es un problema aparte, y sólo se resuelve con más mediciones. Un agente que informa la corrección propuesta sin informar que es una entre varias atribuciones posibles está produciendo un número que parece más firme de lo que es.

## Lo que salió sin haberse medido

Una vez que el contorno cierra, el resto de la geometría queda determinado. Ninguno de los anchos de la franja se midió nunca; son consecuencias:

| | metros |
|---|---|
| Franja del frente | 1,73 |
| Lado izquierdo, tramo alto | 2,03 |
| Lado izquierdo, tramo bajo | 1,73 |
| Franja del fondo | 1,45 |
| Franja de la derecha | 0,54 |

También el largo de la pared derecha de la casa, 8,05 m, que no tiene cota en ninguna parte del croquis.

La coherencia interna de ese conjunto es en sí misma un control. Cuatro de los cinco anchos caen entre 1,45 y 2,03 m, que es lo que produce alguien que hace una vereda. Si uno hubiera dado 0,2 y otro 3,4, la topología estaría mal en alguna parte y el cierre habría sido casualidad.

La franja de la derecha es la excepción, y también es instructiva: 0,54 m por cierre contra el `0,40` escrito en el croquis. Esos 14 cm son exactamente el residuo del perímetro de la propia casa — `5,45 + 2,78 = 8,23` contra `4,17 + 5,30 − 1,10 = 8,37`. El error de cinta acumulado tiene que caer en algún lado, y cae en la dimensión más angosta, porque es donde un error absoluto fijo se nota menos.

## Producir el dibujo y el número

El plano se genera, no se dibuja: dos arreglos de vértices, uno para el contorno exterior y otro para la casa, convertidos a paths de SVG en un loop. El texto de cada cota va en el punto medio de su segmento con un offset propio, que es la única parte que hay que ajustar a mano — las etiquetas chocan, y dónde chocan no es predecible desde la geometría.

La superficie con piso es un solo path que usa los dos polígonos con `fill-rule="evenodd"`, así que la casa es un agujero en vez de algo que haya que restar descomponiendo la franja en rectángulos. Eso importa más de lo que parece: la descomposición en rectángulos es donde suelen romperse las cuentas a mano de este tipo.

El área sale de la fórmula de Gauss aplicada a los mismos arreglos:

```
A = ½ |Σ (xᵢ · yᵢ₊₁ − xᵢ₊₁ · yᵢ)|

exterior   138,09 m²
casa        73,60 m²
con piso    64,49 m²
```

Más un playón despegado y tres escalones medidos aparte: **84,95 m² netos**, 93,4 m² con 10 % de desperdicio de corte.

Como el dibujo y el área se calculan desde los mismos arreglos, no pueden discrepar. El modo de falla habitual en este tipo de trabajo es un plano que dice una cosa y una planilla que dice otra; derivar los dos de una sola fuente elimina esa clase de error por completo.

## Detalle de verificación: renderizar lo que generás

Una lección general, que merece un párrafo. El SVG generado hay que mirarlo, y un agente no puede mirar un archivo — tiene que renderizarlo a un raster y leerlo de vuelta.

`convert` de ImageMagick estaba disponible y renderizó el SVG **mal**: métricas de fuente equivocadas, `viewBox` mal interpretado, una salida que parecía un bug serio del generador. No lo era. Chrome headless renderizó el mismo archivo correctamente:

```bash
google-chrome --headless --disable-gpu --screenshot=out.png \
  --window-size=1240,1150 --hide-scrollbars "file://$PWD/plano.html"
```

Así se encontraron y corrigieron dos choques de etiquetas que eran invisibles en el fuente. El punto más amplio es que una herramienta de verificación que discrepa en silencio con el renderer real es peor que no verificar, y la única forma de descubrirlo es contrastar su salida contra algo que ya sabés que está bien.

## Lo que no pudo hacer

Todo hecho genuinamente nuevo del ejercicio vino de la persona con la cinta. El agente pudo mostrar que un número estaba mal, ordenar cuál, y decir cuánto tiene que valer si todo lo demás está bien. No pudo:

- saber que el playón está en la entrada del terreno y no pegado a la casa — la diferencia entre 85 y 75 m²;
- saber si a los escalones se les reviste la alzada además de la pisada;
- decidir si `0,40` o 0,54 es el ancho real de la franja derecha.

La división del trabajo es estable en esta clase de tarea: el agente sostiene el modelo y la aritmética, el humano sostiene la verdad de campo. Lo que cambia es la calidad de las preguntas. Como el sistema de restricciones identifica qué medición es la que sostiene el resultado, el agente pregunta *remedí el lado derecho, vale 2 m²* en vez de *¿estás seguro de estos números?*.

## Qué generaliza

Lo transferible no es que un agente pueda leer un croquis. Es:

1. **Cualquier artefacto medido con redundancia se puede verificar mecánicamente.** Los planos cierran. También cierran las listas de materiales, los presupuestos de tiempo y los modelos financieros. La redundancia casi siempre ya está y simplemente no se ejercita.
2. **La verificación tiene que ser un programa, no una lectura.** Volver a correr el cierre después de cada corrección no costaba nada, que es la única razón por la que cuatro rondas fueron practicables y no tediosas.
3. **Las estimaciones independientes son las que hacen posible la atribución.** El cierre encuentra el error; medir el escaneo señala al culpable. Ninguna de las dos sola llegaba.
4. **El dibujo y el número tienen que salir de una sola fuente de verdad**, o en algún momento van a discrepar y nadie se va a dar cuenta.

El tiempo total fue menos de una hora, la mayor parte con el dueño caminando afuera con una cinta métrica. Esa proporción es el resultado real.
