import { User as CurrentUser } from 'oidc-client';

export class State {
  // Initialize isLoading with a default value of false
  isLoading = false;

  // Initialize currentUser with a default value of null
  currentUser: CurrentUser | null = null;
}
