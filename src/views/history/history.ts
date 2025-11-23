import "./history.css";
import { loadPurchaseHistory } from "../../data/purchaseHistory";
import { displayHistory } from "../../ui/renderer";

export function initView() {
  const entries = loadPurchaseHistory();
  displayHistory(entries);
}
