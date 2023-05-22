constructor(private router: Router) {}

ngOnInit() {
  const navigation = this.router.getCurrentNavigation();
  if (navigation && navigation.extras.state) {
    const state = navigation.extras.state as {data: ICellRendererParams};
    console.log(state.data);
  }
}
