/* eslint-disable @typescript-eslint/dot-notation */
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';

import { Observable, map, tap } from 'rxjs';

import { bindMethodToAgGridOnClick } from '@webteam-shared-client/shared/ui-utilities';

interface RowData {
  gridOptions: GridOptions;
  exams: any;
}

@Component({
  selector: 'webteam-shared-client-uip-admin-performance-exams',
  templateUrl: './exams.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamsComponent {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  rowData$!: Observable<RowData>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.rowData$ = this.route.data.pipe(
      map((res) => {
        const gridData = res['gridData'];
        const columnDefs = bindMethodToAgGridOnClick(this, gridData?.gridOptions?.columnDefs);
        if (columnDefs) {
          console.log('Columns, ', columnDefs);
        }
        if (gridData?.gridOptions) {
          console.log('Column Defs: ', gridData.gridOptions);
        }
        return gridData;
      }),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  testMethod() {
    console.log('TADA');
  }
}