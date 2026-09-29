import { Component, EventEmitter, Input, Output, VERSION } from '@angular/core';

/** Same contract as projects/mfe-orders (inputs down, events up), built on Angular 21. */
@Component({
  selector: 'app-orders',
  template: `
    <section class="mfe">
      <h3>
        Orders — {{ customer }} <small>(Angular {{ version }})</small>
      </h3>
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
      border: 1px dashed #888;
      border-radius: 8px;
    }
    h3 {
      margin: 0 0 8px;
    }
    small {
      font-weight: normal;
      color: #666;
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
  readonly orders = ['#2001', '#2002', '#2003'];
  readonly version = VERSION.full;

  select(id: string): void {
    this.orderSelected.emit(id);
  }
}
