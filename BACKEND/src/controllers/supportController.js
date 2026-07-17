const { sendSupportTicketEmail } = require('../services/emailService');

const submitTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const emailResult = await sendSupportTicketEmail(email, name, subject, message);

    if (emailResult.success) {
      return res.status(200).json({ message: 'Support ticket submitted successfully.', success: true });
    } else {
      console.error('Email sending failed in submitTicket:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send support ticket.', error: emailResult.error });
    }
  } catch (error) {
    console.error('Error in submitTicket:', error);
    res.status(500).json({ message: 'Server error while submitting ticket.' });
  }
};

module.exports = {
  submitTicket
};
