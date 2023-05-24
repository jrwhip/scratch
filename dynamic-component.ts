import {
  Component,
  Injector,
  NgModuleFactory,
  ɵcreateNgModuleFactory as createNgModuleFactory,
  ɵrenderComponent as renderComponent,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ModalService } from './modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-wrapper',
  template: `
    <div class="overlay" (click)="closeModal()">
      <div class="modal-container">
        <button class="close-button" (click)="closeModal()">Close</button>
        <ng-container #dynamicComponentContainer></ng-container>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .modal-container {
      background-color: white;
      padding: 1rem;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      min-width: 300px;
    }
    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  `]
})
export class ModalWrapperComponent implements OnInit {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) containerRef: ViewContainerRef;

  constructor(
    private injector: Injector,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.loadDynamicComponent();
  }

  loadDynamicComponent() {
    const component = this.modalService.getComponent();
    const ngModuleFactory = this.createNgModuleFactory(component);
    const ngModuleRef = ngModuleFactory.create(this.injector);

    this.containerRef.clear();
    const componentFactory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(component);
    this.containerRef.createComponent(componentFactory);
  }

  createNgModuleFactory(component: any): NgModuleFactory<any> {
    @NgModule({
      declarations: [component],
      imports: [CommonModule]
    })
    class DynamicModule {}
    return createNgModuleFactory(DynamicModule);
  }

  closeModal() {
    this.modalService.closeModal();
  }
}
