# Ruta IA Frontend

Frontend del proyecto Ruta IA para Campuslands, una interfaz moderna construida con React y Vite para asistir a estudiantes con consultas sobre cursos, dudas técnicas y recomendaciones personalizadas impulsadas por IA.

## Descripción general

Esta aplicación permite a los estudiantes:

- Seleccionar o registrar un estudiante.
- Enviar consultas al asistente inteligente.
- Recibir respuestas generadas por IA con fuentes o cursos sugeridos.
- Explorar un catálogo de cursos.
- Consultar el historial de conversaciones.
- Calificar y comentar las respuestas recibidas.

La interfaz se integra con un backend que expone endpoints para estudiantes y consultas, usando Axios para la comunicación HTTP.

## Tecnologías utilizadas

- React 19
- Vite
- JavaScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Axios

## Requisitos previos

- Node.js 18 o superior
- npm o pnpm
- Backend de Ruta IA corriendo y accesible desde la URL configurada en variables de entorno

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/DeniseLH1/ruta-ia-frontend.git
   cd ruta-ia-frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno:

   ```bash
   cp .env.example .env
   ```

4. Ajusta la URL del backend en el archivo `.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

## Scripts disponibles

```bash
npm run dev
```

Inicia el entorno de desarrollo de Vite.

```bash
npm run build
```

Genera la versión de producción para despliegue.

```bash
npm run preview
```

Previsualiza la build de producción localmente.

```bash
npm run lint
```

Ejecuta ESLint para verificar la calidad del código.

## Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_BASE_URL` | URL base del backend para estudiantes y consultas | `http://localhost:3000/api` |

## Estructura del proyecto

```text
ruta-ia-frontend/
├── src/
│   ├── api/
│   │   └── axiosClient.js
│   ├── components/
│   │   ├── chat/
│   │   ├── courses/
│   │   ├── history/
│   │   ├── layout/
│   │   └── rating/
│   ├── services/
│   │   ├── consultationService.js
│   │   └── studentService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── README.md
└── package-lock.json
```

## Funcionalidades principales

### Chat con IA

- Entrada de mensajes del estudiante.
- Envío de consultas al backend.
- Visualización de respuestas de la IA.
- Manejo de estados de carga y errores.

### Gestión de estudiantes

- Selección de un estudiante previamente registrado.
- Registro de nuevos estudiantes desde la UI.
- Persistencia del ID del estudiante en `localStorage`.

### Curso y recomendaciones

- Recomendación de cursos relacionados con la consulta.
- Navegación hacia el catálogo de cursos.
- Visualización de fuentes o sugerencias devueltas por la API.

### Historial y calificación

- Consulta del historial por estudiante.
- Apertura de modal de calificación por respuesta.
- Envío de calificación y comentario al backend.

## Endpoints esperados del backend

La interfaz asume los siguientes endpoints del backend:

- `GET /students`
- `POST /students`
- `POST /consultation`
- `GET /consultation/student/:studentId`
- `POST /consultation/:id/rate`

## Ejemplo de uso

1. Levanta el backend de Ruta IA.
2. Configura la variable `VITE_API_BASE_URL`.
3. Ejecuta:

   ```bash
   npm run dev
   ```

4. Abre la aplicación en el navegador.
5. Registra o selecciona un estudiante y empieza a consultar.

