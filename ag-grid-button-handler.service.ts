import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

type ButtonParams<T> = {
  functionName: keyof T;
  route?: string;
  routeParams?: (data: Record<string, unknown>) => Record<string, unknown>;
} & Record<string, unknown>;

type Params = {
  data: Record<string, unknown>;
};

@Injectable({
  providedIn: 'root',
})
export class AgGridButtonHandlerService {
  constructor(private router: Router) {}

  // This function binds component methods to the 'onClick' event of ag-Grid buttons.
  // It takes a component instance and an array of column definitions, and returns
  // an updated array of column definitions with the component methods bound to the
  // onClick event of the buttons.
  static isFunctionName<T>(key: keyof T, component: T): key is keyof T {
    return typeof component[key] === 'function';
  }

  mapButtons<T>(component: T, button: ButtonParams<T>): ButtonParams<T> {
    if (AgGridButtonHandlerService.isFunctionName(button.functionName, component)) {
      const method = component[button.functionName] as (...args: unknown[]) => void;
      const boundFunction = method.bind(component);
      return {
        ...button,
        onClick: boundFunction,
      };
    }

    if (button.route) {
      const navigateFunction = (params: ICellRendererParams) => {
        const routeParams = button.routeParams ? button.routeParams(params.data) : {};
        this.router.navigate([button.route], { queryParams: routeParams });
      };
      return {
        ...button,
        onClick: navigateFunction,
      };
    }

    // Needed to provide more specific information about which method is not found in the component
    // or is not a function. This can help with debugging and troubleshooting.
    // eslint-disable-next-line no-console
    console.error(
      `Method '${button.functionName.toString()}' not found in the component or not a function.`,
    );
    return button;
  }

  bindMethodToAgGridOnClick<T>(component: T, colDefs: ColDef[]): ColDef[] {
    return colDefs.map((colDef) => {
      const { cellRendererParams } = colDef;

      if (cellRendererParams?.buttons) {
        cellRendererParams.buttons = cellRendererParams.buttons.map((button: ButtonParams<T>) =>
          this.mapButtons(component, button),
        );
      }

      return { ...colDef, cellRendererParams };
    });
  }
}
