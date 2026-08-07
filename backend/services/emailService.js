const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Neon Bite';

  if (!senderEmail || !process.env.BREVO_API_KEY) {
    console.warn('⚠️ Brevo email not configured. Skipping email send.');
    return false;
  }

  const brevoPayload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: toName || 'User' }],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(brevoPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Brevo API Error:', response.status, errorText);
      return false;
    }

    console.log(`✅ Email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email via Brevo:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail
};
