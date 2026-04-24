export async function triggerDeposit(toWallet: string, amount: number) {
  return { ok: true, txId: `DEP-${Date.now()}`, toWallet, amount };
}

export async function triggerWithdrawal(toWallet: string, amount: number) {
  return { ok: true, txId: `WDR-${Date.now()}`, toWallet, amount };
}
