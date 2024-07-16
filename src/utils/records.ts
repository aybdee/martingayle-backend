export type BET = "heads" | "tails" | "middle";

export let bet_records: BET[] = [];
export let drawDownProcessing = false;

export function drawDownOccured(numConsecutive: number) {
  if (bet_records.length < numConsecutive) {
    return false;
  } else {
    let last_n_bets = bet_records.slice(-numConsecutive);
    let num_heads = last_n_bets.filter((bet) => bet == "heads").length;
    if (num_heads == 0) {
      return true;
    } else {
      return false;
    }
  }
}

export function pureDrawDownOccured(numConsecutive: number) {
  if (bet_records.length < numConsecutive) {
    return false;
  } else {
    let last_n_bets = bet_records.slice(-numConsecutive);
    let num_tails = last_n_bets.filter((bet) => bet == "tails").length;
    if (num_tails == numConsecutive) {
      return true;
    } else {
      return false;
    }
  }
}

export function recordBet(bet: BET) {
  bet_records.push(bet);
}

export function setDrawDownProcessing() {
  drawDownProcessing = true;
}

export function resetDrawDownProcessing() {
  drawDownProcessing = false;
}
