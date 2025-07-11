const API_BASE = import.meta.env.VITE_API_URL || "";

export async function payForParse(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/stripe/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("Payment error:", error);
    throw error;
  }
}

export async function verifyPayment(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/stripe/verify?id=${sessionId}`);
    
    if (!response.ok) {
      throw new Error("Failed to verify payment");
    }

    const { paid } = await response.json();
    return paid;
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
}