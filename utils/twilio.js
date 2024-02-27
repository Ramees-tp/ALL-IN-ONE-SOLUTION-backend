require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_ID;
const client = require('twilio')(accountSid, authToken);

module.exports = async function twilioOtp(phoneNumber) {
  try {
    const verification = await client.verify
        .services(TWILIO_SERVICE_ID)
        .verifications.create({to: `+91${phoneNumber}`, channel: 'sms'});

    console.log(verification.status);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};
