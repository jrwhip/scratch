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
  #store$: BehaviorSubject<State>;

  #storeUpdates$: Subject<Partial<State>>;

  store$: Observable<State>;

  // isLoading$: Observable<boolean>;

  // currentUser$: Observable<CurrentUser | null>;

  get isLoading$(): Observable<State['isLoading']> {
    return this.store$.pipe(distinctUntilKeyChanged('isLoading'));
  }

  get currentUser$(): Observable<boolean> {
    return this.store$.pipe(distinctUntilKeyChanged('currentUser'));
  }

    get isLoading$(): Observable<boolean> {
    return this.store$.pipe(map((state) => state.isLoading), distinctUntilChanged());
  }

  get rolesList$(): Observable<{ [key: number]: string }> {
    return this.store$.pipe(map((state) => state.rolesList), distinctUntilChanged());
  }

  get authUser$(): Observable<AuthUser> {
    return this.store$.pipe(map((state) => state.authUser), distinctUntilChanged());
  }

  get currentUser$(): Observable<CurrentUser | null> {
    return this.store$.pipe(map((state) => state.currentUser), distinctUntilChanged());
  }

  get user$(): Observable<Users> {
    return this.store$.pipe(map((state) => state.user), distinctUntilChanged());
  }

  get vmViewMtpRoleAccess$(): Observable<VmViewMtpRoleAccess> {
    return this.store$.pipe(map((state) => state.vmViewMtpRoleAccess), distinctUntilChanged());
  }

  constructor() {
    this.#store$ = new BehaviorSubject(initialState);
    this.store$ = this.#store$.asObservable();
    this.#storeUpdates$ = new Subject();

    // this.isLoading$ = this.#store$.pipe(
    //   map((store) => store.isLoading),
    //   distinctUntilChanged(),
    // );

    // this.currentUser$ = this.#store$.pipe(
    //   map((store) => store.currentUser),
    //   distinctUntilChanged(),
    // );

    this.#storeUpdates$
      .pipe(scan((acc, curr) => ({ ...acc, ...curr }), initialState))
      .subscribe(this.#store$);
  }

  updateStore(storeUpdate: Partial<State>): void {
    this.#storeUpdates$.next(storeUpdate);
  }

  queryStoreSingleKey(keyString: keyof State): Observable<State[keyof State]> {
    return this.#store$.pipe(
      distinctUntilKeyChanged(keyString),
      map((key) => key?.[keyString]),
    );
  }

  queryStoreMultiKeys(keyArr: (keyof State)[]): Observable<Partial<State>> {
    return this.#store$.pipe(
      distinctUntilChanged((prev, curr) => !keyArr.some((key) => prev[key] !== curr[key])),
      map((val) => {
        const newKey = [...keyArr];
        return newKey.reduce((acc, key: keyof State) => ({ ...acc, [key]: val[key] }), {});
      }),
    );
  }
}
