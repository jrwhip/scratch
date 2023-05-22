  {
    headerName: '',
    field: '',
    cellRenderer: CellRendererButtonsComponent,
    cellRendererParams: {
      buttons: [
        {
          label: 'Update Version',
          icon: faFont,
          route: '/dashboard/performance/exams/pending/edit-versions',
          routeParam: (data: { id: any }) => ({ id: data.id }),
          conditionField: 'scheduledDate',
          conditionCheckNotNull: true,
        },
        {
          label: 'No Show',
          functionName: 'testMethod',
          icon: faTimes,
          conditionField: 'scheduledDate',
          conditionCheckNotNull: true,
        },
        {
          label: 'Video URLs',
          functionName: 'testMethod',
          icon: faVideo,
          conditionField: 'scheduledDate',
          conditionCheckNotNull: true,
        },
      ],
    },
    flex: 3,
  },
];