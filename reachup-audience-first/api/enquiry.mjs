import nodemailer from 'nodemailer';
import { createEnquiryHandler } from '../server/enquiry.mjs';

export default { fetch: createEnquiryHandler({ createTransport: nodemailer.createTransport }) };
