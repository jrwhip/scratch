import { ColDef } from 'ag-grid-community';

export function bindOnClickFunction<T>(component: T, colDefs: ColDef[]): ColDef[] {
  return colDefs.map(colDef => {
    if (colDef.cellRendererParams && colDef.cellRendererParams.buttons) {
      colDef.cellRendererParams.buttons = colDef.cellRendererParams.buttons.map(button => {
        const method = component[button.functionName as keyof T] as (...args: any[]) => void;
        const boundFunction = method.bind(component, button);
        return {
          ...button,
          onClick: boundFunction,
        };
      });
    }
    return colDef;
  });
}
