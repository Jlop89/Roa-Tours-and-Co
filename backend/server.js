require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const crypto = require("crypto");
const path = require("path");

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || "Jennifergriselllopez@gmail.com";

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados solicitudes. Inténtalo de nuevo en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "Demasiados envíos de formulario. Inténtalo de nuevo en una hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

const csrfTokens = new Map();

app.get("/api/csrf-token", (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  csrfTokens.set(token, Date.now());
  setTimeout(() => csrfTokens.delete(token), 3600000);
  res.json({ csrfToken: token });
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/api/contact", limiter, contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message, honeypot, csrfToken } = req.body;

    if (honeypot) {
      return res.status(200).json({ success: true, message: "Gracias por contactarnos." });
    }

    if (!csrfToken || !csrfTokens.has(csrfToken)) {
      return res.status(403).json({ error: "Token de seguridad inválido." });
    }
    csrfTokens.delete(csrfToken);

    const errors = [];
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("El nombre completo es obligatorio.");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("El correo electrónico es obligatorio y debe tener un formato válido.");
    }
    if (!subject || typeof subject !== "string" || subject.trim().length < 2) {
      errors.push("El asunto es obligatorio.");
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      errors.push("El mensaje debe tener al menos 10 caracteres.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Validación fallida.", details: errors });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = (phone || "").trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();


    const mailOptions = {
      from: `"${cleanName}" <${cleanEmail}>`,
      to: RECIPIENT_EMAIL,
      subject: `Nuevo contacto desde la página web – ${cleanName}`,
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF8F0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #0D2137; font-family: 'Playfair Display', serif; margin: 0;">NUEVO CONTACTO DESDE LA PÁGINA WEB</h2>
            <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #C9A96E, #00BCD4); margin: 12px auto 0; border-radius: 2px;"></div>
          </div>
          <div style="background: #FFFFFF; padding: 24px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
            <p style="margin: 0 0 16px; font-size: 0.9rem; color: #2C3E50;"><strong style="color: #00BCD4;">Nombre:</strong> ${cleanName}</p>
            <p style="margin: 0 0 16px; font-size: 0.9rem; color: #2C3E50;"><strong style="color: #00BCD4;">Correo:</strong> ${cleanEmail}</p>
            <p style="margin: 0 0 16px; font-size: 0.9rem; color: #2C3E50;"><strong style="color: #00BCD4;">Teléfono:</strong> ${cleanPhone || "No proporcionado"}</p>
            <p style="margin: 0 0 16px; font-size: 0.9rem; color: #2C3E50;"><strong style="color: #00BCD4;">Asunto:</strong> ${cleanSubject}</p>
            <p style="margin: 0 0 16px; font-size: 0.9rem; color: #2C3E50;"><strong style="color: #00BCD4;">Mensaje:</strong></p>
            <div style="background: #FFF8F0; padding: 16px; border-radius: 8px; border-left: 4px solid #C9A96E; margin-top: 8px;">
              <p style="margin: 0; font-size: 0.9rem; color: #2C3E50; line-height: 1.7;">${cleanMessage}</p>
            </div>
          </div>
          <p style="text-align: center; margin-top: 20px; font-size: 0.8rem; color: #5D6D7E;">Este correo fue enviado automáticamente desde el formulario de contacto de Roa Tours & Co.</p>
        </div>
      `,
      text: `NUEVO CONTACTO DESDE LA PÁGINA WEB\n\nNombre: ${cleanName}\nCorreo: ${cleanEmail}\nTeléfono: ${cleanPhone}\nAsunto: ${cleanSubject}\nMensaje: ${cleanMessage}`
    };
    const { error } = await resend.emails.send({
      from: 'Roa Tours & Co <contacto@roatoursco.com>',
      to: [RECIPIENT_EMAIL],
      replyTo: cleanEmail,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    });

    if (error) {
      throw new Error(error.message);
    }
    res.json({ success: true, message: "Gracias por contactarnos. Hemos recibido tu información y pronto nos pondremos en contacto contigo." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "No pudimos enviar tu información. Por favor, inténtalo nuevamente." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Roa Tours & Co. corriendo en puerto ${PORT}`);
});
