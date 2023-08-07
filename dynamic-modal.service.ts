import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, EventEmitter, Injectable, Injector, Type } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { Subject, take } from 'rxjs';
import { StateService } from './path-to-your-state-service'; // Update with the actual path
import { MODAL_DATA } from './modal-data.token';

/**
 * Interface for modal content components.
 * Components that are meant to be loaded as modals should implement this interface.
 */
export interface ModalContentComponent {
  modalEvent: EventEmitter<string>;
}

/**
 * Interface for modal options.
 * disableClickOutsideToClose: If true, clicking outside the modal will not close it.
 * disableCloseIfLoading: If true, the modal will not close if a loading operation is in progress.
 */
export interface ModalOptions {
  disableClickOutsideToClose?: boolean;
  disableCloseIfLoading?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DynamicModalService {
  private overlayRef: OverlayRef | null = null;
  private options?: ModalOptions;

  onModalClose$ = new Subject<void>();

  constructor(
    private overlay: Overlay,
    private injector: Injector,
    private stateService: StateService // Inject StateService
  ) {}

  /**
   * Opens a modal with the specified component and payload.
   * @param {Type<T>} component - The component to load in the modal.
   * @param {unknown} payload - The data to pass to the component.
   * @param {ModalOptions} options - The options for the modal.
   * @returns {ComponentRef<T>} - A reference to the loaded component.
   */
  open<T extends ModalContentComponent>(component: Type<T>, payload?: unknown, options?: ModalOptions): ComponentRef<T> {
    this.options = options;
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
   * Closes the modal.
   */
  close() {
    this.performActionOnOverlay((overlayRef) => {
      overlayRef.dispose();
      this.onModalClose$.next();
    });
  }

  /**
   * Detaches the modal.
   */
  closed(): void {
    this.performActionOnOverlay((overlayRef) => {
      overlayRef.detach();
    });
  }

  /**
   * Performs an action on the overlay if it exists and a loading operation is not in progress.
   * @param {(overlayRef: OverlayRef) => void} action - The action to perform on the overlay.
   */
  private performActionOnOverlay(action: (overlayRef: OverlayRef) => void) {
    if (this.overlayRef) {
      if (this.options?.disableCloseIfLoading) {
        this.stateService.isLoading$.pipe(take(1)).subscribe(isLoading => {
          if (!isLoading) {
            action(this.overlayRef);
            this.overlayRef = null;
          }
        });
      } else {
        action(this.overlayRef);
        this.overlayRef = null;
      }
    }
  }

  /**
   * Creates an injector with the specified payload.
   * @param {unknown} payload - The data to pass to the injector.
   * @returns {Injector} - The created injector.
   */
  private createInjector(payload: unknown): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [{ provide: MODAL_DATA, useValue: payload }],
    });
  }

  /**
   * Creates an overlay with the specified configuration.
   * @returns {OverlayRef} - The created overlay.
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
