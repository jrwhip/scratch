import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, EventEmitter, Injectable, Injector, Type } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

import { take } from 'rxjs';

import { MODAL_DATA } from './modal-data.token';

export interface ModalContentComponent {
  modalEvent: EventEmitter<string>;
}

@Injectable({
  providedIn: 'root',
})
export class DynamicModalService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T>(component: Type<T>, payload?: unknown): ComponentRef<T> {
    console.log('DynamicModalService.open', payload);
    // Returns an OverlayRef (which is a PortalHost)
    this.overlayRef = this.createOverlay();

    // Instantiate remote control
    const componentPortal = new ComponentPortal(component, null, this.createInjector(payload));

    // TODO: Change so that type is not any
    const componentRef: ComponentRef<any> = this.overlayRef.attach(componentPortal);

    this.overlayRef
      .backdropClick()
      .pipe(take(1))
      .subscribe(() => this.close());

    if ('modalEvent' in componentRef.instance) {
      (componentRef.instance as ModalContentComponent).modalEvent
        .pipe(take(1))
        .subscribe((event: string) => {
          console.log('DynamicModalService.modalEvent', event);
          if (event === 'close') {
            this.close();
          }
        });
    }

    return componentRef;
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  closed(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }

  private createInjector(payload: unknown): Injector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(MODAL_DATA, payload);

    return Injector.create({
      parent: this.injector,
      providers: [{ provide: MODAL_DATA, useValue: payload }],
    });
  }

  private createOverlay(): OverlayRef {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      panelClass: ['dynamic-modal'],
      backdropClass: ['dynamic-modal-backdrop'],
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    return this.overlay.create(overlayConfig);
  }
}
