import { Routes } from "@angular/router";
import { HomePage } from "./pages/home.page";
import { OrdersPage, ordersMatcher } from "./pages/orders.page";

export const routes: Routes = [
  { path: "", component: HomePage, title: "Home · MFE host" },
  { matcher: ordersMatcher, component: OrdersPage, title: "Orders · MFE host" },
  { path: "**", redirectTo: "" },
];
