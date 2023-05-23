<div class="container d-flex justify-content-center">
  <div class="card p-4 mt-3 shadow-sm" style="max-width: 800px;">
    <h1 class="text-center py-4 fw-bold">Performance Exam Edit Versions</h1>
    <p class="text-muted text-center fw-light mb-4">
      NOTE: This will only show versions of performance exams associated to rating forms. Thus, some version history may be missing.
    </p>

    <ng-container *ngIf="vm$ | async as vm; else loading">
      <h4 class="mt-4 mb-3 fw-bold">
        {{ vm.interpreterName }} — {{ vm.examType }} — Active Attempt: {{ vm.attempt }}
      </h4>

      <div class="d-flex flex-row mb-4 justify-content-between">
        <div>
          <p class="me-3">Attempt: {{ vm.attempt }}</p>
          <p class="me-3">Exam Date: {{ vm.scheduledDate | date }}</p>
        </div>
        <div class="d-flex align-items-center">
          <label for="version" class="me-2 mb-0">Version:</label>
          <select id="version" class="form-select" [(ngModel)]="selectedOption">
            <option *ngFor="let option of foo$ | async" [ngValue]="option">
              {{ option.performanceExamVersion }}
            </option>
          </select>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div [style.visibility]="vm.saving ? 'visible' : 'hidden'" class="d-flex align-items-center">
          <div class="spinner-border text-primary" role="status" style="width: 38px; height: 38px"></div>
          <span class="ms-2">Saving…</span>
        </div>
        <div>
          <button type="button" (click)="savePerformanceExamsWithSchedule()" class="btn btn-primary btn-lg" [disabled]="vm.saving">
            Save
          </button>
          <a routerLink="/dashboard/performance/exams/pending" class="btn btn-secondary btn-lg ms-2">Cancel</a>
        </div>
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
