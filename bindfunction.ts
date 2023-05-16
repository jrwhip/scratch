import { ColDef } from 'ag-grid-community';

export function bindOnClickFunction<T>(component: T, colDefs: ColDef[]): ColDef[] {
  return colDefs.map(colDef => {
    if (colDef.cellRendererParams && colDef.cellRendererParams.buttons) {
      colDef.cellRendererParams.buttons = colDef.cellRendererParams.buttons.map(button => {
        const boundFunction = component[button.functionName as keyof T].bind(component, button) as (...args: any[]) => void;
        return {
          ...button,
          onClick: boundFunction,
        };
      });
    }
    return colDef;
  });
}
