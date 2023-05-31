import { CommonModule } from '@angular/common';
import { MODAL_DATA } from '@webteam-shared-client/shared/ui-shared';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ViewPeComponentWithName,
  ViewPeExamsPending,
} from '@webteam-shared-client/uip-admin-app/api-uip-admin';

import { take, tap } from 'rxjs';

import { ExamsFacade } from '../exams.facade';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './performance-edit-video.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceEditVideoComponent {
  @Output() modalEvent = new EventEmitter();

  form = this.fb.group({
    videos: this.fb.array([] as FormControl[]),
  });

  data$;

  foo: ViewPeComponentWithName[] = [];

  constructor(
    @Inject(MODAL_DATA) public data: ViewPeExamsPending,
    public examsFacade: ExamsFacade,
    public fb: FormBuilder,
  ) {
    if (data.peId) {
      this.data$ = this.examsFacade.getComponentsForPerformanceExamId(data.peId).pipe(
        tap((res) => {
          this.foo = res;
          const controls = res.map((c) => this.fb.control(c.videoUrl));
          this.form.setControl('videos', this.fb.array(controls));
        }),
      );
    }
  }

  get videos(): FormArray {
    return this.form.get('videos') as FormArray;
  }

  close(): void {
    this.modalEvent.emit('close');
  }

  onSubmit(): void {
    if (this.form.value.videos) {
      const videos = this.form.value.videos.map((v, i) => ({
        ...this.foo[i],
        videoUrl: v,
      }));
      this.examsFacade
        .savePeComponents(videos)
        .pipe(take(1))
        .subscribe((res) => {
          if (res) {
            this.close();
          } else {
            // TODO: Add error handling
            console.log('error');
          }
        });
    }
  }
}
