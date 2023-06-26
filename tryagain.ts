import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridButtonHandlerService } from '@webteam-shared-client/shared/ui-utilities';
import { GridOptions } from 'ag-grid-community';
import { ViewPeComponentAssignmentByRater, ViewPeExamsPending, ViewRater } from '@webteam-shared-client/uip-admin-app/api-uip-admin';
import { ExamsService } from '../exams.service';
import { switchMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { of, combineLatest, BehaviorSubject } from 'rxjs';

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
  ratingStartedClicked$ = new BehaviorSubject(false);

  vm$ = combineLatest([
    this.route.data,
    this.ratingStartedClicked$
  ]).pipe(
    tap(() => this.isLoading = true),
    switchMap(([res, ratingStartedClicked]) => {
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
          const disableStartRatingButton = raterTypeCounts['1'] < 3 || raterTypeCounts['2'] < 3 || raterTypeCounts['3'] < 3 || ratingStartedClicked;

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
  ) {}

  ngOnInit() {}

  startRating(vm: ViewModel) {
    this.ratingStartedClicked$.next(true);
    if (vm.locationState?.data.peId) {
      this.examsService.startRating(vm.locationState.data.peId);
      this.router.navigate(['dashboard/performance/exams/rating-assignments']);
    } else {
      this.location.back();
    }
  }
}
