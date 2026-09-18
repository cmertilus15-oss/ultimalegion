# CASO CERRADO — EL ESTADO DE LOS MUERTOS
### Centro de entrenamiento intensivo · La Última Legión

Aplicación web para preparar el evento **Caso Cerrado** del Camporee Interno 2026.
Todo el contenido sale del material **C 07 — La Naturaleza Humana**.

---

## 1 · CÓMO ABRIRLA

**Lo más rápido:** abre `index.html` con doble clic. Funciona.

**Mejor (para probar el modo offline y la instalación):** hace falta un servidor local,
porque el *service worker* no funciona con `file://`.

```bash
cd caso-cerrado
python3 -m http.server 8000
```
Luego abre `http://localhost:8000` en el navegador.

---

## 2 · CÓMO ABRIRLA DESDE EL CELULAR

Con la computadora y el celular en **la misma red wifi**:

1. En la computadora, averigua tu IP local:
   - Windows: `ipconfig` → busca "Dirección IPv4"
   - Mac o Linux: `ifconfig` o `ip a`
2. Arranca el servidor: `python3 -m http.server 8000`
3. En el celular abre: `http://TU-IP:8000` (por ejemplo `http://192.168.1.15:8000`)

---

## 3 · CÓMO INSTALARLA EN ANDROID

Una vez abierta en Chrome:

1. Toca los tres puntos ⋮ arriba a la derecha
2. Toca **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**
3. Aparece el icono en el escritorio del celular

Desde ahí abre a pantalla completa, sin barra del navegador, como una app de verdad.

> Para que aparezca la opción de instalar, la página debe servirse por **https** o desde
> **localhost**. Si la abres por IP local con http, quizá no salga el botón: usa el
> paso 5 (publicar gratis) y ahí sí sale.

---

## 4 · CÓMO FUNCIONA SIN INTERNET

La primera vez que la abras, el *service worker* guarda todos los archivos en el celular.
A partir de ahí **funciona sin datos y sin wifi**.

Para comprobarlo: abre la app, activa el modo avión, y recárgala. Debe seguir funcionando.

El progreso se guarda en `localStorage`, **en ese teléfono**. No se sincroniza entre
dispositivos y no necesita cuenta.

---

## 5 · CÓMO PUBLICARLA GRATIS

### Opción A · Netlify Drop (30 segundos, sin cuenta)
1. Entra a **app.netlify.com/drop**
2. Arrastra la carpeta `caso-cerrado` completa
3. Te da un enlace tipo `https://algo-random.netlify.app`
4. Pásalo por WhatsApp al grupo

### Opción B · GitHub Pages
1. Crea un repositorio nuevo en GitHub
2. Sube **todos** los archivos (no la carpeta: su contenido)
3. Settings → Pages → Branch: `main` → carpeta `/ (root)` → Save
4. En un minuto queda en `https://tuusuario.github.io/turepo`

### Opción C · Vercel
1. Entra a **vercel.com**, importa el repositorio
2. Framework: **Other**. Deploy.

**Qué subir en todos los casos:**
```
index.html · style.css · data.js · script.js
manifest.json · service-worker.js · assets/
```

---

## 6 · CÓMO MODIFICAR O AGREGAR PREGUNTAS

Todo está en **`data.js`**. No hay que tocar nada más.

```javascript
{
  id: 81,                      // único, no repetir
  cat: "muertos",              // creacion · pecado · alma · muertos · prohibicion · saul · satanas
  type: "mc",                  // mc = opción múltiple · vf = verdadero/falso · open = abierta
  difficulty: 2,               // 1 fácil · 2 normal · 3 difícil · 4 capciosa
  q: "¿Tu pregunta?",
  opts: ["A","B","C","D"],     // solo si type es "mc"
  a: 1,                        // mc: índice 0-3 · vf: true/false · open: texto de la respuesta
  verse: "Ecl. 9:5",
  exp: "Explicación breve que sale después de responder.",
  keywords: ["palabra","clave"] // solo para type "open": el modo jurado compara con esto
}
```

**Para preguntas abiertas (modo jurado):** las `keywords` son lo que se compara.
Se acepta la respuesta si el usuario acierta la mitad o más de las palabras clave.
Pon palabras que **tienen que estar**, no relleno.

---

## 7 · CÓMO BORRAR EL PROGRESO

Dentro de la app: botón **"Borrar mi progreso"** al final de la pantalla de inicio.

A mano, desde la consola del navegador:
```javascript
localStorage.removeItem('casocerrado_v1')
```

---

## 8 · QUÉ TRAE LA APP

| Sección | Qué hace |
|---|---|
| Entrenamiento rápido | Eliges 5, 10, 15 o 30 minutos y la app arma el plan |
| Estudiar | Los 8 módulos del material en tarjetas cortas |
| Memoria prioritaria | 18 claves para repaso de emergencia |
| Arsenal de versículos | Los 9 pasajes, con estado no dominado / en proceso / memorizado |
| Flashcards | Repetición inteligente: lo que fallas vuelve más veces |
| Quiz | Rápido, normal, difícil y capcioso |
| Simulacro | 15 preguntas con racha y puntuación |
| Modo jurado | Escribes la respuesta; compara por palabras clave |
| 5 segundos | Cronómetro que te obliga a responder de inmediato |
| Casos prácticos | 15 situaciones para aplicar lo aprendido |
| No te dejes confundir | 6 pares de conceptos que se mezclan |
| Mis errores | Solo lo que fallaste, y un botón para entrenarlo |
| Examen final | 50 preguntas, resultados solo al terminar |
| Repaso 10 minutos | La pantalla que se lee justo antes de pasar al frente |

---

## 9 · CONTENIDO

80 preguntas · 9 versículos · 18 claves de memoria · 8 módulos · 15 casos · 6 confusiones.

Todo extraído de `C 07 — La Naturaleza Humana`. Donde el material no desarrolla algo,
la app lo dice en vez de inventarlo.

**Tres avisos que trae la app y que conviene saber:**
- Las preguntas 4 y 7 del material son idénticas.
- La pregunta 5 está cortada en el PDF: dice "son del" y debe decir "son mías".
- La pregunta 13 pide el nombre de la mujer de Endor. Ni el material ni la Biblia lo dan.

---

*La Última Legión · Conquistando almas para Cristo*
