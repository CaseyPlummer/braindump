import { APP_ID } from "@angular/core";
import {
  BootstrapContext,
  bootstrapApplication,
} from "@angular/platform-browser";
import {
  provideServerRendering,
  renderApplication,
} from "@angular/platform-server";
import { OrdersComponent } from "./app/orders";
import { ORDERS_APP_ID } from "./app/app-id";

const DOCUMENT =
  "<!doctype html><html><head></head><body><app-orders></app-orders></body></html>";

/**
 * Server-renders OrdersComponent with the given inputs and returns an HTML fragment:
 * the component's <style> plus its rendered children, ready to be placed inside
 * <mfe-orders-ng21> as light DOM. No hydration, no transfer state.
 */
export async function renderOrdersFragment(inputs: {
  customer: string;
}): Promise<string> {
  const html = await renderApplication(
    async (context: BootstrapContext) => {
      const ref = await bootstrapApplication(
        OrdersComponent,
        {
          providers: [
            provideServerRendering(),
            { provide: APP_ID, useValue: ORDERS_APP_ID },
          ],
        },
        context,
      );
      ref.components[0].setInput("customer", inputs.customer);
      return ref;
    },
    { document: DOCUMENT, url: "/" },
  );
  return extractFragment(html, "app-orders", ORDERS_APP_ID);
}

/** Keeps this app's <style> tags and the inner HTML of the root element. */
function extractFragment(html: string, rootTag: string, appId: string): string {
  const styles = [...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)]
    .map((m) => m[0])
    .filter((s) => s.includes(`ng-app-id="${appId}"`));
  const body = new RegExp(`<${rootTag}\\b[^>]*>([\\s\\S]*)</${rootTag}>`).exec(
    html,
  );
  if (!body) throw new Error(`Root <${rootTag}> not found in rendered output`);
  return styles.join("") + body[1];
}

export default renderOrdersFragment;
