import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

interface ProgressBarOptions {
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  striped: boolean;
  animated: boolean;
  value: number;
}

@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="progress">
      <div
        class="progress-bar"
        role="progressbar"
        [class]="getClasses()"
        [style.width.%]="options.value"
        aria-valuenow="options.value"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  @Input() options: ProgressBarOptions = {
    color: 'primary',
    striped: false,
    animated: false,
    value: 0,
  };

  getClasses(): string {
    let classes = `bg-${this.options.color}`;
    if (this.options.striped) {
      classes += ' progress-bar-striped';
    }
    if (this.options.animated) {
      classes += ' progress-bar-animated';
    }
    return classes;
  }
}
```

In this component, we have an `options` input that allows you to specify the color, whether the progress bar is striped or animated, and the current value of the progress bar. The `getClasses` method is used to dynamically generate the class string for the progress bar based on the options.

Please note that this is a basic example and might not cover all the features of the Bootstrap 5 progress bar. You might need to extend it based on your specific needs.