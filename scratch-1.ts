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

// hey

paymentPercentage$ = this.paymentForm
.get('paymentPercentage')!
.valueChanges.pipe(
    startWith(this.paymentForm.get('paymentPercentage')!.value ?? 0)
);

HEY FUCKER!

this.payments$ = combineLatest([
    this.baseRate$,
    this.totalChildren$,
    this.paymentPercentage$
]).pipe(
    map(([baseRate, totalChildren, paymentPercentage]) => {
    const subTotal = baseRate * totalChildren;
    const partTimeEligiblePayment = this.calculatePercentage(subTotal, 50);
    const paymentPercentageNum = () => {
        console.log(paymentPercentage);
        const num = parseInt(paymentPercentage, 10) || 0;
        console.log(num);
        if (num < 0) {
        this.paymentForm.get('paymentPercentage')?.setValue(0);
        return 0;
        } else if (num > 100) {
        this.paymentForm.get('paymentPercentage')?.setValue(100);
        return 100;
        } else {
        return num;
        }
    };
    const percentagePayment = this.calculatePercentage(
        subTotal,
        paymentPercentageNum()
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