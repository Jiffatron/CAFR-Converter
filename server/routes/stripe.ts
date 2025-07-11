import { Router } from "express";
import Stripe from "stripe";

const router = Router();

// Create Stripe instance (optional for development)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

// POST /stripe/create-checkout - Create a Checkout Session
router.post("/create-checkout", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: process.env.CLIENT_SUCCESS_URL!,
      cancel_url: process.env.CLIENT_CANCEL_URL!,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to create checkout session" 
    });
  }
});

// GET /stripe/verify - Verify payment status
router.get("/verify", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }
  
  try {
    const sessionId = req.query.id as string;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({ 
      paid: session.payment_status === "paid" 
    });
  } catch (error) {
    console.error("Stripe verification error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to verify payment" 
    });
  }
});

export default router;