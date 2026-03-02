const nodemailer = require('nodemailer');

const NOTIFY_EMAIL = 'descubrepy.com.py@gmail.com';

function getTransporter() {
  const user = (process.env.EMAIL_USER || '').trim();
  // La contraseña de aplicación de Gmail puede venir con espacios (ej. "abcd efgh ijkl mnop"); se quitan
  const pass = (process.env.EMAIL_APP_PASSWORD || '').replace(/\s/g, '').trim();
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

/**
 * Envía un correo a descubrepy.com.py@gmail.com con los datos del negocio recién registrado.
 * Si no hay EMAIL_USER/EMAIL_APP_PASSWORD en .env, no envía (no falla).
 */
async function sendNewBusinessNotification(businessData) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[mail] EMAIL_USER o EMAIL_APP_PASSWORD no configurados; no se envía notificación por correo.');
    return;
  }
  const {
    name = '',
    slug = '',
    city = '',
    category_slug = '',
    location = '',
    phone = '',
    instagram_url = '',
    description = '',
  } = businessData;
  const text = [
    `Nuevo negocio registrado en DescubrePY`,
    '',
    `Nombre: ${name}`,
    `Slug: ${slug}`,
    `Ciudad: ${city}`,
    `Categoría: ${category_slug || '—'}`,
    `Dirección: ${location || '—'}`,
    `Teléfono: ${phone || '—'}`,
    `Instagram: ${instagram_url || '—'}`,
    '',
    description ? `Descripción: ${description.slice(0, 300)}${description.length > 300 ? '...' : ''}` : '',
  ].filter(Boolean).join('\n');
  const html = `
    <h2>Nuevo negocio registrado en DescubrePY</h2>
    <table style="border-collapse: collapse;">
      <tr><td style="padding:4px 8px;"><strong>Nombre</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Slug</strong></td><td>${escapeHtml(slug)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Ciudad</strong></td><td>${escapeHtml(city)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Categoría</strong></td><td>${escapeHtml(category_slug || '—')}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Dirección</strong></td><td>${escapeHtml(location || '—')}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Teléfono</strong></td><td>${escapeHtml(phone || '—')}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Instagram</strong></td><td>${escapeHtml(instagram_url || '—')}</td></tr>
    </table>
    ${description ? `<p><strong>Descripción:</strong><br/>${escapeHtml(description.slice(0, 500))}${description.length > 500 ? '...' : ''}</p>` : ''}
  `;
  try {
    await transporter.sendMail({
      from: (process.env.EMAIL_USER || '').trim(),
      to: NOTIFY_EMAIL,
      subject: `[DescubrePY] Nuevo negocio: ${name}`,
      text,
      html,
    });
    console.log('[mail] Notificación enviada a', NOTIFY_EMAIL);
  } catch (err) {
    console.error('[mail] Error al enviar notificación:', err.message);
    if (err.response) console.error('[mail] Respuesta SMTP:', err.response);
    if (err.code) console.error('[mail] Código:', err.code);
  }
}

/**
 * Envía a descubrepy.com.py@gmail.com los datos del formulario de contacto (Solicitá tu publicación).
 * Lanza si no hay transporte o falla el envío.
 */
async function sendContactNotification(data) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email no configurado. Revisá EMAIL_USER y EMAIL_APP_PASSWORD en .env');
  }
  const {
    nombre = '',
    telefono = '',
    email = '',
    negocio = '',
    categoria = '',
    ciudad = '',
    mensaje = '',
  } = data;
  const text = [
    'Nueva solicitud de publicación - DescubrePY',
    '',
    `Nombre: ${nombre}`,
    `Teléfono / WhatsApp: ${telefono}`,
    `Email: ${email}`,
    `Negocio: ${negocio}`,
    `Categoría: ${categoria}`,
    `Ciudad: ${ciudad}`,
    mensaje ? `Mensaje: ${mensaje}` : '',
  ].filter(Boolean).join('\n');
  const html = `
    <h2>Nueva solicitud de publicación - DescubrePY</h2>
    <table style="border-collapse: collapse;">
      <tr><td style="padding:4px 8px;"><strong>Nombre</strong></td><td>${escapeHtml(nombre)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Teléfono / WhatsApp</strong></td><td>${escapeHtml(telefono)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Negocio</strong></td><td>${escapeHtml(negocio)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Categoría</strong></td><td>${escapeHtml(categoria)}</td></tr>
      <tr><td style="padding:4px 8px;"><strong>Ciudad</strong></td><td>${escapeHtml(ciudad)}</td></tr>
    </table>
    ${mensaje ? `<p><strong>Mensaje:</strong><br/>${escapeHtml(mensaje)}</p>` : ''}
  `;
  await transporter.sendMail({
    from: (process.env.EMAIL_USER || '').trim(),
    to: NOTIFY_EMAIL,
    subject: `[DescubrePY] Solicitud de publicación: ${negocio || nombre}`,
    text,
    html,
  });
  console.log('[mail] Solicitud de contacto enviada a', NOTIFY_EMAIL);
}

/**
 * Envía un correo de prueba al mismo destinatario. Útil para verificar configuración.
 * Devuelve { success: true } o lanza con el error.
 */
async function sendTestEmail() {
  const transporter = getTransporter();
  if (!transporter) {
    const user = !!process.env.EMAIL_USER;
    const pass = !!(process.env.EMAIL_APP_PASSWORD || '').replace(/\s/g, '').trim();
    throw new Error(`Email no configurado: EMAIL_USER=${user ? 'ok' : 'falta'}, EMAIL_APP_PASSWORD=${pass ? 'ok' : 'falta'}. Revisá el .env`);
  }
  await transporter.sendMail({
    from: (process.env.EMAIL_USER || '').trim(),
    to: NOTIFY_EMAIL,
    subject: '[DescubrePY] Prueba de correo',
    text: 'Si recibís este correo, la configuración de email está bien.',
    html: '<p>Si recibís este correo, la configuración de email está bien.</p>',
  });
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendNewBusinessNotification, sendContactNotification, sendTestEmail };
