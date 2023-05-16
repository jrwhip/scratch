import { ColDef } from 'ag-grid-community';

export function bindMethodToAgGridOnClick<T>(component: T, colDefs: ColDef[]): ColDef[] {
  return colDefs.map((colDef) => {
    if (colDef.cellRendererParams && colDef.cellRendererParams.buttons) {
      colDef.cellRendererParams.buttons = colDef.cellRendererParams.buttons.map(
        (button: { functionName: keyof T }) => {
          const method = component[button.functionName as keyof T] as (...args: any[]) => void;

          if (typeof method === 'function') {
            const boundFunction = method.bind(component, button);
            return {
              ...button,
              onClick: boundFunction,
            };
          }
          console.error(
            `Method '${button.functionName.toString()}' not found in the component or not a function.`,
          );
          return button;
        },
      );
    }
    return colDef;
  });
}