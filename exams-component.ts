import { ActivatedRoute } from '@angular/router';
import { bindMethodToAgGridOnClick } from '@webteam-shared-client/shared/ui-utilities';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';
import { Observable, map } from 'rxjs';

interface RowData {
  gridOptions: GridOptions;
  exams: any;
}

@Component({
  selector: 'webteam-shared-client-uip-admin-performance-exams',
  templateUrl: './exams.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamsComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  rowData$!: Observable<RowData>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.rowData$ = this.route.data.pipe(
      map((res) => {
        const { gridData } = res;
        if (gridData && gridData.gridOptions && gridData.gridOptions.columnDefs) {
          const columnDefs = bindMethodToAgGridOnClick(this, gridData.gridOptions.columnDefs);
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