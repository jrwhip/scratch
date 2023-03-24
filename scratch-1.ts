this.payments$ = combineLatest([this.baseRate$, this.totalChildren$]).pipe(
    map(([baseRate, totalChildren]) => {
    const subTotal = baseRate * totalChildren;
    const partTimeEligiblePayment = this.calculatePercentage(subTotal, 50);
    return {
        subTotal,
        baseRate,
        fullTimeEligiblePayment: subTotal,
        partTimeEligiblePayment
    };
    }),
    distinctUntilChanged(),
    shareReplay()
);

this.payments$ = combineLatest([
    this.baseRate$,
    this.totalChildren$,
    this.paymentForm.get('paymentPercentage')?.valueChanges
]).pipe(
    startWith(this.paymentForm.get('paymentPercentage')?.value ?? 0),
    map(([baseRate, totalChildren, paymentPercentage]) => {
    const subTotal = baseRate * totalChildren;
    const partTimeEligiblePayment = this.calculatePercentage(subTotal, 50);
    const percentagePayment = this.calculatePercentage(
        subTotal,
        parseInt(paymentPercentage)
    );
    return {
        subTotal,
        baseRate,
        fullTimeEligiblePayment: subTotal,
        partTimeEligiblePayment,
        percentagePayment
    };
    }),
    distinctUntilChanged(),
    shareReplay()
);