import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IFilterAngularComp } from 'ag-grid-angular';
import {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
  IFilterParams,
  ValueGetterParams,
} from 'ag-grid-community';

interface FilterModel {
  value: string;
}

@Component({
  selector: 'webteam-shared-client-custom-set-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <select (change)="onChange($event)" [(ngModel)]="selectedValue">
      <option *ngFor="let item of filterValues" [value]="item">{{ item }}</option>
    </select>
  `,
  styleUrls: ['./custom-set-filter.component.scss'],
})
export class CustomSetFilterComponent implements IFilterAngularComp {
  private params!: IFilterParams;

  private valueGetter!: (params: ValueGetterParams) => string;

  public selectedValue = '';

  public filterValues: string[] = ['popcorn', 'lug wrench'];

  agInit(params: IFilterParams): void {
    this.params = params;
    this.valueGetter = this.params.valueGetter;
  }

  updateFilterValues(values: string[]): void {
    this.filterValues = values;
    if (this.filterValues.length > 0 && this.selectedValue) {
      this.params.filterChangedCallback();
    }
  }

  isFilterActive(): boolean {
    return (
      this.selectedValue !== null && this.selectedValue !== undefined && this.selectedValue !== ''
    );
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    const value = this.valueGetter({
      data: params.node.data,
      node: params.node,
      colDef: this.params.column.getColDef(),
      column: this.params.column,
      api: this.params.api,
      columnApi: this.params.columnApi,
      context: this.params.context,
      getValue: (field: string) => this.params.api.getValue(field, params.node),
    });
    return this.selectedValue === value;
  }

  getModel(): FilterModel {
    return { value: this.selectedValue };
  }

  setModel(model: FilterModel): void {
    this.selectedValue = model ? model.value : '';
  }

  onChange(event: Event): void {
    this.selectedValue = (event.target as HTMLSelectElement).value;
    if (this.selectedValue) {
      this.params.filterChangedCallback();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {}
}
