---
eyebrow: Flujos con IA · Medición
title: Le di a Claude Code una foto de un croquis a mano
lead: "Un dibujo en papel cuadriculado, veintidós cotas escritas a mano, y una sola pregunta — cuánto piso comprar. Lo que quería era un número. Lo que obtuve fue una prueba de que el croquis estaba mal, un ranking de cuál medida estaba mintiendo, y una lista de las que valía la pena salir a verificar con la cinta."
excerpt: "Un croquis fotografiado cuyas medidas no cerraban por 50 cm. Cómo usé Claude Code para encontrar el error, cómo identificó al culpable midiendo el dibujo mismo, la ronda en la que se contradijo a sí mismo, y dónde quedó trabado hasta que alguien salió con la cinta."
metaDescription: "Convertir un croquis a mano fotografiado en metros cuadrados con Claude Code — cierre de polígono como test de consistencia, medición en píxeles del escaneo para atribuir el error, y hasta dónde no pudo llegar el agente."
---

## Qué le pasé realmente

Un PDF de una sola página hecho con una app de notas del celular: una foto raster de tinta sobre papel cuadriculado. Una casa, la vereda que la rodea, veintidós cotas escritas a mano en notación argentina — `8,40` — algunas rotadas noventa grados para acompañar líneas verticales. Sin datos vectoriales, sin capas, sin estructura.

La pregunta era un solo número: metros cuadrados de piso a comprar.

Esperaba que la parte difícil fuera leer la letra. No lo era. Un modelo actual mira esa página y saca los números y aproximadamente dónde están, y lo hace de una. **Leer era la parte fácil, y es la parte que todos esperan que sea difícil.**

La parte difícil es que leer produce una *creencia*, y una creencia sobre la letra de alguien es mala base para comprar 93 m² de cerámico. Así que lo primero que pedí no fue el área. Fue una forma de testear la lectura.

## Convirtió el croquis en un test

La respuesta con la que volvió es obvia en retrospectiva y no se me había ocurrido. Cualquier contorno cerrado, recorrido una vez, vuelve al punto de partida. Los vectores de los lados suman cero. Para un plano alineado a los ejes las dos componentes se separan:

```
Σ dx = 0        Σ dy = 0
```

Lo que significa que **un contorno completamente acotado está sobredeterminado**. Cada lado horizontal aparece en una ecuación, cada vertical en la otra, y nada en el acto de medir fuerza a que ninguna de las dos se cumpla. Esa redundancia es todo el punto: convierte *¿medí bien esto?* de un juicio a una cuenta.

Escribió el chequeo como un script y lo corrió contra los números exactamente como estaban escritos en el croquis:

```
horizontal   8,40 + 2,40 + 0,80  = 11,60   yendo a la derecha
             0,40 + 4,17 + 7,00  = 11,57   yendo a la izquierda  → 3 cm

vertical     2,60 + 9,00 + 3,53  = 15,13   bajando por la derecha
             3,53 + 6,10 + 6,00  = 15,63   subiendo por la izquierda → 50 cm
```

Tres centímetros en once metros es error de cinta. Cincuenta centímetros es un número equivocado.

Eso es un terreno genuinamente distinto a "acá tenés tu área, son unos 85 metros cuadrados". El sistema había probado que la entrada era inconsistente antes de que nadie gastara plata. Lo que no podía hacer era decir *cuál* número estaba mintiendo — y el resto de la sesión fue sobre eso.

## Donde el cuello de botella era yo

La aritmética es trivial. Lo que no es trivial es decidir **qué segmento etiqueta cada número escrito a mano**, y ahí tuve que intervenir todo el tiempo.

Un caso concentró casi toda la dificultad. Un `1,45` escrito a lo largo de una línea vertical corta cerca del fondo tiene dos lecturas plausibles:

- **(a)** el ancho de la vereda por detrás de la casa, o
- **(b)** el escalón en el contorno propio de la casa en ese punto.

Las dos son consistentes con dónde está la tinta. Implican geometrías distintas y unos 2 m² de diferencia. Yo lo leí como (a). El dueño me corrigió a (b).

La respuesta útil no era ninguna de las dos, y salió del sistema de restricciones y no del dibujo: los dos segmentos son *el mismo segmento* si y solo si la losa del patio arranca al ras del borde exterior de la vereda — y arranca así. Una etiqueta estaba legítimamente haciendo dos trabajos, que es exactamente por qué se había escrito un solo número.

Ese es el patrón que vale la pena notar, y es por qué resolver restricciones le gana a leer con más atención. No solo encuentra errores. **Recupera hechos sobre el objeto físico que nadie escribió y que a nadie se le habría ocurrido enunciar.**

## Después midió el dibujo mismo

El cierre prueba que existe una inconsistencia. Atribuirla a un número específico necesita evidencia de afuera del sistema de restricciones, y yo no tenía ninguna — el dueño no iba a volver a medir las veintidós.

Su idea fue usar el escaneo como evidencia, con el argumento de que un croquis dibujado en papel cuadriculado está aproximadamente a escala aunque no sea preciso. Esta es la movida que yo no habría hecho, y es lo más interesante de todo el ejercicio:

1. Rasterizar la página a una resolución conocida — `pdftoppm -r 200 -png -gray`.
2. Umbralizar. Los trazos de lapicera son mucho más oscuros que la grilla impresa, así que un corte en `pixel < 110` aísla el dibujo.
3. Sumar la máscara booleana por cada eje. Un trazo recto largo produce un pico en la suma por columna (líneas verticales) o por fila (horizontales). Las corridas por encima de un umbral son las líneas dibujadas; el argmax dentro de cada corrida es su posición en píxeles.
4. Fijar la escala con una cota confiable. El borde superior de `8,40` mide 650 px → 77,4 px/m.
5. Convertir cada posición detectada a metros y comparar cada segmento contra su etiqueta escrita a mano.

Todos los segmentos coincidían con su etiqueta dentro de 0,3 m — excepto uno. La vertical larga de la derecha etiquetada `9,00` medía unos 9,8 m a la escala del propio dibujo.

Fue cuidadoso al decir qué es y qué no es eso. Los dibujos a mano se deforman, y este se deforma más donde los espacios son angostos, así que no es una prueba. Pero combinado con una falla de cierre de 50 cm apunta a un número en lugar de a cinco. Esa es la diferencia entre *volvé a medir el lado derecho, vale 2 m²* y *¿estás seguro de estos números?* — y es la diferencia entre que el dueño salga una vez y que no se moleste.

Vale enunciar la precondición, porque acota el truco: esto solo funciona porque el croquis estaba dibujado en papel cuadriculado con proporciones honestas. Un dibujo deliberadamente esquemático no da nada.

## La ronda en la que se contradijo

| Ronda | Cadena izquierda | Cadena derecha | Residuo vertical |
|---|---|---|---|
| Como está escrito | 6,00 + 6,10 = 12,10 | 2,60 + 9,00 = 11,60 | 50 cm — derecha corta |
| Etiqueta reasignada | 6,00 + 6,10 = 12,10 | 2,60 + 9,00 = 11,60 | 50 cm — propuesta: 9,50 |
| Izquierda remedida | 5,80 + 5,50 = 11,30 | 2,60 + 9,00 = 11,60 | 30 cm — derecha **larga**, propuesta: 8,70 |
| Izquierda remedida otra vez | 5,90 + 5,68 = 11,58 | 2,60 + 9,00 = 11,60 | **2 cm** — cierra |

La ronda tres es el evento instructivo, y es la parte que querría que viera cualquiera que haga esto. Bajo la primera hipótesis la corrección a `9,00` era *hacia arriba*, a 9,50. Bajo la segunda era *hacia abajo*, a 8,70. Las dos se derivaron correctamente de los datos disponibles en ese momento. Se contradicen entre sí.

Un residuo te dice la magnitud de una inconsistencia, no su causa. La atribución es un problema aparte y solo se zanja con más mediciones. **Un agente que reporta la corrección propuesta sin reportar que es una de varias atribuciones posibles está produciendo un número que parece más firme de lo que es** — y tuve que pedir ese encuadre explícitamente antes de obtenerlo. Es en lo que más insistiría si volviera a hacer esto.

Volver a correr el cierre después de cada corrección no costaba nada, que es la única razón por la que cuatro rondas fue practicable en vez de tedioso. Ese es el verdadero argumento para hacer del chequeo un programa en lugar de una lectura.

## Lo que cayó de arriba sin que nadie lo midiera

Una vez que el contorno cierra, el resto de la geometría queda determinado. Ninguno de los anchos de vereda se midió nunca; son consecuencias:

| | metros |
|---|---|
| Vereda del frente | 1,73 |
| Lado izquierdo, tramo superior | 2,03 |
| Lado izquierdo, tramo inferior | 1,73 |
| Vereda del fondo | 1,45 |
| Vereda de la derecha | 0,54 |

También la pared derecha de la casa, 8,05 m, que no lleva ninguna cota en ninguna parte del croquis.

La coherencia interna de ese conjunto es en sí misma un chequeo, y lo señaló sin que se lo pidiera. Cuatro de los cinco anchos caen entre 1,45 y 2,03 m, que es lo que produce realmente una persona haciendo una vereda. Si uno hubiera dado 0,2 y otro 3,4, la topología habría estado mal en algún lado y el cierre habría sido una casualidad.

La vereda derecha es la excepción y también es instructiva: 0,54 m por cierre contra `0,40` escrito en el croquis. Esos 14 cm son exactamente el residuo del perímetro propio de la casa — `5,45 + 2,78 = 8,23` contra `4,17 + 5,30 − 1,10 = 8,37`. El error de cinta acumulado tiene que caer en algún lado, y cae en la dimensión más angosta, porque es donde un error absoluto fijo es menos visible.

## Dibujo y número de una sola fuente

El plano limpio es generado, no dibujado: dos arreglos de vértices, uno para el contorno exterior y otro para la casa, convertidos a paths SVG en un loop. El texto de las cotas va en el punto medio de cada segmento con un offset por segmento, que es la única parte que necesita retoque manual — las etiquetas chocan, y dónde chocan no es predecible a partir de la geometría.

La región pavimentada es un único path que usa los dos polígonos con `fill-rule="evenodd"`, así que la casa es un *agujero* y no algo que haya que restar descomponiendo la vereda en rectángulos. Eso importa más de lo que suena: la descomposición en rectángulos es donde normalmente se rompen las cuentas a mano de este tipo.

El área sale de la fórmula de Gauss sobre los mismos arreglos:

```
A = ½ |Σ (xᵢ · yᵢ₊₁ − xᵢ₊₁ · yᵢ)|

exterior   138,09 m²
casa        73,60 m²
pavimento   64,49 m²
```

Más una losa de auto separada y tres escalones medidos aparte: **84,95 m² netos**, 93,4 m² con 10 % de desperdicio de corte.

Como el dibujo y el área salen de los mismos arreglos, no pueden estar en desacuerdo. La falla habitual en este tipo de trabajo es un plano que dice una cosa y una planilla que dice otra; derivar las dos de una sola fuente elimina esa clase de error por completo.

## La herramienta de verificación que mentía

Un desvío que merece un párrafo, porque casi cuesta una tarde. El SVG generado hay que mirarlo, y un agente no puede mirar un archivo — tiene que renderizarlo a un raster y leer eso de vuelta.

El `convert` de ImageMagick estaba en la máquina y renderizó el SVG **mal**: métricas de fuente incorrectas, `viewBox` mal manejado, una salida que parecía un bug serio en el generador. No lo era. Chrome headless renderizó el mismo archivo correctamente:

```bash
google-chrome --headless --disable-gpu --screenshot=out.png \
  --window-size=1240,1150 --hide-scrollbars "file://$PWD/plan.html"
```

Así se encontraron y corrigieron dos colisiones de etiquetas que eran invisibles en el código fuente. El punto más amplio: una herramienta de verificación que discrepa en silencio con el renderer objetivo es peor que no tener verificación, y la única forma de descubrirlo es contrastar su salida contra algo que ya sabés que está bien.

## Lo que no pudo hacer

Todos los hechos genuinamente nuevos acá vinieron de la persona con la cinta en la mano. El agente podía mostrar que un número estaba mal, ordenar cuál, y decir cuánto debe valer si todo lo demás es correcto. No podía:

- saber que la losa del auto está en la entrada del lote y no pegada a la casa — la diferencia entre 85 y 75 m²;
- saber si las contrahuellas de los escalones se revisten además de las huellas;
- decidir si `0,40` o 0,54 es el ancho verdadero de la vereda derecha.

La división del trabajo es la misma con la que me sigo cruzando: el agente tiene el modelo y la aritmética, el humano tiene la verdad de campo. Lo que cambia es la **calidad de las preguntas**. Como el sistema de restricciones identifica qué medición es la que carga peso, el pedido pasa a ser *volvé a medir el lado derecho, vale 2 m²* en lugar de *¿estás seguro de estos números?*. Esa es una pregunta que alguien efectivamente va a ir a contestar.

## Qué generaliza

1. **Cualquier artefacto medido con redundancia puede chequearse mecánicamente.** Los planos cierran. También las listas de materiales, los presupuestos de tiempos y los modelos financieros. La redundancia normalmente ya está ahí y simplemente no se ejercita.
2. **Pedí el test antes que la respuesta.** No pregunté "cuál es el área". Pregunté cómo íbamos a saber que los números estaban mal. Todo lo útil salió de ese orden.
3. **Las estimaciones independientes son lo que hace posible la atribución.** El cierre encuentra el error; medir el escaneo apunta al culpable. Ninguna de las dos sola llega.
4. **Hacé que reporte la ambigüedad, no solo la corrección.** La ronda tres habría sido un error caro si yo hubiera actuado sobre la ronda dos.
5. **El dibujo y el número tienen que venir de una sola fuente de verdad**, o en algún momento van a discrepar y nadie se va a dar cuenta.

El tiempo total fue menos de una hora, la mayor parte el dueño caminando afuera con una cinta métrica. Esa proporción es el resultado real.
