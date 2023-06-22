import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface AlertOptions {
  type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  dismissible: boolean;
  message: string;
}

@Component({
  selector: 'app-alert',
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate(500)),
    ])
  ],
  template: `
    <div *ngIf="isVisible" @fade class="alert alert-{{options.type}}" role="alert" aria-live="assertive" [class.alert-dismissible]="options.dismissible">
      {{options.message}}
      <button *ngIf="options.dismissible" type="button" class="btn-close" (click)="dismissAlert()" aria-label="Close"></button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent implements OnChanges {
  @Input() options: AlertOptions;

  isVisible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      this.validateOptions();
    }
  }

  /**
   * Validates the options input and provides default values if necessary.
   * TODO: Consider logging errors to the server when options are invalid.
   */
  private validateOptions(): void {
    if (!this.options) {
      this.isVisible = false;
      return;
    }

    const validTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    if (!validTypes.includes(this.options.type)) {
      this.options.type = 'primary'; // default type
    }

    if (typeof this.options.dismissible !== 'boolean') {
      this.options.dismissible = false; // default dismissible
    }

    if (!this.options.message) {
      this.options.message = 'Default message'; // default message
    }

    this.isVisible = true;
  }

  dismissAlert(): void {
    this.isVisible = false;
  }
}
