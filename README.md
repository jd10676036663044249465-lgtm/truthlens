# TruthLens

Aplicacion web educativa para analizar la confiabilidad de noticias, URLs e imagenes mediante reglas logicas, puntuacion ponderada y almacenamiento en MongoDB.

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla
- Node.js
- Express.js
- MongoDB

## Estructura de carpetas

```txt
truthlens/
├── package.json
├── server.js
├── .env.example
├── README.md
├── uploads/
│   └── .gitkeep
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── analysisController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   └── Analysis.js
│   ├── routes/
│   │   ├── analysisRoutes.js
│   │   └── dashboardRoutes.js
│   └── services/
│       └── logicService.js
└── public/
    ├── index.html
    ├── history.html
    ├── dashboard.html
    ├── css/
    │   └── styles.css
    └── js/
        ├── api.js
        ├── main.js
        ├── history.js
        └── dashboard.js
```

## Instalacion

1. Abre la carpeta `truthlens` en Visual Studio Code.

2. Instala dependencias:

```bash
npm install
```

3. Crea el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Asegurate de tener MongoDB ejecutandose localmente o configura `MONGODB_URI` en `.env`.

5. Inicia el servidor:

```bash
npm run dev
```

6. Abre la aplicacion:

```txt
http://localhost:3000
```

## API REST

```txt
GET    /api/health
POST   /api/analyses
GET    /api/analyses
GET    /api/analyses/:id
DELETE /api/analyses/:id
GET    /api/dashboard/stats
```

## Logica usada

Variables:

```txt
A = Tiene fuente confiable
B = Esta verificada por otros medios
C = Tiene autor identificado
D = Utiliza lenguaje alarmista
E = Presenta senales sospechosas
```

Expresion:

```txt
(A AND B AND C) AND NOT(D OR E)
```

Puntuacion:

```txt
Base neutral = 35
Fuente confiable = +25
Verificacion externa = +25
Autor identificado = +15
Lenguaje alarmista = -20
Contenido sospechoso = -15
```

Clasificacion:

```txt
80-100 = Alta confiabilidad
50-79  = Informacion dudosa
0-49   = Posible Fake News
```
