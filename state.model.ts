import { User as CurrentUser } from 'oidc-client';

export class State {
  isLoading = false;

  currentUser!: CurrentUser | null;
}
