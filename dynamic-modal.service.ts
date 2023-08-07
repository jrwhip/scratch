import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, EventEmitter, Injectable, Injector, Type } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

import { Subject, take } from 'rxjs';

import { MODAL_DATA } from './modal-data.token';

export interface ModalContentComponent {
  modalEvent: EventEmitter<string>;
}

export interface ModalOptions {
  disableClickOutsideToClose?: boolean;
  disableCloseIfLoading?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DynamicModalService {
  private overlayRef: OverlayRef | null = null;

  onModalClose$ = new Subject<void>();

  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T extends ModalContentComponent>(component: Type<T>, payload?: unknown, options?: ModalOptions): ComponentRef<T> {
    // Returns an OverlayRef (which is a PortalHost)
    this.overlayRef = this.createOverlay();

    // Instantiate remote control
    const componentPortal = new ComponentPortal(component, null, this.createInjector(payload));

    const componentRef: ComponentRef<T> = this.overlayRef.attach(componentPortal);

    if (!options?.disableClickOutsideToClose) {
      this.overlayRef
        .backdropClick()
        .pipe(take(1))
        .subscribe(() => this.close());
    }

    componentRef.instance.modalEvent
      .pipe(take(1))
      .subscribe((event: string) => {
        console.log('DynamicModalService.modalEvent', event);
        if (event === 'close' && !(options?.disableCloseIfLoading)) {
          this.close();
        }
      });

    return componentRef;
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.onModalClose$.next();
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
      panelClass: ['dynamic-modal', 'modal'],
      backdropClass: ['dynamic-modal-backdrop', 'modal-backdrop'],
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    return this.overlay.create(overlayConfig);
  }
}
