import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ICellRendererParams } from 'ag-grid-community';
import { AgRendererComponent, ICellRendererAngularComp } from 'ag-grid-angular';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGhost } from '@fortawesome/free-solid-svg-icons';

interface Button {
  label: string;
  imagePath?: string;
  icon?: IconProp;
  onClick: (params: ICellRendererParams) => void;
}

interface CellRendererButtonsParams extends ICellRendererParams {
  buttons: Button[];
}

@Component({
  selector: 'webteam-shared-client-cell-renderer-buttons',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './cell-renderer-buttons.component.html',
  styleUrls: ['./cell-renderer-buttons.component.scss'],
})
export class CellRendererButtonsComponent implements AgRendererComponent, ICellRendererAngularComp {
  params!: CellRendererButtonsParams;

  faIcon!: IconProp;

  faGhost = faGhost;

  agInit(params: CellRendererButtonsParams): void {
    this.params = params;
  }

  refresh(params: CellRendererButtonsParams): boolean {
    this.params = params;
    return false;
  }
}
