/**
 * A unique APP_ID per MFE, used by both its server and browser builds. It prefixes
 * the emulated-encapsulation attributes (`_ngcontent-mfe-orders-c…`) and tags the
 * MFE's <style> elements (`ng-app-id="mfe-orders"`), so neither collides with the
 * host's (default `ng`) or another MFE's.
 */
export const ORDERS_APP_ID = "mfe-orders";
