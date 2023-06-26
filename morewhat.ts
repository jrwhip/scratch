/* eslint-disable @typescript-eslint/dot-notation */
import { AgGridButtonHandlerService } from '@webteam-shared-client/shared/ui-utilities';
import { BehaviorSubject, take, throwError } from 'rxjs';
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

interface RatingOptions {
  gridOptions: GridOptions;
  showStartRatingButton: boolean;
}

@Component({
  selector: 'webteam-shared-client-performance-assign-raters',
  templateUrl: './performance-assign-raters.component.html',
})
export class PerformanceAssignRatersComponent implements OnInit {
  viewPeComponentAssignmentByRatersBS$ = new BehaviorSubject<ViewPeComponentAssignmentByRater[]>(
    [],
  );

  viewPeComponentAssignmentByRaters$ = this.viewPeComponentAssignmentByRatersBS$.asObservable();

  vmViewRatersBs$ = new BehaviorSubject<{ [key: number]: ViewRater[] }>({});

  vmViewRaters$ = this.vmViewRatersBs$.asObservable();

  gridOptionsBs$ = new BehaviorSubject<GridOptions>({} as GridOptions);

  gridOptions$ = this.gridOptionsBs$.asObservable();

  locationState: { data: ViewPeExamsPending } | undefined;

  cdiRatersAssigned = 0;

  deafRatersAssigned = 0;

  interpreterRatersAssigned = 0;

  ratingStartedClicked = false;

  disableStartRatingButton = true;

  showStartRatingButton = true;

  showAddButtons = false;

  constructor(
    private agGridButtonHandlerService: AgGridButtonHandlerService,
    private examsService: ExamsService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit() {
    this.locationState = this.location.getState() as {
      data: ViewPeExamsPending;
    };
    this.route.data.subscribe((res) => {
      console.log('res', res);
      this.showStartRatingButton = res['ratingOptions'].showStartRatingButton;
      console.log('this.showStartRatingButton', this.showStartRatingButton);
      const gridData = res['ratingOptions'].gridOptions;

      this.showAddButtons = res['ratingOptions'].showAddButtons ?? true;

      gridData.columnDefs = this.agGridButtonHandlerService.bindMethodToAgGridOnClick(
        this,
        gridData.columnDefs,
      );
      this.gridOptionsBs$.next(gridData);
    });
    this.updateViewRaters();
  }

  updateViewRaters() {
    if (this.locationState) {
      this.examsService.vmAssignRaters(this.locationState.data).subscribe((res) => {
        this.viewPeComponentAssignmentByRatersBS$.next(res.viewPeComponentAssignmentByRaters);
        this.vmViewRatersBs$.next(res.viewRaters);

        // Initializing counters
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

        this.deafRatersAssigned = raterTypeCounts['1'];
        this.cdiRatersAssigned = raterTypeCounts['2'];
        this.interpreterRatersAssigned = raterTypeCounts['3'];

        this.disableStartRatingButton =
          (this.locationState?.data.peTypeId === 1 &&
            (this.deafRatersAssigned !== 3 ||
              this.interpreterRatersAssigned !== 3 ||
              this.cdiRatersAssigned !== 3)) ||
          (this.locationState?.data.peTypeId === 2 &&
            (this.deafRatersAssigned !== 3 ||
              this.interpreterRatersAssigned !== 3 ||
              this.cdiRatersAssigned !== 3)) ||
          (this.locationState?.data.peTypeId === 3 && this.cdiRatersAssigned !== 3) ||
          this.ratingStartedClicked;
      });
    } else {
      this.location.back();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  deleteRaterAssignment(payload: ViewPeComponentAssignmentByRater) {
    this.examsService
      .deleteRaterAssignment(payload)
      .pipe(take(1))
      .subscribe((res: boolean) => {
        if (res) {
          this.updateViewRaters();
        } else {
          console.log('Something happened');
        }
      });
  }

  addRater(viewRaters: ViewRater[]) {
    console.log('addRater', viewRaters);
    this.examsService.openModal(PerformanceAddRaterComponent, viewRaters);
  }

  startRating() {
    this.ratingStartedClicked = true;
    if (this.locationState?.data.peId) {
      this.examsService.startRating(this.locationState.data.peId);
      this.router.navigate(['dashboard/performance/exams/rating-assignments']);
    } else {
      this.location.back();
    }
  }

  return() {
    this.location.back();
  }

  resetRater(payload: ViewPeComponentAssignmentByRater) {
    this.examsService.resetRater(payload).subscribe((res) => {
      if (res) {
        this.updateViewRaters();
      } else {
        console.error('Something went wrong resetting the rater');
      }
    });
  }

  navigateInProgressRaterComponentReport(payload: ViewPeComponentAssignmentByRater) {
    if (this.locationState?.data) {
      this.examsService.navigateToRaterComponentReport(
        payload,
        this.locationState.data,
        'dashboard/performance/exams/in-progress-rater-component-report',
      );
    }
    return console.error(
      'Something went wrong navigating to the in progress rater component report',
    );
  }

  navigateCompletedRaterComponentReport(payload: ViewPeComponentAssignmentByRater) {
    if (this.locationState?.data) {
      this.examsService.navigateToRaterComponentReport(
        payload,
        this.locationState.data,
        'dashboard/performance/exams/completed-rater-component-report',
      );
    }
    return console.error(
      'Something went wrong navigating to the in progress rater component report',
    );
  }
}
