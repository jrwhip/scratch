import { State } from './state.model';
import { FirstProperties } from './first-properties.interface';
import { SecondProperties } from './second-properties.interface';

export class ExtendedState extends State implements FirstProperties, SecondProperties {
  additionalValue: number;
  firstProperty: string;
  secondProperty: string;

  constructor() {
    super();

    // Define the array of keys for FirstProperties and SecondProperties
    const firstPropertiesKeys = Object.keys(this) as (keyof FirstProperties)[];
    const secondPropertiesKeys = Object.keys(this) as (keyof SecondProperties)[];
    const uniqueKeys = new Set([...firstPropertiesKeys, ...secondPropertiesKeys]);

    // Check if there is a sessionState key in sessionStorage
    const sessionStateString = sessionStorage.getItem('sessionState');
    const sessionState: Partial<ExtendedState> = sessionStateString ? JSON.parse(sessionStateString) : {};

    // Loop through the unique keys of FirstProperties and SecondProperties
    uniqueKeys.forEach((key) => {
      // Check if the key exists in sessionState and initialize the property with the stored value or
