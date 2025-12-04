# Sistema de Reserva de Restaurantes

Este es un sistema web para la gestión de reservas de restaurantes, construido con Node.js, Express, MySQL y Pug.

## Requisitos Previos

- Node.js instalado
- MySQL instalado y corriendo

## Instalación

1.  Clonar el repositorio
2.  Instalar las dependencias:
    ```bash
    npm install
    ```
3.  Configurar las variables de entorno:
    - Copia el archivo `.env.example` a `.env`
    - Configura tus credenciales de base de datos y otras variables necesarias.

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Para compilar los estilos CSS (Tailwind):

```bash
npm run css
```

## 📱 Cómo probar en tu teléfono móvil

Para acceder a la aplicación desde tu teléfono móvil, sigue estos pasos:

1.  **Conexión a la misma red**: Asegúrate de que tanto tu computadora (donde corre el servidor) como tu teléfono estén conectados a la misma red WiFi.

2.  **Iniciar el servidor**: Ejecuta el comando `npm run dev` en tu terminal.

3.  **Identificar la IP**: Al iniciar, el servidor mostrará en la consola un mensaje similar a este:
    ```text
    Para probar en tu teléfono, usa una de estas direcciones:
    http://192.168.1.XX:3000
    ```

4.  **Acceder desde el navegador**: Abre el navegador web en tu teléfono (Chrome, Safari, etc.) y escribe la dirección IP que apareció en la consola (ejemplo: `http://192.168.1.15:3000`).

### Solución de problemas comunes

-   **Firewall**: Si no puedes conectar, es posible que el Firewall de Windows esté bloqueando la conexión. Intenta desactivarlo temporalmente o crear una regla para permitir el puerto 3000.
-   **Red Pública vs Privada**: Asegúrate de que tu red WiFi esté configurada como "Privada" en Windows, ya que las redes "Públicas" suelen ser más restrictivas.
