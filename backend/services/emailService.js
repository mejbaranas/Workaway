const nodemailer = require("nodemailer");

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Fonction pour envoyer un email
async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "Workaway <noreply@workaway.com>",
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur envoi email:", error.message);
    return { success: false, error: error.message };
  }
}

// Template: Candidature acceptée
function templateCandidatureAcceptee(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Candidature Acceptée !</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${data.userName}</strong>,</p>
          <p>Bonne nouvelle ! Votre candidature pour l'annonce <strong>"${data.annonceTitle}"</strong> a été acceptée.</p>
          <p>L'hôte <strong>${data.hostName}</strong> a hâte de vous accueillir.</p>
          ${data.hostResponse ? `<p><em>Message de l'hôte : "${data.hostResponse}"</em></p>` : ""}
          <p>Vous pouvez maintenant contacter l'hôte pour organiser votre séjour.</p>
          <a href="http://localhost:3000/messages" class="button">Contacter l'hôte</a>
        </div>
        <div class="footer">
          <p>Workaway - Voyagez et partagez</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template: Candidature refusée
function templateCandidatureRefusee(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Candidature Non Retenue</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${data.userName}</strong>,</p>
          <p>Malheureusement, votre candidature pour l'annonce <strong>"${data.annonceTitle}"</strong> n'a pas été retenue.</p>
          ${data.hostResponse ? `<p><em>Message de l'hôte : "${data.hostResponse}"</em></p>` : ""}
          <p>Ne vous découragez pas ! De nombreuses autres opportunités vous attendent.</p>
          <a href="http://localhost:3000/annonces" class="button">Voir d'autres annonces</a>
        </div>
        <div class="footer">
          <p>Workaway - Voyagez et partagez</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template: Nouveau message
function templateNouveauMessage(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-box { background-color: #fff; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
        .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 Nouveau Message</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${data.receiverName}</strong>,</p>
          <p>Vous avez reçu un nouveau message de <strong>${data.senderName}</strong> :</p>
          <div class="message-box">
            <p>${data.messagePreview}</p>
          </div>
          <a href="http://localhost:3000/messages" class="button">Voir le message</a>
        </div>
        <div class="footer">
          <p>Workaway - Voyagez et partagez</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template: Nouvelle candidature reçue (pour l'hôte)
function templateNouvelleCandidature(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #9b59b6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #9b59b6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📩 Nouvelle Candidature</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${data.hostName}</strong>,</p>
          <p>Vous avez reçu une nouvelle candidature pour votre annonce <strong>"${data.annonceTitle}"</strong>.</p>
          <p><strong>${data.applicantName}</strong> souhaite rejoindre votre projet.</p>
          <a href="http://localhost:3000/candidatures" class="button">Voir la candidature</a>
        </div>
        <div class="footer">
          <p>Workaway - Voyagez et partagez</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Fonctions d'envoi specifiques
async function sendCandidatureAcceptee(email, data) {
  const subject = "🎉 Votre candidature a été acceptée !";
  const html = templateCandidatureAcceptee(data);
  return sendEmail(email, subject, html);
}

async function sendCandidatureRefusee(email, data) {
  const subject = "Mise à jour de votre candidature";
  const html = templateCandidatureRefusee(data);
  return sendEmail(email, subject, html);
}

async function sendNouveauMessage(email, data) {
  const subject = `💬 Nouveau message de ${data.senderName}`;
  const html = templateNouveauMessage(data);
  return sendEmail(email, subject, html);
}

async function sendNouvelleCandidature(email, data) {
  const subject = "📩 Nouvelle candidature reçue";
  const html = templateNouvelleCandidature(data);
  return sendEmail(email, subject, html);
}

module.exports = {
  sendEmail,
  sendCandidatureAcceptee,
  sendCandidatureRefusee,
  sendNouveauMessage,
  sendNouvelleCandidature
};
