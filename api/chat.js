// Retired with the audience-first website. Original source: legacy-api/chat.js.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    error: 'This chatbot is no longer available. Please use the campaign enquiry form.',
    contact: '/contact'
  });
}
