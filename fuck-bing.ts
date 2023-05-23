<div class="container">
  <div class="card p-4 mt-3">
    <div class="d-flex flex-column align-items-center">
      <h1 class="text-center py-4">Performance Exam Edit Versions</h1>
      <h4 class="text-muted">
        NOTE: This will only show versions of performance exams associated to rating forms. Thus,
        some version history may be missing.
      </h4>
    </div>
    <ng-container *ngIf="vm$ | async as vm; else loading">
      <div class="d-flex flex-column align-items-start">
        <h4>
          {{ vm.interpreterName }} — {{ vm.examType }} — Active Attempt: {{ vm.attempt }}
        </h4>
      </div>
      <div class="d-flex flex-row align-items-baseline">
        <p class="me-3">Attempt: {{ vm.attempt }}</p>
        <p class="me-3">Exam Date: {{ vm.scheduledDate | date }}</p>
        <div class="d-flex flex-row align-items-center">
          <p class="me-2 mb-0">Version:</p>
          <select class="form-select" [(ngModel)]="selectedOption">
            <option *ngFor="let option of foo$ | async" [ngValue]="option">
              {{ option.performanceExamVersion }}
            </option>
          </select>
        </div>
      </div>
      <div class="d-flex mt-3 justify-content-between align-items-center">
        <!-- Add a saving spinner here -->
        <ng-container *ngIf="saving$ | async as saving; else notSaving">
          <div
            class="spinner-border text-primary me-2"
            role="status"
            style="width: 38px; height: 38px"
          >
            <span class="visually-hidden">Saving…</span>
          </div>
        </ng-container>
        <ng-template #notSaving>
          <span class="text-muted">Not Saving...</span>
        </ng-template>
        <!-- Use disabled attribute to disable the save button -->
        <button
          type="button"
          (click)="savePerformanceExamsWithSchedule()"
          class="btn btn-primary me-2"
          [disabled]="saving$ | async"
        >
          Save
        </button>
        <!-- End of saving spinner -->
        <a routerLink="/dashboard/performance/exams/pending" class="btn btn-secondary">Cancel</a>
      </div>
    </ng-container>
    <ng-template #loading>
      <div class="d-flex justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading…</span>
        </div>
      </div>
    </ng-template>
  </div>
</div>
