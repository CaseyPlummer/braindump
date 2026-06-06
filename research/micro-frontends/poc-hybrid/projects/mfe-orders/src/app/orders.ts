import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Same component contract as the Flavor 1 POC — inputs down, events up. */
@Component({
  selector: 'app-orders',
  template: `
    <section class="mfe">
      <h3>Orders — {{ customer }}</h3>
      <ul>
        @for (id of orders; track id) {
          <li>
            <button (click)="select(id)">Select {{ id }}</button>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .mfe {
      padding: 12px;
      border: 1px solid #888;
      border-radius: 8px;
    }
    h3 {
      margin: 0 0 8px;
    }
    ul {
      margin: 0;
      padding-left: 18px;
    }
    button {
      cursor: pointer;
    }
  `,
})
export class OrdersComponent {
  @Input() customer = 'guest';
  @Output() orderSelected = new EventEmitter<string>();
  readonly orders = ['#1001', '#1002', '#1003'];

  select(id: string): void {
    this.orderSelected.emit(id);
  }
}
