import { Subscription } from "../types/api";

export function validateSubscription(
  validSubscriptions: Subscription[] | "ALL",
  userSubscription: Subscription
) {
  if (validSubscriptions == "ALL") {
    if (userSubscription == "FREE") {
      return false;
    } else {
      return true;
    }
  } else {
    if (validSubscriptions.includes(userSubscription)) {
      return true;
    } else {
      return false;
    }
  }
}
