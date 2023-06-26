import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridButtonHandlerService } from '@webteam-shared-client/shared/ui-utilities';
import { GridOptions } from 'ag-grid-community';
import { ViewPeComponentAssignmentByRater, ViewPeExamsPending, ViewRater } from '@webteam-shared-client/uip-admin-app/api-uip-admin';
import { ExamsService } from '../exams.service';
import { switchMap, map, catchError, tap, startWith, combineLatest } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface ViewModel {
  viewPeComponentAssignmentByRaters: ViewPeComponentAssignmentByRater[];
  viewRaters: { [key: number]: ViewRater[] };
  gridOptions: GridOptions;
  showStartRatingButton: boolean;
  showAddButtons: boolean;
  disableStartRatingButton: boolean;
  locationState: { data: ViewPeExamsPending } | undefined;
}

@Component({
  selector: 'webteam-shared-client-performance-assign-raters',
  templateUrl: './performance-assign-raters.component.html',
})
export class PerformanceAssignRatersComponent implements OnInit {
  isLoading = true;
  ratingStarted$ = new Subject<void>();

  vm$ = combineLatest([
    this.route.data,
    this.ratingStarted$.pipe(startWith(false))
  ]).pipe(
    tap(() => this.isLoading = true),
    switchMap(([res, ratingStarted]) => {
      const locationState = this.location.getState() as { data: ViewPeExamsPending } | undefined;
      return this.examsService.vmAssignRaters(locationState?.data).pipe(
        map((vmRes) => {
          const raterTypeCounts: { [index: number]: number } = { '1': 0, '2': 0, '3': 0 };
          vmRes.viewPeComponentAssignmentByRaters.forEach((item) => {
            if (item.raterTypeId && item.raterTypeId in raterTypeCounts) {
              raterTypeCounts[item.raterTypeId] += 1;
            }
          });

          const gridOptions = this.agGridButtonHandlerService.bindMethodToAgGridOnClick(
            this,
            res['ratingOptions'].gridOptions.columnDefs,
          );
          const disableStartRatingButton = raterTypeCounts['1'] < 3 || raterTypeCounts['2'] < 3 || raterTypeCounts['3'] < 3 || ratingStarted;

          return {
            viewPeComponentAssignmentByRaters: vmRes.viewPeComponentAssignmentByRaters,
            viewRaters: vmRes.viewRaters,
            gridOptions,
            showStartRatingButton: res['ratingOptions'].showStartRatingButton,
            showAddButtons: res['ratingOptions'].showAddButtons ?? true,
            disableStartRatingButton,
            locationState
          } as ViewModel;
        }),
        catchError((error) => {
          console.error('Error occurred', error);
          return of(null);
        }),
      );
    }),
    tap(() => this.isLoading = false)
  );

  constructor(
    private agGridButtonHandlerService: AgGridButtonHandlerService,
    private examsService: ExamsService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) { }

  ngOnInit() { }

  startRating() {
    this.ratingStarted$.next();
  }

  deleteRaterAssignment(payload: ViewPeComponentAssignmentByRater) {
    this.examsService


      .deleteRaterAssignment(payload)
      .pipe(take(1))
      .subscribe((res: boolean) => {
        if (res) {
          this.ratingStarted$.next();
        } else {
          console.log('Something happened');
        }
      });
  }

  addRater(viewRaters: ViewRater[]) {
    console.log('addRater', viewRaters);
    this.examsService.openModal(PerformanceAddRaterComponent, viewRaters);
  }

  return() {
    this.location.back();
  }

  resetRater(payload: ViewPeComponentAssignmentByRater) {
    this.examsService.resetRater(payload).subscribe((res) => {
      if (res) {
        this.ratingStarted$.next();
      } else {
        console.error('Something went wrong resetting the rater');
      }
    });
  }

  navigateInProgressRaterComponentReport(payload: ViewPeComponentAssignmentByRater) {
    this.vm$.pipe(take(1)).subscribe((vm) => {
      if (vm?.locationState?.data) {
        this.examsService.navigateToRaterComponentReport(
          payload,
          vm.locationState.data,
          'dashboard/performance/exams/in-progress-rater-component-report',
        );
      } else {
        console.error('Something went wrong navigating to the in progress rater component report');
      }
    });
  }

  navigateCompletedRaterComponentReport(payload: ViewPeComponentAssignmentByRater) {
    this.vm$.pipe(take(1)).subscribe((vm) => {
      if (vm?.locationState?.data) {
        this.examsService.navigateToRaterComponentReport(
          payload,
          vm.locationState.data,
          'dashboard/performance/exams/completed-rater-component-report',
        );
      } else {
        console.error('Something went wrong navigating to the completed rater component report');
      }
    });
  }
}
