/* eslint-disable @typescript-eslint/dot-notation */
import { AgGridButtonHandlerService } from '@webteam-shared-client/shared/ui-utilities';
import { BehaviorSubject, take, shareReplay, map, combineLatest, tap, Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';

import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService } from '@webteam-shared-client/shared/state';
import {
  ViewPeComponentAssignmentByRater,
  ViewPeExamsPending,
  ViewRater,
} from '@webteam-shared-client/uip-admin-app/api-uip-admin';

import { GridOptions } from 'ag-grid-community';
import { PerformanceAddRaterComponent } from '../performance-add-rater/performance-add-rater.component';

import { ExamsService } from '../exams.service';

@Component({
  selector: 'webteam-shared-client-performance-assign-raters',
  templateUrl: './performance-assign-raters.component.html',
})
export class PerformanceAssignRatersComponent implements OnInit {
  viewPeComponentAssignmentByRatersBS$ = new BehaviorSubject<ViewPeComponentAssignmentByRater[]>([]);

  vm$: Observable<{
    viewPeComponentAssignmentByRaters: any[];
    viewRaters: { [key: number]: ViewRater[] };
    raterTypeCounts: { [index: number]: number };
    disableStartRatingButton: boolean;
  }>;

  locationState: { data: ViewPeExamsPending } | undefined;

  showStartRatingButton = true;
  showAddButtons = false;

  // Here's a placeholder for your missing variable.
  // You may need to change its initialization based on your actual requirement.
  ratingStartedClicked$ = new BehaviorSubject<boolean>(false);

  constructor(private examsService: ExamsService, private location: Location, private stateService: StateService, private router: Router) {}

  ngOnInit() {
    if (this.locationState) {
      this.stateService.isLoading = true;
      this.assignRaters();
    } else {
      this.location.back();
    }
  }

  assignRaters() {
    const vmAssignRaters$ = this.examsService.vmAssignRaters(this.locationState.data).pipe(
      shareReplay(1)
    );

    const viewPeComponentAssignmentByRaters$ = vmAssignRaters$.pipe(
      map((res) => res.viewPeComponentAssignmentByRaters)
    );

    const viewRaters$ = vmAssignRaters$.pipe(map((res) => res.viewRaters));

    const raterTypeCounts$ = viewPeComponentAssignmentByRaters$.pipe(
      map((viewPeComponentAssignmentByRaters) => {
        // Initializing counters
        const raterTypeCounts = {
          '1': 0,
          '2': 0,
          '3': 0,
        };

        // Counting occurrences
        viewPeComponentAssignmentByRaters.forEach((item) => {
          if (item.raterTypeId && item.raterTypeId in raterTypeCounts) {
            raterTypeCounts[item.raterTypeId] += 1;
          }
        });

        return raterTypeCounts;
      })
    );

    const disableStartRatingButton$ = combineLatest([
      raterTypeCounts$,
      this.ratingStartedClicked$
    ]).pipe(
      map(([raterTypeCounts, ratingStartedClicked]) => {
        const peTypeId = this.locationState?.data.peTypeId;
        const deafRatersAssigned = raterTypeCounts['1'];
        const cdiRatersAssigned = raterTypeCounts['2'];


        const interpreterRatersAssigned = raterTypeCounts['3'];

        const isPeType1 =
          peTypeId === 1 &&
          (deafRatersAssigned !== 3 ||
            interpreterRatersAssigned !== 3 ||
            cdiRatersAssigned !== 3);

        const isPeType2 =
          peTypeId === 2 &&
          (deafRatersAssigned !== 3 || interpreterRatersAssigned !== 3 || cdiRatersAssigned !== 3);

        const isPeType3 = peTypeId === 3 && cdiRatersAssigned !== 3;

        return isPeType1 || isPeType2 || isPeType3 || ratingStartedClicked;
      })
    );

    this.vm$ = combineLatest([
      viewPeComponentAssignmentByRaters$,
      viewRaters$,
      raterTypeCounts$,
      disableStartRatingButton$
    ]).pipe(
      tap(() => {
        this.stateService.isLoading = false;
      }),
      map(([viewPeComponentAssignmentByRaters, viewRaters, raterTypeCounts, disableStartRatingButton]) => ({
        viewPeComponentAssignmentByRaters,
        viewRaters,
        raterTypeCounts,
        disableStartRatingButton
      }))
    );
  }

  // Rest of your methods...

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
    this.ratingStartedClicked$.next(true);
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

  updateViewRaters() {
    // Implement the logic of this method here...
  }
}
