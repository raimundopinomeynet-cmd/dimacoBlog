# LLM Brand Monitor

Sistema de Monitoreo de Posicionamiento de Marca en LLMs (OpenAI y Google Gemini).

## Descripcion

Esta aplicacion web permite monitorear automaticamente como los modelos de lenguaje (LLMs) perciben y mencionan tu marca. Ejecuta prompts personalizados contra OpenAI GPT-4 y Google Gemini, analiza las respuestas y genera metricas de posicionamiento de marca.

### Caracteristicas principales

- **Configuracion segura de API keys**: Encriptacion AES-256 para almacenar claves de API
- **Gestion de proyectos**: Multiples proyectos con marca, industria, servicio y pais
- **Prompts personalizados**: Hasta N prompts de prueba por proyecto
- **Ejecucion automatizada**: Cron job semanal (lunes 8 AM hora Chile)
- **Analisis de respuestas**: Mencion de marca, sentimiento, prominencia y calidez
- **Dashboard interactivo**: Graficos evolutivos con comparativa OpenAI vs Gemini
- **Embebible en HubSpot**: Configurado para funcionar en iframe

## Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS + Radix UI |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (preparado) |
| Encryption | CryptoJS (AES-256) |
| Scheduling | Vercel Cron |
| Hosting | Vercel |

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── cron/          # Cron job endpoint
│   │   ├── dashboard/     # Dashboard data
│   │   ├── execute/       # Ejecutar prompts
│   │   ├── executions/    # Historial de ejecuciones
│   │   ├── projects/      # CRUD proyectos
│   │   └── settings/      # Configuracion API keys
│   ├── executions/        # Pagina de ejecuciones
│   ├── projects/          # Pagina de proyectos
│   ├── settings/          # Pagina de configuracion
│   └── page.tsx           # Dashboard principal
├── components/
│   ├── dashboard/         # Componentes del dashboard
│   ├── executions/        # Componentes de ejecuciones
│   ├── layout/            # Layout (sidebar)
│   ├── projects/          # Componentes de proyectos
│   ├── settings/          # Componentes de configuracion
│   └── ui/                # Componentes UI base
├── hooks/                 # Custom hooks
├── lib/
│   ├── llm/               # Clientes OpenAI y Gemini
│   ├── supabase/          # Clientes Supabase
│   ├── encryption.ts      # Funciones de encriptacion
│   └── utils.ts           # Utilidades
└── types/                 # TypeScript types
```

## Instalacion

### Prerrequisitos

- Node.js 18+
- Cuenta de Supabase
- Cuenta de Vercel
- API key de OpenAI y/o Google Gemini

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd dimacoBlog
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)

2. Ejecutar el schema SQL en el editor de Supabase:

```bash
# El schema esta en supabase/schema.sql
# Copiarlo y pegarlo en: SQL Editor > New Query
```

3. Obtener las credenciales:
   - Project URL: `Settings > API > URL`
   - Anon Key: `Settings > API > anon public`
   - Service Role Key: `Settings > API > service_role`

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption (generar con: openssl rand -hex 32)
ENCRYPTION_KEY=your-32-byte-hex-key

# Cron secret (generar con: openssl rand -hex 32)
CRON_SECRET=your-cron-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Deployment en Vercel

### 1. Conectar repositorio

1. Ir a [vercel.com](https://vercel.com)
2. Importar el repositorio de GitHub
3. Seleccionar el framework: Next.js

### 2. Configurar variables de entorno

En Vercel > Project Settings > Environment Variables, agregar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL` (URL de Vercel despues del primer deploy)

### 3. Configurar Cron Job

El archivo `vercel.json` ya configura el cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/execute-prompts",
      "schedule": "0 11 * * 1"
    }
  ]
}
```

**Nota sobre timezone**: El cron se ejecuta en UTC. `0 11 * * 1` significa 11:00 UTC, que equivale a:
- 8:00 AM Chile (verano, UTC-3)
- 7:00 AM Chile (invierno, UTC-4)

Para ajustar, modificar la hora en `vercel.json`.

### 4. Configurar Cron Secret

En Vercel > Project Settings > Environment Variables:
- Asegurar que `CRON_SECRET` este configurado
- El cron job enviara este secret como Bearer token

## Integracion con HubSpot

### Opcion 1: Iframe (Recomendado)

1. En HubSpot, crear una pagina o modulo personalizado
2. Insertar el iframe:

```html
<iframe
  src="https://your-app.vercel.app"
  width="100%"
  height="800px"
  frameborder="0"
  style="border: none;"
></iframe>
```

### Opcion 2: Subdominio

1. En HubSpot, configurar un subdominio personalizado
2. Apuntar el DNS al dominio de Vercel
3. En Vercel, agregar el dominio personalizado

## Uso

### 1. Configurar API Keys

1. Ir a **Configuracion**
2. Ingresar tu API key de OpenAI y/o Gemini
3. Guardar y verificar la conexion

### 2. Crear un Proyecto

1. Ir a **Proyectos**
2. Click en **Nuevo Proyecto**
3. Completar:
   - Nombre del proyecto
   - Nombre de la marca a monitorear
   - Industria
   - Servicio especifico
   - Pais objetivo
   - 5 prompts de prueba personalizados

### 3. Ejecutar Prompts

- **Manual**: Click en "Ejecutar" en la tarjeta del proyecto
- **Automatico**: Cada lunes a las 8 AM (hora Chile)

### 4. Ver Resultados

- **Dashboard**: Graficos evolutivos y comparativas
- **Ejecuciones**: Historial detallado con respuestas

## Metricas Analizadas

| Metrica | Descripcion | Rango |
|---------|-------------|-------|
| Aparicion | Si la marca es mencionada | Si/No |
| Frecuencia | Cantidad de menciones | 0-N |
| Sentimiento | Tono hacia la marca | -1 a 1 |
| Prominencia | Nivel de destaque | 0-100% |
| Calidez | Positividad emocional | 0-100% |

## Seguridad

- API keys encriptadas con AES-256 antes de almacenarse
- Row Level Security (RLS) en Supabase
- Cron jobs protegidos con Bearer token
- Variables de entorno nunca expuestas al cliente

## Troubleshooting

### El cron no se ejecuta

1. Verificar que `CRON_SECRET` este configurado
2. Revisar logs en Vercel > Functions
3. El cron solo funciona en produccion (Vercel Pro o superior)

### Error de API keys

1. Verificar que las keys sean validas en los dashboards originales
2. Regenerar la `ENCRYPTION_KEY` si hay problemas de desencriptacion
3. Volver a guardar las API keys

### No hay datos en el dashboard

1. Ejecutar manualmente un proyecto primero
2. Verificar que las tablas en Supabase tengan datos
3. Revisar la consola del navegador por errores

## Contribucion

1. Fork el repositorio
2. Crear una rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m "feat: agregar nueva funcionalidad"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia

MIT License - ver archivo LICENSE para detalles.

## Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.
