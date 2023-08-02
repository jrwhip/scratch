import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';

import { ColumnDefinitions as CD } from '@webteam-shared-client/uip-admin-app/lib-uip-admin';
import { CustomSetFilterComponent } from '@webteam-shared-client/shared/ui-shared';
import {
  PeExamsAll,
  PerformanceExamsControllerService,
} from '@webteam-shared-client/uip-admin-app/api-uip-admin';

import { map } from 'rxjs';

import { ColDef, ColumnState, GridOptions } from 'ag-grid-community';

interface GridData {
  gridOptions: GridOptions;
  rowData: PeExamsAll[];
  pageTitle: string;
  fileName: string;
}

const columnDefs: ColDef[] = [
  CD.InterpreterName,
  CD.ScheduledDate,
  CD.Attempt,
  {
    headerName: 'Exam Type',
    field: 'examType',
    flex: 4,
    filterFramework: CustomSetFilterComponent,
  },
  CD.PeVersion,
  CD.CalcExamPassFail,
  CD.RaterFormTitle,
];

const allGridOptions: GridOptions = {
  columnDefs,
  domLayout: 'autoHeight',
  pagination: true,
  paginationPageSize: 10,
  rowSelection: 'single',
  animateRows: true,
  onGridReady: (params) => {
    const defaultSortModel: ColumnState[] = [
      { colId: 'interpreterName', sort: 'asc', sortIndex: 0 },
      { colId: 'attempt', sort: 'asc', sortIndex: 1 },
    ];
    params.columnApi.applyColumnState({ state: defaultSortModel });
  },
};

export const AllPerformanceExamsResolver: ResolveFn<GridData> = () =>
  inject(PerformanceExamsControllerService)
    .getAllPeExams()
    .pipe(
      map((rowData: PeExamsAll[]) => ({
        rowData,
        gridOptions: allGridOptions,
        pageTitle: 'Performance Exams',
        fileName: 'performance-exams',
      })),
    );
