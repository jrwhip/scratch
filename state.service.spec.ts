// state.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';
import { State } from './state.model';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update isLoading$ when patchState is called', (done) => {
    service.patchState({ isLoading: true });

    service.isLoading$.subscribe((isLoading) => {
      expect(isLoading).toBe(true);
      done();
    });
  });

  it('should update currentUser$ when patchState is called', (done) => {
    const currentUser = { name: 'John Doe' } as any;

    service.patchState({ currentUser });

    service.currentUser$.subscribe((user) => {
      expect(user).toEqual(currentUser);
      done();
    });
  });

  it('should update selected key when selectKey is called', (done) => {
    const currentUser = { name: 'John Doe' } as any;
    service.patchState({ currentUser });

    service.selectKey('currentUser').subscribe((user) => {
      expect(user).toEqual(currentUser);
      done();
    });
  });

  it('should update selected keys when selectKeys is called', (done) => {
    const currentUser = { name: 'John Doe' } as any;
    const isLoading = true;
    service.patchState({ currentUser, isLoading });

    service.selectKeys(['currentUser', 'isLoading']).subscribe((partialState) => {
      expect(partialState).toEqual({ currentUser, isLoading });
      done();
    });
  });
});