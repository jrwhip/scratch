import { AgGridButtonHandlerService } from '@webteam-shared-client/shared/ui-utilities';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ViewPeComponentAssignmentByRater,
  ViewPeExamsPending,
  ViewRater,
} from '@webteam-shared-client/uip-admin-app/api-uip-admin';
import { GridOptions } from 'ag-grid-community';
import { PerformanceAddRaterComponent } from '../performance-add-rater/performance-add-rater.component';
import { ExamsService } from '../exams.service';
import { EMPTY, Observable, of } from 'rxjs';
import { map, switchMap, catchError, tap, startWith, filter } from 'rxjs/operators';

interface RatingOptions {
  gridOptions: GridOptions;
  showStartRatingButton: boolean;
}

@Component({
  selector: 'webteam-shared-client-performance-assign-raters',
  templateUrl: './performance-assign-raters.component.html',
})
export class PerformanceAssignRatersComponent implements OnInit {
  // Hold initial values and structure for each part of the state
  initialViewState = {
    viewPeComponentAssignmentByRaters: [],
    viewRaters: {},
    gridOptions: {} as GridOptions,
    locationState: undefined,
    showStartRatingButton: true,
    showAddButtons: false,
    disableStartRatingButton: true,
    ratingStartedClicked: false,
    cdiRatersAssigned: 0,
    deafRatersAssigned: 0,
    interpreterRatersAssigned: 0,
  };

  vm$: Observable<any>;

  constructor(
    private agGridButtonHandlerService: AgGridButtonHandlerService,
    private examsService: ExamsService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit() {
    // Combine all the Observables
    this.vm$ = this.route.data.pipe(
      switchMap((res) => {
        const gridData = res['ratingOptions'].gridOptions;
        gridData.columnDefs = this.agGridButtonHandlerService.bindMethodToAgGridOnClick(
          this,
          gridData.columnDefs,
        );

        this.initialViewState.gridOptions = gridData;
        this.initialViewState.showStartRatingButton = res['ratingOptions'].showStartRatingButton;
        this.initialViewState.showAddButtons = res['ratingOptions'].showAddButtons ?? true;
        this.initialViewState.locationState = this.location.getState() as {
          data: ViewPeExamsPending;
        };
        this.initialViewState.disableStartRatingButton = this.calculateDisableStartRatingButton();

        return this.updateViewRaters().pipe(
          map((res) => {
            this.initialViewState.viewPeComponentAssignmentByRaters = res.viewPeComponentAssignmentByRaters;
            this.initialViewState.viewRaters = res.viewRaters;

            // Calculate counters
            const raterTypeCounts: { [index: number]: number } = {
              '1': 0,
              '2': 0,
              '3': 0,
            };

            // Counting occurrences
            res.viewPeComponentAssignmentByRaters.forEach((item) => {
              if (item.raterTypeId) {
                if (item.raterTypeId in raterTypeCounts) {
                  raterTypeCounts[item.raterTypeId] += 1;
                }
              }
            });

            this.initialViewState.deafRatersAssigned = raterTypeCounts['1'];
            this.initialViewState.cdiRatersAssigned = raterType

Counts['2'];
            this.initialViewState.interpreterRatersAssigned = raterTypeCounts['3'];

            // Return the updated state
            return this.initialViewState;
          }),
        );
      }),
    );
  }

  calculateDisableStartRatingButton(): boolean {
    return this.initialViewState.viewPeComponentAssignmentByRaters.length <= 0;
  }

  updateViewRaters(): Observable<{ viewPeComponentAssignmentByRaters: ViewPeComponentAssignmentByRater[]; viewRaters: { [key: number]: ViewRater[] } }> {
    return this.examsService.vmAssignRaters(
      this.initialViewState.locationState.data.viewPeExamId,
      this.initialViewState.locationState.data.peComponentId,
      this.initialViewState.locationState.data.examComponentId,
    ).pipe(
      take(1),
      catchError(() => {
        console.log('Something happened');
        return of({ viewPeComponentAssignmentByRaters: [], viewRaters: {} });
      })
    );
  }

  deleteRaterAssignment(payload: ViewPeComponentAssignmentByRater): Observable<ViewPeComponentAssignmentByRater> {
    return this.examsService.deleteRaterAssignment(payload).pipe(
      take(1),
      map(res => res ? payload : null),
      catchError(() => {
        console.log('Something happened');
        return of(null);
      })
    );
  }

  startRatingButtonClicked() {
    this.initialViewState.ratingStartedClicked = true;
    this.examsService.openModal(PerformanceAddRaterComponent, this.initialViewState.locationState.data);
  }

  refreshAfterClose(): Observable<boolean> {
    return this.examsService.refreshAssignRaters
      .pipe(
        filter((val) => !!val),
        switchMap(() => this.updateViewRaters()),
        map((res) => !!res)
      );
  }

  navigateToNextTab() {
    const updatedData = {
      data: this.initialViewState.locationState.data,
    };
    this.router.navigate(['../score'], {
      relativeTo: this.route,
      state: updatedData,
    });
  }

  backToPrevious() {
    this.router.navigate(['../assign-tests'], { relativeTo: this.route });
  }
}
