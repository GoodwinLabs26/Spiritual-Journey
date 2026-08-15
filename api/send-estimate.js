const nodemailer = require('nodemailer');

function fmtMoney(n){
  n = Number(n) || 0;
  return '$' + n.toLocaleString('en-US', {maximumFractionDigits: 0});
}

function buildHtml({clientName, ticketNo, jobType, addr, value, materials, labor, hourly, hours}){
  const isHourly = jobType === 'Snow Removal' && Number(hourly) > 0;
  const total = isHourly ? fmtMoney(Number(hourly) * Number(hours || 0)) : fmtMoney(value);
  const priceRow = isHourly
    ? `<tr><td style="padding:10px 14px;font-size:11px;color:#6B6A63;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #D8D2C2;">Rate</td>
           <td style="padding:10px 14px;font-size:13px;text-align:right;border-bottom:1px solid #D8D2C2;">${fmtMoney(hourly)}/hr &times; ${Number(hours || 0)} est. hrs</td></tr>`
    : '';
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#EDE8DE;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8DE;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FBF8F1;border:1px solid #D8D2C2;">
          <tr>
            <td style="padding:28px 32px 16px;border-bottom:3px solid #2B2A28;">
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;color:#2B2A28;text-transform:uppercase;">Spiritual Journey</p>
              <p style="margin:4px 0 0;font-size:12px;letter-spacing:1px;color:#6B6A63;text-transform:uppercase;">Roofing &amp; construction</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;color:#2B2A28;font-size:14px;line-height:1.6;">
              <p style="margin:0 0 16px;">Hi ${clientName || 'there'},</p>
              <p style="margin:0 0 20px;">Thanks for the opportunity to look at your project. Here's your estimate:</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D8D2C2;margin-bottom:20px;">
                <tr><td style="padding:10px 14px;font-size:11px;color:#6B6A63;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #D8D2C2;">Ticket</td>
                    <td style="padding:10px 14px;font-size:13px;text-align:right;border-bottom:1px solid #D8D2C2;font-family:monospace;">${ticketNo || ''}</td></tr>
                <tr><td style="padding:10px 14px;font-size:11px;color:#6B6A63;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #D8D2C2;">Job type</td>
                    <td style="padding:10px 14px;font-size:13px;text-align:right;border-bottom:1px solid #D8D2C2;">${jobType || ''}</td></tr>
                <tr><td style="padding:10px 14px;font-size:11px;color:#6B6A63;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #D8D2C2;">Address</td>
                    <td style="padding:10px 14px;font-size:13px;text-align:right;border-bottom:1px solid #D8D2C2;">${addr || ''}</td></tr>
                ${priceRow}
                <tr><td style="padding:12px 14px;font-size:13px;font-weight:700;">Total estimate</td>
                    <td style="padding:12px 14px;font-size:16px;font-weight:700;text-align:right;font-family:monospace;">${total}</td></tr>
              </table>

              <p style="margin:0 0 8px;">If this looks good, just reply to this email and we'll get you on the schedule. Happy to answer any questions in the meantime.</p>
              <p style="margin:24px 0 0;">Thanks,<br/>Spiritual Journey</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = async (req, res) => {
  if(req.method !== 'POST'){
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  const {to, clientName, ticketNo, jobType, addr, value, materials, labor, hourly, hours} = req.body || {};

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim());
  if(!isValidEmail(to)){
    res.status(400).json({error: 'Missing or invalid recipient email'});
    return;
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if(!gmailUser || !gmailPass){
    res.status(500).json({error: 'Email is not configured on the server (missing GMAIL_USER / GMAIL_APP_PASSWORD)'});
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {user: gmailUser, pass: gmailPass}
  });

  try{
    await transporter.sendMail({
      from: `"Spiritual Journey" <${gmailUser}>`,
      to,
      subject: `Your estimate from Spiritual Journey${ticketNo ? ' — ' + ticketNo : ''}`,
      html: buildHtml({clientName, ticketNo, jobType, addr, value, materials, labor, hourly, hours})
    });
    res.status(200).json({success: true});
  }catch(err){
    console.error('send-estimate error:', err);
    res.status(500).json({error: err.message});
  }
};