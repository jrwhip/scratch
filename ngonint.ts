  ngOnInit() {
    this.gridData$ = this.route.data.pipe(
      map((res) => {
        const { gridData } = res;
        if (gridData?.gridOptions?.columnDefs) {
          gridData.gridOptions.columnDefs = bindMethodToAgGridOnClick(
            this,
            gridData.gridOptions.columnDefs,
          );
        }
        return gridData;
      }),
    );
  }