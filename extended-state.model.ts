// extended-state.model.ts
import { State } from './state.model';

export class ExtendedState extends State {
  additionalValue: number;

  constructor() {
    super();
    this.additionalValue = 0; // Initialize the additionalValue property with a default value
  }
}