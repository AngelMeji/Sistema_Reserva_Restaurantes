import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  // Construir la URL base de forma segura
  const backendUrl = process.env.BACKEND_URL.endsWith('/') ? process.env.BACKEND_URL.slice(0, -1) : process.env.BACKEND_URL;
  const port = process.env.PORT ?? 3000;
  const urlBase = backendUrl.includes(`:${port}`) || (!backendUrl.includes('localhost') && backendUrl.includes('http'))
    ? backendUrl
    : `${backendUrl}:${port}`;

  const currentYear = new Date().getFullYear();

  // Enviar el correo
  await transport.sendMail({
    from: '"Sistema de Reservas" <noreply@ristorantetradizionale.com>',
    to: email,
    subject: "Confirma tu Cuenta - Sistema de Reservas",
    text: `Confirma tu cuenta. Hola ${nombre}, confirma tu cuenta en el siguiente enlace: ${urlBase}/auth/confirmar/${token}`,
    html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sistema de Reservas - Restaurante</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F2EADF; font-family: 'Lato', Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border: 4px solid #C7A86C; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 40px; text-align: center; background: linear-gradient(to bottom, #8B2030 0%, #6E1825 50%, #4A0F18 100%);">
                  <h1 style="color: #F2EADF; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; font-style: italic;">Sistema de Reservas</h1>
                  <p style="color: #C7A86C; font-size: 14px; margin-top: 5px; letter-spacing: 2px;">RESTAURANTE</p>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #6E1825; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin-bottom: 20px; text-align: center;">Confirmar Cuenta</h2>
                  
                  <p style="color: #3C4430; font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
                    Hola <strong>${nombre}</strong>,
                  </p>
                  
                  <p style="color: #3C4430; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Gracias por registrarte. Tu cuenta ya está casi lista, solo debes confirmarla haciendo clic en el siguiente botón:
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${urlBase}/auth/confirmar/${token}" 
                       style="display: inline-block; padding: 15px 40px; background: linear-gradient(to bottom, #8B2030 0%, #6E1825 50%, #4A0F18 100%); color: #F2EADF; text-decoration: none; font-weight: bold; border-radius: 40px; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                      Confirmar Cuenta
                    </a>
                  </div>
                  
                  <p style="color: #7D8C5A; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #C7A86C;">
                    Si no creaste esta cuenta, puedes ignorar este mensaje.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #3C4430; border-top: 2px solid #C7A86C;">
                  <p style="color: #C7A86C; font-size: 12px; margin: 0;">&copy; ${currentYear} Sistema de Reservas - Todos los derechos reservados</p>
                  <p style="color: #7D8C5A; font-size: 11px; margin-top: 10px;">Este es un correo automático, por favor no responda a este mensaje.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
  });
};

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  // Construir la URL base de forma segura
  const backendUrl = process.env.BACKEND_URL.endsWith('/') ? process.env.BACKEND_URL.slice(0, -1) : process.env.BACKEND_URL;
  const port = process.env.PORT ?? 3000;
  const urlBase = backendUrl.includes(`:${port}`) || (!backendUrl.includes('localhost') && backendUrl.includes('http'))
    ? backendUrl
    : `${backendUrl}:${port}`;

  const currentYear = new Date().getFullYear();

  // Enviar el correo
  await transport.sendMail({
    from: '"Sistema de Reservas" <noreply@ristorantetradizionale.com>',
    to: email,
    subject: "Restablece tu Contraseña - Sistema de Reservas",
    text: `Restablece tu contraseña. Hola ${nombre}, has solicitado restablecer tu contraseña. Sigue este enlace: ${urlBase}/auth/olvide-password/${token}`,
    html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sistema de Reservas - Restaurante</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F2EADF; font-family: 'Lato', Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border: 4px solid #C7A86C; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 40px; text-align: center; background: linear-gradient(to bottom, #8B2030 0%, #6E1825 50%, #4A0F18 100%);">
                  <h1 style="color: #F2EADF; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin: 0; font-style: italic;">Sistema de Reservas</h1>
                  <p style="color: #C7A86C; font-size: 14px; margin-top: 5px; letter-spacing: 2px;">RESTAURANTE</p>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #6E1825; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin-bottom: 20px; text-align: center;">Recuperar Contraseña</h2>
                  
                  <p style="color: #3C4430; font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
                    Hola <strong>${nombre}</strong>,
                  </p>
                  
                  <p style="color: #3C4430; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para crear una nueva contraseña:
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${urlBase}/auth/olvide-password/${token}" 
                       style="display: inline-block; padding: 15px 40px; background: linear-gradient(to bottom, #8B2030 0%, #6E1825 50%, #4A0F18 100%); color: #F2EADF; text-decoration: none; font-weight: bold; border-radius: 40px; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                      Restablecer Contraseña
                    </a>
                  </div>
                  
                  <div style="background-color: #FEF3C7; border-left: 4px solid #C7A86C; padding: 15px; margin: 20px 0;">
                    <p style="color: #92400E; font-size: 14px; margin: 0;">
                      <strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
                    </p>
                  </div>
                  
                  <p style="color: #7D8C5A; font-size: 14px; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #C7A86C;">
                    Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá siendo válida.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; text-align: center; background-color: #3C4430; border-top: 2px solid #C7A86C;">
                  <p style="color: #C7A86C; font-size: 12px; margin: 0;">&copy; ${currentYear} Sistema de Reservas - Todos los derechos reservados</p>
                  <p style="color: #7D8C5A; font-size: 11px; margin-top: 10px;">Este es un correo automático, por favor no responda a este mensaje.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
  });
};

export { emailRegistro, emailOlvidePassword };
