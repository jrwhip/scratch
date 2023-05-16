import { ColDef } from 'ag-grid-community';

type ButtonParams<T> = {
  functionName: keyof T;
  [key: string]: any;
};

// This function binds component methods to the 'onClick' event of ag-Grid buttons.
// It takes a component instance and an array of column definitions, and returns
// an updated array of column definitions with the component methods bound to the
// onClick event of the buttons.
function isFunctionName<T>(key: keyof T, component: T): key is keyof T {
  return typeof component[key] === 'function';
}

function mapButtons<T>(component: T, button: ButtonParams<T>): ButtonParams<T> {
  if (isFunctionName(button.functionName, component)) {
    const method = component[button.functionName] as (...args: any[]) => void;
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
}

export function bindMethodToAgGridOnClick<T>(component: T, colDefs: ColDef[]): ColDef[] {
  return colDefs.map((colDef) => {
    const { cellRendererParams } = colDef;

    if (cellRendererParams?.buttons) {
      cellRendererParams.buttons = cellRendererParams.buttons.map((button) => mapButtons(component, button));
    }

    return { ...colDef, cellRendererParams };
  });
}
