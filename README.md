# REVLON

BASE_URL = `http://localhost:8080`

<br/>

### AUTH: `/auth`

>### Signup

#### Endpoint: `/signup`
#### Mehod: **POST**

#### Body:
```
- firstName: String
- lastName: String
- email: String
- birthdate: String
- zipCode: String
- via: String
- password: String
```
- Requirements:
  - firstName: Between 3 and 50 chars
  - lastName: Between 3 and 50 chars
  - email: Unique => Can't exist more than 1 user with the same email
  - birthdate: Must be 18yo or older
  - via: Must be a valid via. List of valid VIAs:
    - INSTAGRAM
  - password: Must be at least 8 chars

#### Response:
- Success: Created user, including the verification token (temporary)
- Error: description in `body.message`

>### Verify Account

#### Endpoint: `/verify-account`
#### Method: **POST**

#### Query params:
```
- email: String
- t: String
```

#### Response:
- Success: StatusCode=**`200`**
- Error: description in `body.message`

>### Login

#### Endpoint: `/login`
#### Method: **POST**

#### Body:
```
- email: String
- password: String
```

#### Response:
- Success: Body:
```
token: String
```
- Error: description in `body.message`

<br/>

### TICKETS: `/tickets`

#### All requests must be authenticated with the `req.headers.authorization: Bearer {token}`

>### Get User Tickets

#### Endpoint: `/`
#### Method: **GET**

#### Response:
- Success: Body:

Array of: 
```
{
  _id: String
  number: String
  date: String
  image: String
  store: String
  type: String
  guesses: [
    {
      _id: String
      contest: String
      guess: number
    }
  ]
}
```
- Error: description in `body.message`

>### Upload Ticket

Este flujo tiene un detalle importante. Para poder hacer una adivinanza en algún concurso, es obligatorio subir la imagen del ticket para la posterior validación del mismo. Las fotos de los tickets se van a subir a Cloudinary directamente desde el frontend. Abajo se detalla el flujo para permitir al frontend subir imágenes a Cloudinary y luego usar la información recibida para poder efectivamente crear el Ticket en nuestra DB.

1. Se le pide al backend una `signature`
  - GET a `/tickets/image_signature`
  - Response: `{ timestamp: String, signature: String}`
2. Con la información recibida, se sube la imagen a Cloudinary
  - El body es un `FormData` que debe tener los siguientes atributos:
    - **file: File** => El archivo que se quiere subir. Solo se permite subir archivos JPG, JPEG, PNG. Si se intenta subir otro tipo de archivo, Cloudinary devuelve error (manejarlo en el catch)
    - **api_key: String** => Está en el .env
    - **timestamp: Number** => La recibida en el paso anterior
    - **signature: String** => La recibida en el paso anterior
    - **folder: String** => Esta SIEMPRE debe ser `Revlon/Tickets`. Te diría que la guardes en constants, .env, lo que sea, porque cualquier otro valor lanza error
  - POST a `https://api.cloudinary.com/v1_1/{{CLOUDINARY_CLOUD_NAME}}/auto/upload`
3. La respuesta es un gran JSON. El único atributo que nos interesa es `public_id`

#### Endpoint: `/`
#### Method: **POST**

#### Body:
```
- barCode: String
- number: String
- store: String
- type: String
- date: String
- image: String
- guesses: [
  {
    contest: String,
    guess: number
  }
]
```
- Requirements:
  - number: At least 10 chars (temporary, will change)
  - store: Must be valid `Store` enum
  - type: `ONLINE` or `PHYSICAL`
  - date: Only if type `ONLINE` is selected
  - image: `public_id` returned from the previous call
  - guesses: Must have exactly 2 elements. Contest is `contestId`

#### Response:
- Success: Body:

Array of: 
```
{
  _id: String
  number: String
  date: String
  image: String
  store: String
  type: String
  guesses: [
    {
      _id: String
      contest: String
      guess: number
    }
  ]
}
```
- Error: description in `body.message`