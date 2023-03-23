import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilKeyChanged, map, scan } from 'rxjs/operators';
import { StateService } from './state.service';
import { ExtendedState } from './extended-state.model';

@Injectable({
  providedIn: 'root',
})
export class ExtendedStateService extends StateService {
  // Override the stateSubject$ with an ExtendedState type
  protected stateSubject$: BehaviorSubject<ExtendedState> = new BehaviorSubject<ExtendedState>(
    new ExtendedState()
  );

  // Override the state$ observable to have the ExtendedState type
  state$: Observable<ExtendedState> = this.stateSubject$.asObservable();

  // Getter for the 'additionalValue' state property
  get additionalValue$(): Observable<number> {
    return this.stateSubject$.pipe(
      distinctUntilKeyChanged('additionalValue'),
      map((state) => state.additionalValue),
    );
  }

  constructor() {
    super();
    // Initialize the ExtendedStateService with the updated stateSubject$
    this.partialStateUpdate$
      .pipe(scan((acc, curr) => ({ ...acc, ...curr }), new ExtendedState()))
      .subscribe(this.stateSubject$);
  }
}