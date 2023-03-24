import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, share, take } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { DenyDialogComponent } from '../deny-dialog/deny-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

import {
  AdminApplicationView,
  ApplicationEnrollmentEntity,
  ApplicationFileEntity,
  PutWorkerApplication,
} from '@app/core';

import {
  NotificationService,
  ConfirmationService,
  WorkerApiService,
} from '@app/shared';

@Component({
  selector: 'app-worker-application',
  templateUrl: './worker-application.component.html',
  styleUrls: ['./worker-application.component.scss'],
})
export class WorkerApplicationComponent implements OnInit {
  // ...previous properties

  constructor(
    // ...previous constructor arguments
  ) {
    // ...previous constructor body
  }

  ngOnInit(): void {
    this.initializeForms();
    this.fetchApplicationDetails();
  }

  private initializeForms(): void {
    // ...initializeForms method body
  }

  private fetchApplicationDetails(): void {
    // ...fetchApplicationDetails method body
  }

  private putWorkerApplicationBody(approve: boolean): PutWorkerApplication {
    // ...putWorkerApplicationBody method body
  }

  private setupTemplateFlags(
    sub: string,
    applicationDetails: AdminApplicationView
  ): void {
    // ...setupTemplateFlags method body
  }

  addNote(): void {
    // ...addNote method body
  }

  addReportReviewNote(month: number, year: number): void {
    // ...addReportReviewNote method body
  }

  applyPaymentAmount(paymentAmount: number) {
    // ...applyPaymentAmount method body
  }

  back(): void {
    // ...back method body
  }

  changePartTimeAdjustment() {
    // ...changePartTimeAdjustment method body
  }

  closeApplication() {
    this.confirmationService.confirmAndExecute(
      'Are you sure you want to close this application?',
      () => {
        const body: PutWorkerApplication = { status: 'C' };
        return this.updateWorkerApplicationAndNavigate(body);
      }
    );
  }

  getCheckboxValue(value: string | undefined): boolean {
    // ...getCheckboxValue method body
  }

  getSortedEnrollments(
    enrollments: ApplicationEnrollmentEntity[] | undefined
  ): ApplicationEnrollmentEntity[] {
    // ...getSortedEnrollments method body
  }

  assignApplication() {
    this.confirmationService.confirmAndExecute(
      'Are you sure you want to assign this application to yourself?',
      () => {
        const body: PutWorkerApplication = { checkoutFlag: true };
        return this.updateWorkerApplication(body);
      }
    );
  }

  unAssignApplication() {
    this.confirmationService.confirmAndExecute(
      'Are you sure you want to send this application back to the queue? This means the application will no longer be assigned to you and can be re-assigned',
      () => {
        const body: PutWorkerApplication = { checkinFlag: true };
        return this.updateWorkerApplication(body);
      }
    );
}

approveApplication() {
this.confirmationService.confirmAndExecute(
'Are you sure you want to approve this application?',
() => {
const body = this.putWorkerApplicationBody(true);
return this.updateWorkerApplicationAndNavigate(body);
}
);
}

deleteFile(documentId: string): void {
// ...deleteFile method body
}

denyApplication() {
this.ref = this.dialogService.open(DenyDialogComponent, {
header: 'Are you sure you want to deny this application?',
width: '70%',
contentStyle: { 'max-height': '500px', overflow: 'auto' },
baseZIndex: 10000,
});
this.ref.onClose
  .pipe(
    take(1),
    mergeMap((note: string) => {
      const body = this.putWorkerApplicationBody(false);
      return this.route.params.pipe(
        take(1),
        mergeMap((params) => {
          const applicationId = params['id'];
          return forkJoin([
            this.workerApiService.postWorkerNote(applicationId, note),
            this.workerApiService.putWorkerApplication(applicationId, body),
          ]);
        })
      );
    })
  )
  .subscribe(this.handleApiResponse('/admin/applications', 'Denying Application'));

}

downloadFile(file: ApplicationFileEntity) {
// ...downloadFile method body
}

private updateWorkerApplication(body: PutWorkerApplication) {
return this.route.params.pipe(
take(1),
mergeMap((params) => {
return this.workerApiService.putWorkerApplication(params['id'], body);
})
);
}

private updateWorkerApplicationAndNavigate(body: PutWorkerApplication) {
return this.updateWorkerApplication(body).pipe(
take(1),
mergeMap(() => this.router.navigate(['/admin/applications']))
);
}

private handleApiResponse(redirectUrl: string, actionName: string) {
return {
next: () => {
this.notificationService.success(${actionName} Successful);
this.router.navigate([redirectUrl]);
},
error: (error: any) => {
this.notificationService.loadingComplete(actionName);
console.error('ERROR: ', error);
},
complete: () => this.notificationService.loadingComplete(actionName),
};
}
}