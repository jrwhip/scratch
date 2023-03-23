import { Injectable } from '@angular/core';

import { User as CurrentUser } from 'oidc-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, distinctUntilKeyChanged, map, scan } from 'rxjs/operators';

import { State } from './state.model';

const initialState = new State();

@Injectable({
  providedIn: 'root',
})
export class StateService {
  // BehaviorSubject holding the application state
  protected stateSubject$: BehaviorSubject<State> = new BehaviorSubject<State>(initialState);

  // Expose the entire state as an observable
  state$: Observable<State> = this.stateSubject$.asObservable();

  // Subject for updating the state with partial state updates
  private partialStateUpdate$: Subject<Partial<State>> = new Subject<Partial<State>>();

  // Getter for the 'isLoading' state property
  get isLoading$(): Observable<boolean> {
    return this.stateSubject$.pipe(
      distinctUntilKeyChanged('isLoading'),
      map((state) => state.isLoading),
    );
  }

  // Getter for the 'currentUser' state property
  get currentUser$(): Observable<CurrentUser | null> {
    return this.stateSubject$.pipe(
      distinctUntilKeyChanged('currentUser'),
      map((state) => state.currentUser),
    );
  }

  constructor() {
    // Combine partial state updates with the current state to produce a new state
    this.partialStateUpdate$
      .pipe(scan((acc, curr) => ({ ...acc, ...curr }), initialState))
      .subscribe(this.stateSubject$);
  }

  // Update the state with a partial state update
  patchState(partialState: Partial<State>): void {
    this.partialStateUpdate$.next(partialState);
  }

  // Select a single key from the state and return an observable of that key's value
  selectKey(keyString: keyof State): Observable<State[keyof State]> {
    return this.stateSubject$.pipe(
      distinctUntilKeyChanged(keyString),
      map((key) => key?.[keyString]),
    );
  }

  // Select multiple keys from the state and return an observable of an object with the specified keys
  selectKeys(keyArr: (keyof State)[]): Observable<Partial<State>> {
    return this.stateSubject$.pipe(
      distinctUntilChanged((prev, curr) => !keyArr.some((key) => prev[key] !== curr[key])),
      map((val) => {
        const selectedKeys = [...keyArr];
        return selectedKeys.reduce((acc, key: keyof State) => ({ ...acc, [key]: val[key] }), {});
      }),
    );
  }
}
