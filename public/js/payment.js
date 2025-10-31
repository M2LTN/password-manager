document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("purchaseBtn");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Redirecting…";

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location = data.url; // Go to Stripe Checkout
      } else {
        throw new Error("Failed to create session");
      }
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = "Purchase";
      alert("Unable to start checkout. Please try again.");
    }
  });
});
