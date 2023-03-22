import { Injectable } from '@angular/core';

import { User as CurrentUser } from 'oidc-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, distinctUntilKeyChanged, map, scan } from 'rxjs/operators';

import { State } from './state.model';

const initialState = new State();

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  // Store the state in a BehaviorSubject, so subscribers can receive the latest state updates.
  protected storeSubject$: BehaviorSubject<State> = new BehaviorSubject<State>(initialState);

  // Exports the entire store as an observable, so subscribers can receive the entire state.
  store$: Observable<State> = this.storeSubject$.asObservable();

  // Subject for updating the store with partial state updates.
  private storeUpdates$: Subject<Partial<State>> = new Subject<Partial<State>>();

  // Observable for the 'isLoading' state property.
  get isLoading$(): Observable<boolean> {
    return this.storeSubject$.pipe(
      distinctUntilKeyChanged('isLoading'),
      map((state) => state?.isLoading),
    );
  }

  // Observable for the 'currentUser' state property.
  get currentUser$(): Observable<CurrentUser | null> {
    return this.storeSubject$.pipe(
      distinctUntilKeyChanged('currentUser'),
      map((state) => state?.currentUser),
    );
  }

  constructor() {
    // Combine partial state updates with the current state to produce a new state.
    this.storeUpdates$
      .pipe(scan((acc, curr) => ({ ...acc, ...curr }), initialState))
      .subscribe(this.storeSubject$);
  }

  // Update the store with a partial state update.
  updateStore(storeUpdate: Partial<State>): void {
    this.storeUpdates$.next(storeUpdate);
  }

  // Query the store for a single key and return an observable of that key's value.
  queryStoreSingleKey(keyString: keyof State): Observable<State[keyof State]> {
    return this.storeSubject$.pipe(
      distinctUntilKeyChanged(keyString),
      map((key) => key?.[keyString]),
    );
  }

  // Query the store for multiple keys and return an observable of an object with the specified keys.
  queryStoreMultiKeys(keyArr: (keyof State)[]): Observable<Partial<State>> {
    return this.storeSubject$.pipe(
      distinctUntilChanged((prev, curr) => !keyArr.some((key) => prev[key] !== curr[key])),
      map((val) => {
        const newKey = [...keyArr];
        return newKey.reduce((acc, key: keyof State) => ({ ...acc, [key]: val[key] }), {});
      }),
    );
  }
}
