      const navigateFunction = (params: ICellRendererParams) => {
        console.log('Foo: ', params);
        // this.router.navigate([button.route], { queryParams: params });
        this.router.navigate([button.route], { state: { data: params } });
      };