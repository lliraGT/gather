---
name: Gather
description: Sistema de registro de asistencia para Centro Bíblico El Camino
colors:
  navy-deep: "#1E3A5F"
  blue-active: "#2E78C8"
  blue-light: "#7BB3E8"
  blue-border: "#D8E8F5"
  blue-surface: "#E6F0FA"
  navy-mid: "#3D5878"
  blue-muted: "#7A95B0"
  page-bg: "#F8F9FA"
  card-bg: "#FFFFFF"
  ink: "#1B1B1B"
  amber: "#F59E0B"
  positive: "#16A34A"
  negative: "#DC2626"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.05em"
rounded:
  xl: "12px"
  lg: "8px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.blue-active}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.navy-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-on-dark:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "rgba(255,255,255,0.8)"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  summary-panel:
    backgroundColor: "{colors.navy-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  input:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
---

# Design System: Gather

## 1. Overview

**Creative North Star: "El Libro de Asistencias"**

Gather se diseña como un libro de registro ministerial digitalizado: preciso, sin ornamentos, con el peso específico de lo que registra. Cada número en pantalla representa una persona que decidió estar presente; la interfaz honra ese hecho siendo fiel y discreta, nunca decorativa. La claridad no es frialdad — es respeto.

La paleta orbita un azul profundo que no pertenece al manual corporativo ni al SaaS genérico. Es el Azul Nocturno del cielo de Guatemala justo antes del alba: serio, tranquilo, presente. Las superficies son blancas o casi blancas porque el protagonismo lo tienen los datos, no el fondo. El ámbar aparece puntualmente como señal de atención — nunca como adorno. Un insight en el sistema: la escala tonal del azul primario *contiene* todos los colores de borde, superficie y muted del sistema. La coherencia no es un accidente.

El sistema rechaza cuatro trampas con nombre propio: el kitsch religioso (palomas, cruces decorativas, cursivas doradas), el SaaS genérico (métricas hero con tarjetas idénticas), el dashboard-terminal (dark mode sin justificación de contexto), y la rigidez bancaria (navy-y-gris sin alma). Si ves alguna de las cuatro en una pantalla de Gather, hay algo que corregir.

**Key Characteristics:**
- Azul Nocturno profundo como ancla de identidad — no navy corporativo, no azul de startup
- Superficies blancas con sombra mínima; la profundidad surge del contraste de color, no de elevación
- Tipografía sans-serif sin personalidad llamativa — la herramienta no debe llamar atención sobre sí misma
- Responsive real: el formulario de registro en móvil es tan fluido como el dashboard en laptop
- Español de Guatemala como idioma nativo — no es una traducción
- Panel de resumen navy (fondo `#1E3A5F`) como componente firma: la inversión del sistema

## 2. Colors: La Paleta Nocturna

Tres capas de azul que descienden del profundo al casi-blanco. El ámbar es el único calor y tiene un rol único. Verde y rojo solo para deltas numéricos.

### Primary
- **Azul Nocturno** (`#1E3A5F`): La firma visual de Gather. Texto de KPIs destacados, fondo del panel de resumen en formularios, logotipo, texto activo en navegación, avatar del usuario. Cuando aparece como fondo, el texto se invierte a blanco.
- **Azul Fiel** (`#2E78C8`): El color de acción y datos. Botones primarios, estado activo en navegación, icono activo en sidebar, línea principal en gráficos, ring de focus en inputs. La acción siempre es Azul Fiel.

### Secondary
- **Azul Claro** (`#7BB3E8`): Acento suave. Círculos secundarios del logo (escala de la congregación). Paso intermedio en la identidad visual cuando se necesita azul sin el peso del primario.

### Neutral
- **Neblina** (`#D8E8F5`): Borders y divisores — sidebar, bottom nav, separadores de sección dentro de navegación.
- **Cielo Pálido** (`#E6F0FA`): Fondo de estado activo en navegación, fondo de avatar de usuario. La forma más suave del azul del sistema.
- **Penumbra** (`#3D5878`): Texto de navegación inactiva y estado hover. Un paso más oscuro que el Azul Nocturno hacia el neutro.
- **Gris Azulado** (`#7A95B0`): Etiquetas de sección en sidebar, rol de usuario, metadatos secundarios. El "bajo volumen" del sistema.
- **Fondo** (`#F8F9FA`): Fondo de página. Casi blanco — suficientemente distinto del blanco de las tarjetas para crear separación visible.
- **Superficie** (`#FFFFFF`): Fondo de tarjetas, sidebar, bottom nav. El canvas de trabajo.
- **Tinta** (`#1B1B1B`): Texto de cuerpo principal. Casi negro — legible, sin el contraste agresivo del negro puro.
- **Ámbar Tendencia** (`#F59E0B`): Exclusivamente para la línea de tendencia en gráficos y badges de indicador de tendencia temporal. El único calor en el sistema.
- **Delta Positivo** (`#16A34A`): Incrementos de asistencia. Solo para variaciones numéricas.
- **Delta Negativo** (`#DC2626`): Decrementos de asistencia. Solo para variaciones numéricas.

**The Two-Blue Rule.** Azul Nocturno es identidad y presencia; Azul Fiel es acción y datos. Prohibido intercambiarlos. Un botón principal es Azul Fiel. El panel de resumen es Azul Nocturno. Confundirlos rompe la jerarquía semántica del sistema.

**The One Warm Rule.** El ámbar existe solo como señal de tendencia temporal. Prohibido usarlo en fondos de sección, decoración, estados de éxito, o cualquier elemento sin relación directa con variación en el tiempo.

**The Delta-Only Rule.** Verde (`#16A34A`) y rojo (`#DC2626`) son exclusivos de variaciones de asistencia. Prohibido usarlos para estados de UI (éxito, error de formulario), categorías de contenido, o decoración. Para errores de formulario, usar texto rojo bajo el campo sin cambiar el borde.

## 3. Typography

**Font:** System UI stack — `system-ui, -apple-system, 'Segoe UI', sans-serif`
*(El proyecto no configura fuente custom actualmente. Candidato natural para una mejora: Geist Variable o Inter Variable — ambos encajan con el registro de la herramienta y mejoran la consistencia cross-platform.)*

**Character:** Neutral y preciso. La tipografía no tiene personalidad propia — deja que los datos hablen. El peso hace el trabajo jerárquico; el tamaño lo refuerza. No hay serif, no hay display dramático, no hay cursiva en ningún rincón del sistema.

### Hierarchy
- **Display** (700, 2.25rem / 36px, line-height 1.1, letter-spacing -0.01em): Los números KPI — último domingo, promedio, máximo histórico. Son el protagonista de cada tarjeta de datos. Un solo número por card en este nivel.
- **Headline** (600, 1.25rem / 20px, line-height 1.4): Títulos de página ("Dashboard", "Registrar asistencia"). Solo uno por vista. No usar en cards.
- **Title** (500, 0.875rem / 14px, line-height 1.4): Etiquetas de tarjeta ("Últimas 8 semanas", "Presencial"), nombre del usuario en footer de sidebar.
- **Body** (400, 0.875rem / 14px, line-height 1.5): Contenido de tablas, valores de formulario, descripciones. Máximo 65–75 caracteres por línea.
- **Label** (500, 0.75rem / 12px, letter-spacing 0.05em, a veces uppercase): Etiquetas de campo, secciones de navegación en sidebar, metadatos de tarjeta. Cuando es uppercase, siempre con tracking explícito.

**The No-Tight-Uppercase Rule.** Texto en uppercase sin `letter-spacing` mínimo de 0.05em está prohibido. El uppercase comprimido produce ilegibilidad y se ve como descuido, no como diseño. Todo el uppercase en el sistema (labels de sección, headers de grupo en formularios) va con tracking declarado.

## 4. Elevation

El sistema es plano por defecto. La profundidad se construye por contraste de color: el fondo de página (`#F8F9FA`) contra las tarjetas blancas, y el panel de resumen navy (`#1E3A5F`) contra ambos. La jerarquía visual es cromática, no de profundidad física.

Las sombras existen pero son casi invisibles: son una señal semántica ("soy una superficie sobre el fondo") sin aporte dramático. Si la sombra es visible a distancia, es demasiado grande.

### Shadow Vocabulary
- **Elevación mínima** (`0 1px 2px rgb(0 0 0 / 0.05)`): Tarjetas de datos, panel de formulario en login. La única sombra del sistema.

**The Flat-By-Default Rule.** Las superficies están planas en reposo. La única sombra permitida es la elevación mínima. Ninguna tarjeta, modal, o panel debe usar `shadow-md` o superior sin justificación explícita de estado interactivo (hover con acción, modal elevado sobre overlay).

## 5. Components

### Buttons

Los botones tienen dos contextos: sobre fondo claro (la mayoría) y sobre el panel navy (dentro del panel de resumen). Cada contexto tiene su propio set de variantes — no intercambiar.

**Sobre fondo claro:**
- **Shape:** Bordes suavemente redondeados (8px)
- **Primary:** bg `#2E78C8`, text white, padding 10px 16px, font-size 14px, font-weight 500
- **Hover:** bg `#1E3A5F` — el azul se profundiza, nunca cambia de familia. Transition 150ms ease.
- **Disabled:** opacity 50%, cursor not-allowed
- **Period selector (estado, no acción):** inactive: bg `#F3F4F6` text `#6B7280`; active: bg `#2E78C8` text white; rounded-md; font-size 12px; padding 4px 10px

**Sobre panel navy:**
- **Primary on dark:** bg white, text `#1E3A5F`, rounded-lg, font-weight 600. Hover: bg `rgba(255,255,255,0.9)`
- **Ghost on dark:** border `rgba(255,255,255,0.3)`, text `rgba(255,255,255,0.8)`, bg transparent. Hover: bg `rgba(255,255,255,0.1)`

### Cards / Containers

La superficie de trabajo del sistema. Blancas, bordes generosamente redondeados, sombra casi invisible.
- **Corner Style:** Generously rounded (12px)
- **Background:** Blanco (`#FFFFFF`)
- **Shadow Strategy:** Solo elevación mínima — `0 1px 2px rgb(0 0 0 / 0.05)`. Sin sombra en hover a menos que la tarjeta sea interactiva con acción de navegación.
- **Border:** Ninguno — la sombra mínima y el contraste con el fondo de página crean la separación.
- **Internal Padding:** 20px para tarjetas de datos; 16px para tarjetas compactas o paneles de formulario.

**Summary Panel (componente firma):** La inversión del sistema. Fondo Azul Nocturno, texto blanco. Contiene los totales en tiempo real durante el registro de asistencia. Tiene acciones primarias (Guardar, Cancelar). No es decorativo — tiene información crítica.
- **Background:** `#1E3A5F`
- **Text hierarchy:** white para valores, `rgba(255,255,255,0.7)` para labels secundarios
- **Dividers internos:** `rgba(255,255,255,0.2)` — lineas border-t

### Inputs / Fields

Simples y claros. El borde es la affordance; el focus ring azul es el feedback.
- **Style:** border 1px `#E5E7EB`, bg white, border-radius 8px, padding 10px 16px, font-size 14px
- **Focus:** ring 2px `#2E78C8` offset 0, outline none — el Azul Fiel como señal de foco
- **Placeholder:** `#9CA3AF` — verificar contraste 4.5:1 si se cambia la fuente base
- **Error:** texto `#DC2626` bajo el campo, sin cambiar el borde del input (reduce ansiedad visual)
- **Font-size móvil:** mínimo 16px para evitar zoom automático en iOS

### Navigation

**Sidebar (≥768px):** Fondo blanco, borde derecho Neblina (`#D8E8F5`), 200px de ancho fijo.
- **Section Labels:** 10px, uppercase, letter-spacing 0.08em, color Gris Azulado (`#7A95B0`)
- **Nav Item Default:** text `#3D5878` (Penumbra), font-size 13px
- **Nav Item Active:** bg `#E6F0FA`, text `#1E3A5F`, icon `#2E78C8`, font-weight 500
- **Nav Item Hover:** mismos colores que Active — preview del destino
- **User Footer:** borde superior Neblina, avatar circular bg `#E6F0FA` text `#1E3A5F`

**Bottom Nav (<768px):** Fondo blanco, borde superior Neblina. Items centrados con icon 20px + label 10px.
- **Active:** `#2E78C8` (Azul Fiel)
- **Inactive:** `#9CA3AF` (gray-400)

### Chips / Delta Badges

Pills compactas para variaciones de asistencia. Comunican dirección numérica sin ambigüedad.
- **Positive:** bg `#F0FDF4`, text `#15803D` — verde muy suave
- **Negative:** bg `#FEF2F2`, text `#DC2626` — rojo muy suave
- **Neutral:** bg `#F3F4F6`, text `#6B7280` — gris neutro
- **Shape:** border-radius 9999px, padding 2px 8px, font-size 12px, font-weight 600
- **Prohibido:** usar verde/rojo para cualquier cosa que no sea variación de asistencia numérica

## 6. Do's and Don'ts

### Do:
- **Do** usar Azul Fiel (`#2E78C8`) para botones primarios, estados activos, líneas de datos y focus rings — es el color de acción del sistema.
- **Do** reservar Azul Nocturno (`#1E3A5F`) para identidad, presencia, y el panel de resumen — es el color de peso.
- **Do** usar sombra mínima (`0 1px 2px rgb(0 0 0 / 0.05)`) en tarjetas — solo para señalar "soy una superficie", nunca para drama visual.
- **Do** aplicar `letter-spacing` explícito a todo texto en uppercase — mínimo 0.05em para labels, 0.08em para secciones de navegación.
- **Do** verificar que el texto placeholder cumpla contraste 4.5:1 — el placeholder no está exento de las reglas de contraste.
- **Do** usar el ámbar exclusivamente para líneas de tendencia temporal en gráficos — nunca como color de categoría o fondo decorativo.
- **Do** diseñar pensando en el usuario de pie en el salón con el celular: tap targets ≥44px, inputs con font-size ≥16px para evitar zoom en iOS.
- **Do** mantener la coherencia cromática tonal: los colores de borde (`#D8E8F5`), superficie activa (`#E6F0FA`) y muted (`#7BB3E8`) son pasos de la misma escala tonal que el Azul Fiel.

### Don't:
- **Don't** usar palomas, cruces decorativas, gradientes dorados, o fuentes serif cursivas. Gather es una herramienta operativa ministerial, no material de adoración o comunicación visual de la iglesia.
- **Don't** usar el template "big number + badge + supporting stats" en un grid de tarjetas idénticas. Es el molde SaaS genérico que el sistema rechaza explícitamente.
- **Don't** usar dark mode ni fondos oscuros tipo terminal. El contexto de uso (salón de iglesia bajo luz natural) no lo justifica y aleja a usuarios no técnicos.
- **Don't** producir rigidez bancaria: navy-y-gris sin calor, sin alma. La paleta de Gather tiene carácter propio — el Azul Nocturno es profundo, no clínico.
- **Don't** usar `border-left` mayor a 1px como stripe de color en tarjetas, alertas, o listas. Si se necesita énfasis, usar fondo tintado o ícono.
- **Don't** usar gradient text (`background-clip: text` con fondo gradiente). Siempre color sólido.
- **Don't** usar `shadow-md` o superior en tarjetas en reposo. La elevación dramática no pertenece a este sistema.
- **Don't** intercambiar el rol de Azul Nocturno (`#1E3A5F`) y Azul Fiel (`#2E78C8`). Nocturno = identidad y peso; Fiel = acción y datos. Confundirlos rompe la gramática semántica del sistema.
- **Don't** usar verde o rojo para estados de formulario (éxito, error de campo) ni para categorías de contenido. Esos colores solo significan "la asistencia subió" o "la asistencia bajó".
