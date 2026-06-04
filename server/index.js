"use strict";

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const crypto = require("crypto");
const path = require("path");
const express = require("express");
const Razorpay = require("razorpay");

const ROOT = path.join(__dirname, "..");
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

let razorpay;
function client() {
  if (!KEY_ID || !KEY_SECRET) {
    const err = new Error("Razorpay credentials missing");
    err.statusCode = 500;
    throw err;
  }
  if (!razorpay) {
    razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  }
  return razorpay;
}

app.get("/api/config", (_req, res) => {
  if (!KEY_ID) {
    return res.status(500).json({ error: "Payment not configured" });
  }
  res.json({ key_id: KEY_ID });
});

app.post("/api/create-order", async (req, res) => {
  try {
    const amount = parseInt(req.body.amount, 10);
    if (!Number.isFinite(amount) || amount < 100) {
      return res.status(400).json({ error: "Amount must be at least 100 paise (₹1)" });
    }

    const order = await client().orders.create({
      amount,
      currency: "INR",
      receipt: "tip_" + Date.now(),
      notes: { purpose: "TIP" },
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("create-order:", err);
    if (err.statusCode === 401 || err.statusCode === 403) {
      return res.status(401).json({ error: "Payment authentication failed" });
    }
    res.status(500).json({ error: err.message || "Could not create order" });
  }
});

app.post("/api/verify-payment", (req, res) => {
  if (!KEY_SECRET) {
    return res.status(500).json({ error: "Payment not configured" });
  }

  const orderId = req.body.razorpay_order_id;
  const paymentId = req.body.razorpay_payment_id;
  const signature = req.body.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: "Missing payment fields" });
  }

  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (expected !== signature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  res.json({ success: true });
});

app.use(express.static(ROOT));

app.listen(PORT, () => {
  console.log("Portfolio tip server: http://localhost:" + PORT + "/tip.html");
});