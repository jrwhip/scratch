import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface Options {
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  mode: 'animated' | 'determinate' | 'indeterminate' | 'buffer' | 'query';
  value: number;
}

@Component({
  selector: 'webteam-shared-client-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="progress mt-2"
      role="progressbar"
      [ngStyle]="{ visibility: isLoading ? 'visible' : 'hidden' }"
    >
      <div
        class="progress-bar progress-bar-striped progress-bar-animated"
        style="width: 100%"
      ></div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateAwareLoadingIndicatorComponent {
  @Input() isLoading = false;

  @Input() options: Options = {
    color: 'primary',
    mode: 'animated',
    value: 50,
  }
}
