import { ColDef, GridOptions, SortDirection } from 'ag-grid-community';

import { CellRendererButtonsComponent } from '@webteam-shared-client/shared/ui-shared';
import { customDateComparator, dateFormatter } from '@webteam-shared-client/shared/ui-utilities';
import { faFont, faTimes, faVideo } from '@fortawesome/free-solid-svg-icons';

const columnDefs: ColDef[] = [
  {
    headerName: 'Name',
    floatingFilter: true,
    filter: 'agTextColumnFilter',
    field: 'interpreterName',
    sort: 'asc' as SortDirection,
    minWidth: 200,
    flex: 5,
    sortable: true,
  },
  {
    headerName: 'Scheduled Date',
    field: 'scheduledDate',
    valueFormatter: dateFormatter,
    comparator: customDateComparator,
    floatingFilter: true,
    filter: 'agTextColumnFilter',
    flex: 4,
    sortable: true,
  },
  {
    headerName: 'Attempt',
    field: 'attempt',
    floatingFilter: true,
    filter: 'agTextColumnFilter',
    flex: 3,
    sortable: true,
  },
  {
    headerName: 'Version',
    field: 'peVersion',
    floatingFilter: true,
    filter: 'agTextColumnFilter',
    flex: 3,
    sortable: true,
  },
  {
    headerName: 'Rating Form',
    field: 'raterFormTitle',
    floatingFilter: true,
    filter: 'agTextColumnFilter',
    flex: 5,
    sortable: true,
  },
  {
    headerName: '',
    field: '',
    cellRenderer: CellRendererButtonsComponent,
    cellRendererParams: {
      buttons: [
        {
          label: 'Update Version',
          functionName: 'testMethod',
          icon: faFont,
        },
        {
          label: 'No Show',
          functionName: 'testMethod',
          icon: faTimes,
        },
        {
          label: 'Video URLs',
          functionName: 'testMethod',
          icon: faVideo,
        },
      ],
    },
    flex: 2,
  },
];
export const pendingGridOptions: GridOptions = {
  columnDefs,
  domLayout: 'autoHeight',
  pagination: true,
  paginationPageSize: 10,
  rowSelection: 'single',
  animateRows: true,
};
