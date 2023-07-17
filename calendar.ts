/* eslint-disable class-methods-use-this */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';

import { CompactDateStringUtils } from '@webteam-shared-client/shared/ui-utilities';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';

import { BehaviorSubject, map, take } from 'rxjs';

import { ExamScheduleControllerService } from '@webteam-shared-client/uip-admin-app/api-uip-admin';

import { DynamicModalService, SimpleDialogService } from '@webteam-shared-client/shared/ui-shared';

import { MockExamScheduleControllerService } from './mock-calenar.service';

import { ActionComponent } from './action/action.component';

interface Foo {
  examSchedulePublished: boolean;
  events: EventInput[] | [];
}

@Component({
  selector: 'webteam-shared-client-calendar-plus',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  @ViewChild('calendar')
  calendarComponent!: FullCalendarComponent;

  private calendarApi!: Calendar;

  eventsBs$: BehaviorSubject<Foo> = new BehaviorSubject({
    examSchedulePublished: false,
    events: [],
  } as Foo);

  events$ = this.eventsBs$.asObservable();

  constructor(
    private dynamicModalService: DynamicModalService,
    private mockExamScheduleControllerService: MockExamScheduleControllerService,
    private examScheduleControllerService: ExamScheduleControllerService,
    private simpleDialogService: SimpleDialogService,
  ) {}

  private testTypeToDescription(testType: string) {
    switch (testType) {
      case 'K':
        return 'Knowledge';
      case 'P':
        return 'Performance';
      default:
        return 'Unknown test type';
    }
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    eventClassNames: ['event-with-border'],
    selectable: true,
    selectAllow: (selectInfo) => selectInfo.start >= new Date(),
    select: this.handleDateClick.bind(this),
    // dateClick: this.handleDateClick.bind(this), // MUST ensure `this` context is maintained
    eventClick: this.handelEventClick.bind(this),
    eventContent: (arg) => {
      const { event } = arg;
      const time = event.start
        ? event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : '';
      const { title } = event;
      const { email, peTypeName, user } = event.extendedProps;
      return {
        html: `
        <div>
          <div class="fc-event-time">${time}</div>
          <div class="fc-event-title">${title}</div>
          <div class="fc-event-user">
            <div>${user}</div>
            <div>${email}</div>
            <div>${peTypeName}</div>
          </div>
        </div>
      `,
      };
    },
    datesSet: (dateInfo) => {
      const compactDateString = CompactDateStringUtils.formatDateAsCompactString(
        dateInfo.view.currentStart,
        false,
      );
      this.mockExamScheduleControllerService
        .getScheduleByMonth(compactDateString)
        .pipe(
          take(1),
          map(({ examSchedulePublished, slots }) => {
            const events =
              slots?.map((slot) => {
                // Transform slot into an EventInput object
                console.log('leave me alone');
                let className = slot.testType ?? '';
                if (slot.interpreterId) {
                  className += ' reserved unavailable';
                } else {
                  className += ' available';
                }
                if (slot.held) {
                  className += ' selected';
                }
                return {
                  title: this.testTypeToDescription(slot.testType ?? ''),
                  start: new Date(slot.startTime ?? 0).toISOString(),
                  end: new Date(slot.endTime ?? 0).toISOString(),
                  user: slot.interpreterName ?? '',
                  email: slot.email ?? '',
                  peTypeName: slot.peTypeName ?? '',
                  className,
                  // Add other properties as needed
                };
              }) ?? [];
            const exampleObj = {
              examSchedulePublished: examSchedulePublished ?? false,
              events,
            };
            return exampleObj;
          }),
        )
        .subscribe({
          next: (res) => this.eventsBs$.next(res),
          error: (e) => console.error(e),
        });
    },
  };

  onPublishedChange(checkbox: HTMLInputElement) {
    // eslint-disable-next-line no-param-reassign
    checkbox.checked = false;
    this.calendarApi = this.calendarComponent.getApi();
    const currentDate = this.calendarApi.view.currentStart;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    this.simpleDialogService.okCancel({
      title: 'Confirm Publish Calendar',
      message: `Are you sure you want to Publish this month?, ${formattedDate}`,
      okCallback: () => {
        const compactDateString = CompactDateStringUtils.formatDateAsCompactString(
          currentDate,
          false,
        );
        this.examScheduleControllerService
          .publishMonth(compactDateString)
          .pipe(take(1))
          .subscribe({
            next: (res) => console.log(res),
            error: (e) => console.error(e),
          });
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  handleDateClick(arg: any) {
    console.log(arg);
    alert(`date click! ${arg.dateStr}`);
  }

  handelEventClick({ event }: EventClickArg) {
    console.log(event);
    if (event.start && event.start < new Date()) {
      // event is in the past, do nothing
      return;
    }
    this.dynamicModalService.open(ActionComponent, event);
  }
}
