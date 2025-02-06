import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const sendActivationEmail = async (email: string, token: string) => {
  try {
    const activationLink = `${process.env.BASE_URL}/company/activate?token=${token}`;
    console.log("Activation link", activationLink);
    const msg = {
      to: email,
      from: process.env.SENDGRID_EMAIL as string,
      subject: "Activate Your Company Account",
      html: `
              <h2>Welcome to My SaaS Project</h2>
              <p>Click the link below to activate your account:</p>
              <a href="${activationLink}" style="background-color:blue;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
                Activate Account
              </a>
              <p>This link will expire in 1 hour.</p>
            `,
    };

    const response = await sgMail.send(msg);

    return response;
  } catch (err: any) {
    throw new Error();
  }
};

export default sendActivationEmail;
