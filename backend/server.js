// Golden Blue Quartz — order/contact form backend
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

app.post("/api/contact", async (req, res) => {
  const { name, phone, quantity, email, message } = req.body || {};

  if (!name || !phone || !quantity) {
    return res
      .status(400)
      .json({ error: "name, phone, and quantity are required." });
  }

  try {
    await transporter.sendMail({
      from: `"Golden Blue Quartz site" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO || process.env.SMTP_USER,
      replyTo: email || process.env.SMTP_USER,
      subject: `New order request from ${name} (${quantity} bottles)`,
      text: `Name: ${name}\nPhone: ${phone}\nQuantity: ${quantity}\nEmail: ${email || "(not provided)"}\n\nMessage:\n${message || "(none)"}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
             <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
             <p><strong>Quantity:</strong> ${escapeHtml(quantity)} bottles</p>
             <p><strong>Email:</strong> ${escapeHtml(email || "(not provided)")}</p>
             <p><strong>Message:</strong></p>
             <p>${escapeHtml(message || "(none)").replace(/\n/g, "<br>")}</p>`,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to send order email:", err);
    res.status(500).json({ error: "Could not send message right now." });
  }
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.listen(PORT, () =>
  console.log(`Golden Blue Quartz backend on http://localhost:${PORT}`),
);
