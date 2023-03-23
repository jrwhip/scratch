import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, forkJoin, of } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  catchError,
  distinctUntilChanged,
  map,
  mergeMap,
  share,
  shareReplay,
  take,
  tap
} from 'rxjs/operators';

import { AdminApplicationView } from '../models/admin-application-view.model';
import { ApplicationEnrollmentEntity } from '../models/application-enrollment-entity.model';
import { ApplicationFileEntity } from '../models/application-file-entity.model';
import { ApplicationPaymentView } from '../models/application-payment-view.model';
import { Component } from '@angular/core';
import { ConfirmationService } from '../services/confirmation.service';
import { DenyDialogComponent } from './deny-dialog/deny-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelValue } from '../models/label-value';
import { Location } from '@angular/common';
import { MaxLength } from '../shared/form/validation/max-length';
import { MinLength } from '../shared/form/validation/min-length';
import { MonthlyReportEnrollmentEntity } from '../models/monthly-report-enrollment-entity.model';
import { NotificationService } from '../services/notification.service';
import { Numeric } from '../shared/form/validation/numeric';
import { NumericRange } from '../shared/form/validation/numeric-range';
import { PaymentView } from '../models/payment-view.model';
import { PutWorkerApplication } from '../models/put-worker-application.model';
import { Required } from '../shared/form/validation/required';
import { StoreService } from '../services/store.service';
import { StringExtensions } from '../classes/string-extensions';
import { UntypedFormBuilder } from '@angular/forms';
import { VmMonthlyGrantExpenditures } from '../models/vm-monthly-grant-expenditures.model';
import { WorkerApiService } from '../services/worker-api.service';
import { saveAs } from 'file-saver';

interface Payments {
  subTotal: number;
  baseRate: number;
  fullTimeEligiblePayment: number;
  partTimeEligiblePayment: number;
}

interface VmApplicationPaymentView extends ApplicationPaymentView {
  vmDetailsDate: Date;
}

@Component({
  selector: 'app-admin-application-processing',
  templateUrl: './admin-application-processing.component.html',
  styleUrls: ['./admin-application-processing.component.scss']
})
export class AdminApplicationProcessingComponent {
  applicationDetails$!: Observable<AdminApplicationView>;
  applicationPaymentView$!: Observable<VmApplicationPaymentView[]>;
  baseRate$ = new BehaviorSubject<number>(350);
  deleting$: Observable<{ loading: boolean }>;
  payments$: Observable<Payments>;
  paymentView$!: Observable<PaymentView[]>;
  monthlyGrantExpenditures$!: Observable<VmMonthlyGrantExpenditures>;
  user$ = this.storeService.user$;
  vm$: Observable<{
    applicationDetails: AdminApplicationView;
    applicationPaymentView: VmApplicationPaymentView[];
    payments: Payments;
    paymentView: PaymentView[];
  }>;
  vmMonthlyGrantExpenditures$!: Observable<VmMonthlyGrantExpenditures[]>;

  adjustmentOptions: LabelValue[] = [
    { label: 'Full-Time', value: 'Full' },
    { label: 'Part-Time', value: 'Part' }
  ];
  applicationEnrollmentsTotal = 0;
  assignedToCurrentUser = false;
  calculatedEnhancedPayment = 0;
  currentApplicationId!: number;
  enhancedPayment = 0;
  isClosed = false;
  ref!: DynamicDialogRef;
  totalChildren$ = new BehaviorSubject<number>(0);
  totalEstimatedMonthlyExpenses = 0;

  noteForm = this.fb.group({
    text: ['', [Required.validate('A note'), MaxLength.validate(8000)]]
  });

  paymentForm = this.fb.group({
    paymentAmount: [
      ,
      [
        Required.validate('Payment Amount'),
        NumericRange.validate(0, 999999),
        Numeric.validate('Payment Amount')
      ]
    ],
    programFein: [
      ,
      [Numeric.validate('FEIN'), MinLength.validate(9), MaxLength.validate(9)]
    ],
    paymentPercentage: []
  });

  selectForm = this.fb.group({
    grantExpendituresMonth: [null]
  });

  workerForm = this.fb.group({
    enhancementApprovedFlag: [false]
  });

  constructor(
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private fb: UntypedFormBuilder,
    private location: Location,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private stringExtensions: StringExtensions,
    private workerApiService: WorkerApiService
  ) {
    this.deleting$ = of({ loading: false });

    this.payments$ = combineLatest([this.baseRate$, this.totalChildren$]).pipe(
      map(([baseRate, totalChildren]) => {
        const subTotal = baseRate * totalChildren;
        const partTimeEligiblePayment = this.calculatePercentage(subTotal, 50);
        return {
          subTotal,
          baseRate,
          fullTimeEligiblePayment: subTotal,
          partTimeEligiblePayment
        };
      }),
      distinctUntilChanged(),
      shareReplay()
    );

    const combinedParamsUser$ = forkJoin([
      this.route.params.pipe(take(1)),
      this.storeService.user$.pipe(take(1))
    ]).pipe(shareReplay());

    this.applicationDetails$ = combinedParamsUser$.pipe(
      mergeMap(([params, user]) => {
        return this.workerApiService
          .getApplicationById(params['id'])
          .pipe(tap(this.setupTemplateFlags.bind(this, user.profile.sub)));
      }),
      tap(this.calcTotalItemValues),
      shareReplay()
    );

    this.applicationPaymentView$ = combinedParamsUser$.pipe(
      mergeMap(([params]) => {
        return this.workerApiService
          .getApplicationPaymentView(params['id'])
          .pipe(
            map((res) => {
              const vmApplicationPaymentView = res.reduce(
                (acc: VmApplicationPaymentView[], curr) => {
                  const paymentDate = RegExp(/\d{4}-\d{1,2}/, 'g').exec(
                    curr.details
                  );
                  const dateArr = (paymentDate?.[0] ?? '').split('-');
                  const d = new Date(
                    parseInt(dateArr[0]),
                    parseInt(dateArr[1]) - 1
                  );
                  return [...acc, { ...curr, vmDetailsDate: d }];
                },
                []
              );
              return vmApplicationPaymentView.sort(
                (a, b) => a.vmDetailsDate.valueOf() - b.vmDetailsDate.valueOf()
              );
            })
          );
      })
    );

    this.paymentView$ = combinedParamsUser$.pipe(
      mergeMap(([params]) => {
        return this.workerApiService.getPaymentView(params['id']);
      })
    );

    this.vmMonthlyGrantExpenditures$ = combineLatest([
      this.route.params,
      this.applicationDetails$
    ]).pipe(
      mergeMap(([{ id }, { monthlyReports }]) => {
        const vmMonthlyGrantExpenditures: Observable<VmMonthlyGrantExpenditures>[] =
          monthlyReports.reduce((acc: any, curr: any) => {
            return [
              ...acc,
              this.workerApiService.getVmMonthlyGrantExpenditures(
                id,
                curr.month,
                curr.year
              )
            ];
          }, []);
        return forkJoin(vmMonthlyGrantExpenditures);
      }),
      shareReplay()
    );

    this.monthlyGrantExpenditures$ = combineLatest([
      this.selectForm.valueChanges,
      this.vmMonthlyGrantExpenditures$,
      this.applicationDetails$
    ]).pipe(
      map(
        ([
          {
            grantExpendituresMonth: { month, year }
          },
          vmMonthlyGrantExpenditures,
          applicationDetails
        ]) => {
          const monthlyReports = applicationDetails.monthlyReports.find(
            (res) => res.month === month && res.year === year
          );
          const totalEnrollments = monthlyReports?.monthlyEnrollments.reduce(
            (acc: number, curr: MonthlyReportEnrollmentEntity) =>
              acc + curr.enrollment,
            0
          );
          const vmMonthlyGrantExpenditure =
            vmMonthlyGrantExpenditures.find(
              (res) => res.month === month && res.year === year
            ) ?? new VmMonthlyGrantExpenditures();
          return {
            ...vmMonthlyGrantExpenditure,
            monthlyEnrollments: monthlyReports?.monthlyEnrollments,
            totalEnrollments
          };
        }
      )
    );

    this.vm$ = combineLatest([
      this.applicationDetails$,
      this.applicationPaymentView$,
      this.payments$,
      this.paymentView$
    ]).pipe(
      map(
        ([
          applicationDetails,
          applicationPaymentView,
          payments,
          paymentView
        ]) => ({
          applicationDetails,
          applicationPaymentView,
          payments,
          paymentView
        })
      ),
      distinctUntilChanged(),
      shareReplay()
    );
  }

  private calculatePercentage(num: number, percent: number): number {
    if (percent < 1) {
      percent = Math.round(percent);
    }
    return Math.round(num * percent) / 100;
  }

  private calcTotalItemValues = (value: AdminApplicationView) => {
    const { applicationEnrollments, applicationExpenses, totalChildren } =
      value;
    this.totalChildren$.next(parseInt(totalChildren));
    const totalItemValues = (itemArr: any[], key: string) =>
      itemArr.reduce((acc, curr) => acc + curr[key], 0);
    this.totalEstimatedMonthlyExpenses = totalItemValues(
      applicationExpenses,
      'amount'
    );
    this.applicationEnrollmentsTotal = totalItemValues(
      applicationEnrollments,
      'enrollment'
    );
    this.currentApplicationId = value.id;
  };

  private putWorkerApplicationBody(approve: boolean): PutWorkerApplication {
    const body = new PutWorkerApplication();
    let paymentAmount: number;
    if (approve) {
      const paymentAmountFromForm =
        this.paymentForm.get('paymentAmount')?.value;
      const paymentAmountAsString = paymentAmountFromForm
        .toString()
        .replace(/[^\d\.]/, '');
      paymentAmount = parseFloat(paymentAmountAsString);
    } else {
      paymentAmount = 0;
    }
    const eaf = this.workerForm.get('enhancementApprovedFlag')?.value;
    body.paymentAmount = paymentAmount;
    body.enhancementApprovedFlag = eaf && approve ? 'Y' : 'N';
    body.status = approve ? 'A' : 'D';
    const programFein = this.paymentForm.get('programFein')?.value ?? null;
    if (programFein) {
      body.programFein = programFein;
    }
    body.fundingFlag = this.paymentForm.get('fundingFlag')?.value;
    return body;
  }

  private setupTemplateFlags(
    sub: string,
    applicationDetails: AdminApplicationView
  ): void {
    const {
      paymentAmount,
      enhancementApprovedFlag: eafValue,
      status,
      workerUniqueId,
      programFein
    } = applicationDetails;
    const baseRate = eafValue === 'Y' ? 400 : 350;
    this.baseRate$.next(baseRate);
    if (workerUniqueId?.toString() === sub) {
      this.assignedToCurrentUser = true;
      this.workerForm.enable();
      this.paymentForm.enable();
    } else {
      this.assignedToCurrentUser = false;
      this.workerForm.disable();
      this.paymentForm.disable();
    }
    if (status === 'C' || status === 'D') {
      this.isClosed = true;
      this.workerForm.disable();
      this.paymentForm.disable();
    }
    !paymentAmount || this.paymentForm.patchValue({ paymentAmount });
    this.paymentForm.patchValue({ programFein });
    this.workerForm.patchValue({
      enhancementApprovedFlag: eafValue === null ? null : eafValue === 'Y'
    });
    this.paymentForm.addControl(
      'fundingFlag',
      this.fb.control(applicationDetails.fundingFlag ?? 'CCSG')
    );
  }

  addNote(): void {
    this.notificationService.loading('Saving Note');
    const text = this.noteForm.get('text')?.value;
    this.route.params
      .pipe(
        take(1),
        mergeMap((params) =>
          this.workerApiService.postWorkerNote(params['id'], text)
        )
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Note Saved');
          this.noteForm.reset();
        },
        error: (error) => {
          this.notificationService.loadingComplete('Saving Note');
          console.error('ERROR: ', error);
        },
        complete: () => this.notificationService.loadingComplete('Saving Note')
      });
  }

  addReportReviewNote(month: number, year: number): void {
    const reviewNoteDate = new Date(year, month - 1).toLocaleDateString(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    );
    this.notificationService.loading('Saving Monthly Report Review Note');
    const text = `The ${reviewNoteDate} Monthly report was reviewed`;
    this.route.params
      .pipe(
        take(1),
        mergeMap((params) =>
          this.workerApiService.postWorkerNote(params['id'], text)
        )
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Monthly Report Review Note Saved');
        },
        error: (error) => {
          this.notificationService.loadingComplete(
            'Saving Monthly Report Review Note'
          );
          console.error('ERROR: ', error);
        },
        complete: () =>
          this.notificationService.loadingComplete(
            'Saving Monthly Report Review Note'
          )
      });
  }

  applyPaymentAmount(paymentAmount: number) {
    this.paymentForm.patchValue({ paymentAmount });
  }

  back(): void {
    this.location.back();
  }

  changePartTimeAdjustment() {
    const baseRate = this.workerForm.get('enhancementApprovedFlag')?.value
      ? 400
      : 350;
    this.baseRate$.next(baseRate);
  }

  closeApplication() {
    this.confirmationService.confirm(
      `Are you sure you want to close this application?`,
      () => {
        this.route.params
          .pipe(
            take(1),
            mergeMap((params) => {
              const body: PutWorkerApplication = { status: 'C' };
              this.notificationService.loading('Closing Application');
              return this.workerApiService.putWorkerApplication(
                params['id'],
                body
              );
            })
          )
          .subscribe({
            next: () => {
              this.notificationService.success('Application Closed');
              this.router.navigate([`/admin/applications`]);
            },
            error: (error) => {
              this.notificationService.loadingComplete('Closing Application');
              console.error('ERROR: ', error);
            },
            complete: () =>
              this.notificationService.loadingComplete('Closing Application')
          });
      }
    );
  }

  getCheckboxValue(value: string | undefined): boolean {
    return this.stringExtensions.toBooleanFromYesNoString(value!);
  }

  getSortedEnrollments(
    enrollments: ApplicationEnrollmentEntity[] | undefined
  ): ApplicationEnrollmentEntity[] {
    return enrollments!.sort(
      (a, b) =>
        a.compositeApplicationEnrollment.ccsgAgeGroup.id -
        b.compositeApplicationEnrollment.ccsgAgeGroup.id
    );
  }

  assignApplication() {
    this.confirmationService.confirm(
      `Are you sure you want to assign this application
      to yourself?`,
      () => {
        const workerApp: PutWorkerApplication = new PutWorkerApplication();
        workerApp.checkoutFlag = true;
        this.workerApiService
          .putWorkerApplication(this.currentApplicationId, workerApp)
          .pipe(take(1))
          .subscribe();
      }
    );
  }

  unAssignApplication() {
    this.confirmationService.confirm(
      `Are you sure you want to send this application
      back to the queue?  This means the application will no longer be assigned to you
      and can be re-assigned`,
      () => {
        const workerApp: PutWorkerApplication = new PutWorkerApplication();
        workerApp.checkinFlag = true;
        this.workerApiService
          .putWorkerApplication(this.currentApplicationId, workerApp)
          .pipe(take(1))
          .subscribe();
      }
    );
  }

  approveApplication() {
    this.confirmationService.confirm(
      `Are you sure you want to approve this application?`,
      () => {
        this.route.params
          .pipe(
            take(1),
            mergeMap((params) => {
              const body = this.putWorkerApplicationBody(true);
              this.notificationService.loading('Approving Application');
              return this.workerApiService.putWorkerApplication(
                params['id'],
                body
              );
            })
          )
          .subscribe({
            next: () => {
              this.notificationService.success('Application Approved');
              this.router.navigate([`/admin/applications`]);
            },
            error: (error) => {
              this.notificationService.loadingComplete('Approving Application');
              console.error('ERROR: ', error);
            },
            complete: () =>
              this.notificationService.loadingComplete('Approving Application')
          });
      }
    );
  }

  deleteFile(documentId: string): void {
    this.deleting$ = this.route.params.pipe(
      mergeMap((params) => {
        return this.workerApiService
          .deleteDocument(params['id'], documentId)
          .pipe(
            catchError((err: HttpErrorResponse) => {
              this.notificationService.error(err.error.message);
              return of({ loading: false });
            }),
            share()
          );
      }),
      map((res) => ({ loading: !res }))
    );
  }

  denyApplication() {
    this.ref = this.dialogService.open(DenyDialogComponent, {
      header: 'Are you sure you want to deny this application?',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto' },
      baseZIndex: 10000
    });

    this.ref.onClose
      .pipe(
        take(1),
        mergeMap((note: string) => {
          this.notificationService.loading('Denying Application');
          const body = this.putWorkerApplicationBody(false);
          return this.route.params.pipe(
            take(1),
            mergeMap((params) => {
              const applicationId = params['id'];
              return forkJoin([
                this.workerApiService.postWorkerNote(applicationId, note),
                this.workerApiService.putWorkerApplication(applicationId, body)
              ]);
            })
          );
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Application Denied');
          this.router.navigate([`/admin/applications`]);
        },
        error: (error) => {
          this.notificationService.loadingComplete('Denying Application');
          console.error('ERROR: ', error);
        },
        complete: () =>
          this.notificationService.loadingComplete('Denying Application')
      });
  }

  downloadFile(file: ApplicationFileEntity) {
    this.workerApiService
      .getApplicationFile(this.currentApplicationId, file.documentNumber)
      .pipe(take(1))
      .subscribe((doc) => {
        if (doc) {
          const data: Blob = new Blob([doc]);
          const filename = `ccsg-${this.currentApplicationId}-${file.fileType.fileType}-doc-${file.documentNumber}`;
          const fileExtension = file.fileName?.substring(
            file.fileName.lastIndexOf('.') + 1
          );
          saveAs(data, `${filename}.${fileExtension}`);
        } else {
          console.error('error downloading file');
          return;
        }
      });
  }
}
