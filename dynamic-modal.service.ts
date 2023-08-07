import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, EventEmitter, Injectable, Injector, Type } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

import { Subject, take } from 'rxjs';

import { MODAL_DATA } from './modal-data.token';

/**
 * Interface for components that can be used as content in the dynamic modal.
 * Components should implement this interface to ensure they have the necessary
 * modalEvent property.
 */
export interface ModalContentComponent {
  modalEvent: EventEmitter<string>;
}

/**
 * Interface for optional configuration options for the dynamic modal.
 */
export interface ModalOptions {
  disableClickOutsideToClose?: boolean;
  disableCloseIfLoading?: boolean;
}

/**
 * Service for creating dynamic modals.
 */
@Injectable({
  providedIn: 'root',
})
export class DynamicModalService {
  private overlayRef: OverlayRef | null = null;

  /**
   * Subject that emits when a modal is closed.
   */
  onModalClose$ = new Subject<void>();

  constructor(private overlay: Overlay, private injector: Injector) {}

  /**
   * Opens a dynamic modal with the given component as content.
   *
   * @example
   * // Component should implement ModalContentComponent
   * this.dynamicModalService.open(MyModalComponent);
   *
   * @param component - The component to use as content for the modal.
   * @param payload - Optional data to pass to the modal component.
   * @param options - Optional configuration options for the modal.
   * @returns A ComponentRef for the created modal.
   */
  open<T extends ModalContentComponent>(component: Type<T>, payload?: unknown, options?: ModalOptions): ComponentRef<T> {
    this.overlayRef = this.createOverlay();

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

  /**
   * Closes the currently open modal, if any.
   *
   * @example
   * this.dynamicModalService.close();
   */
  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.onModalClose$.next();
    }
  }

  /**
   * Detaches the currently open modal, if any, without triggering the onModalClose$ event.
   *
   * @example
   * this.dynamicModalService.closed();
   */
  closed(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }

  /**
   * Creates an Injector with the given payload.
   *
   * @param payload - The data to use for the MODAL_DATA token.
   * @returns An Injector that can be used for the ComponentPortal.
   */
  private createInjector(payload: unknown): Injector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(MODAL_DATA, payload);

    return Injector.create({
      parent: this.injector,
      providers: [{ provide: MODAL_DATA, useValue: payload }],
    });
  }

  /**
   * Creates an OverlayRef with the default configuration for a modal.
   *
   * @returns An OverlayRef that can be used to attach a ComponentPortal.
   */
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
