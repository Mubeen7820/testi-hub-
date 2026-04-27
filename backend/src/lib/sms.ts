import axios from 'axios';

/**
 * Send OTP via SMS
 * This is a template. You can integrate Twilio, Fast2SMS, Vonage, etc.
 */
export const sendSMS = async (phone: string, message: string) => {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      console.log(`[MOCK SMS] To: ${phone}, Msg: ${message}`);
      return false;
    }

    // Extract the 6-digit code from the message
    const otpCode = message.match(/\d{6}/)?.[0] || "";

    // Fast2SMS usually wants just the 10-digit number for India
    const cleanPhone = phone.replace('+', '').replace(/^91/, '').trim();

    console.log(`[SMS ATTEMPT] Sending to ${cleanPhone}...`);
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY
      },
      params: {
        variables_values: otpCode,
        route: 'otp',
        numbers: cleanPhone
      }
    });

    console.log('[SMS RESPONSE]', response.data);

    if (response.data.return === true) {
      console.log(`[SMS SUCCESS] To: ${phone}`);
      return true;
    } else {
      console.error('Fast2SMS API Error:', response.data.message || response.data);
      return false;
    }
  } catch (error: any) {
    console.error('SMS Request failed:', error.response?.data || error.message);
    return false;
  }
};
