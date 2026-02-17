import { addProcessor } from "@evershop/evershop/lib/util/registry";
import Mailgun from "mailgun.js";
import formData from "form-data";
import { getEnv } from "@evershop/evershop/lib/util/getEnv";
import { getConfig } from "@evershop/evershop/lib/util/getConfig";
import { error } from "@evershop/evershop/lib/log";
import type { SendEmailArguments } from "@evershop/evershop/lib/mail/emailHelper";

export default () => {
  addProcessor("emailService", (service) => {
    return {
      sendEmail: async (args: SendEmailArguments) => {
        const apiKey = getEnv("MAILGUN_API_KEY", "");
        const domain = getEnv("MAILGUN_DOMAIN", "");
        const region = getEnv("MAILGUN_REGION", "US"); // US หรือ EU

        if (!apiKey || !domain) {
          error("Missing Mailgun API key or domain");
          return;
        }

        if (!args.from) {
          error("No from email address configured");
          return;
        }

        const mailgun = new Mailgun(formData);
        const mg = mailgun.client({
          username: "api",
          key: apiKey,
          url: region === "EU"
            ? "https://api.eu.mailgun.net"
            : "https://api.mailgun.net"
        });

        try {
          return await mg.messages.create(domain, {
            from: args.from,
            to: args.to,
            subject: args.subject,
            html: args.body,
            ...(args.cc && { cc: args.cc })
          });
        } catch (err) {
          error("Mailgun send error");
        }
      }
    };
  }, 5);

  addProcessor("emailArguments", function processTemplateId(
    this: { id: string },
    args: SendEmailArguments
  ) {
    const mailId = this.id;
    const config = getConfig("system.notification_emails");
    const templateId =
      config?.[mailId as Exclude<keyof typeof config, "from">]?.templateId;

    if (templateId) {
      return {
        ...args,
        templateId
      };
    }
    return args;
  });
};
