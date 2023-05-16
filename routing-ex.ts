import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ButtonNavComponent } from '@webteam-shared-client/shared/ui-shared';

import { ExamsComponent } from './exams/exams.component';
import { PerformanceComponent } from './performance.component';

import {
  AllPerformanceExamsResolver,
  PendingPerformanceExamsResolver,
} from './performance.resolvers';

const routes: Routes = [
  { path: '', component: PerformanceComponent },
  {
    path: 'exams',
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      {
        path: 'all',
        component: ExamsComponent,
        resolve: { gridData: AllPerformanceExamsResolver },
      },
      {
        path: 'pending',
        component: ExamsComponent,
        resolve: { gridData: PendingPerformanceExamsResolver },
      },
      {
        path: 'rating-assignments',
        component: ExamsComponent,
        resolve: { gridData: AllPerformanceExamsResolver },
      },
      {
        path: 'ratings-in-progress',
        component: ExamsComponent,
        resolve: { gridData: AllPerformanceExamsResolver },
      },
      {
        path: 'completed',
        component: ExamsComponent,
        resolve: { gridData: AllPerformanceExamsResolver },
      },
    ],
  },
];

@NgModule({
  imports: [ButtonNavComponent, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceRoutingModule {}