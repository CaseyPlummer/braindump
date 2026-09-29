import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-home-page",
  imports: [RouterLink],
  template: `
    <h2>Home</h2>
    <p>
      This page is rendered by the host alone. The Orders MFE owns its internal
      routes, but the host owns the address bar:
    </p>
    <ul>
      <li><a routerLink="/orders">/orders</a> — list</li>
      <li><a routerLink="/orders/1002">/orders/1002</a> — deep link to a detail route</li>
      <li><a routerLink="/orders/all">/orders/all</a> — redirects inside the MFE (URL replaced)</li>
    </ul>
  `,
})
export class HomePage {}
