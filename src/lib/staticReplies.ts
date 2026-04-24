const replies = [
  { k: /erc20|token|gas/i, v: "For ERC20 issues, verify network, token contract, and gas fee availability first." },
  { k: /withdraw|cashout/i, v: "Withdrawals require 40 completed tasks in the last 24-hour cycle and admin approval." },
  { k: /deposit|receipt|proof/i, v: "Deposit proofs are reviewed in admin transactions. Ensure screenshot is clear and complete." },
  { k: /password|login/i, v: "Use profile settings to update password securely; avoid sharing credentials with anyone." },
  { k: /invite|invitation/i, v: "Invitation keys are unique and can be generated once your account is active." },
  { k: /task|order/i, v: "Complete regular tasks first, then special tasks unlock based on your dashboard settings." },
  { k: /balance|money/i, v: "Balance updates after transaction status changes from pending to accepted." },
  { k: /wallet|address/i, v: "Check wallet address format and chain compatibility before sending funds." },
  { k: /admin|support/i, v: "Your message has been queued for support and the admin dashboard receives it instantly." },
  { k: /notification|status/i, v: "Status notifications appear in your profile notification panel after each review." }
];

export function bestStaticReply(message: string) {
  const found = replies.find((r) => r.k.test(message));
  return found?.v ?? "Your message is received. Support will contact you shortly.";
}
