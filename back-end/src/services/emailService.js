const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(to, subject, text, html = null) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Template HTML moderne
  const htmlTemplate = html || `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Container principal -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 35, 50, 0.1);">
              
              <!-- Header avec dégradé -->
              <tr>
                <td style="background: linear-gradient(135deg, #1A2332 0%, #2d3e50 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                    ${subject}
                  </h1>
                  <div style="width: 60px; height: 4px; background-color: white; margin: 20px auto 0; border-radius: 2px; opacity: 0.8;"></div>
                </td>
              </tr>
              
              <!-- Contenu -->
              <tr>
                <td style="padding: 50px 40px;">
                  <div style="color: #1A2332; font-size: 16px; line-height: 1.8;">
                    ${text.split('\n').map(line => `<p style="margin: 0 0 16px 0;">${line}</p>`).join('')}
                  </div>
                </td>
              </tr>
              
              <!-- Séparateur décoratif -->
              <tr>
                <td style="padding: 0 40px;">
                  <div style="border-top: 2px solid #f0f0f0;"></div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; text-align: center; background-color: #fafafa;">
                  <p style="margin: 0 0 10px 0; color: #1A2332; font-size: 14px; font-weight: 500;">
                    Merci de votre attention
                  </p>
                  <p style="margin: 0; color: #888; font-size: 12px;">
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </td>
              </tr>
              
              <!-- Barre de pied -->
              <tr>
                <td style="background-color: #1A2332; padding: 20px; text-align: center;">
                  <p style="margin: 0; color: white; font-size: 12px; opacity: 0.8;">
                    © ${new Date().getFullYear()} - Tous droits réservés
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  let info = await transporter.sendMail({
    from: `"Votre Application" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text, // Version texte simple pour les clients qui ne supportent pas HTML
    html: htmlTemplate
  });

  console.log("Email envoyé:", info.response);
  return info;
}

// Test direct avec un message plus élaboré


module.exports = { sendEmail };