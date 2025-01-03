import {
  GestureDetail,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonMenuButton,
  IonPage,
  IonToolbar,
  useIonPopover,
  createGesture,
} from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ProjectType } from '../../types';
import { chevronBackOutline, chevronForwardOutline, ellipsisVerticalOutline } from 'ionicons/icons';

import './TaskView.css';
import { Context } from '../../dataManagement/ContextProvider';
import TaskItem from '../../components/TaskItem';
import { taskDue, taskOverdue } from '../../dataManagement/utils';
import { localeToString } from '../../dataManagement/utils';

const CalendarView: React.FC = () => {
  let { projectId } = useParams() as { projectId: string };
  const { loading, getProject, setProject, getTask, tasks, locale } = useContext(Context);

  const [retrievedProject, setRetrievedProject] = useState<ProjectType>();

  const [dateRowOffset, setDateRowOffset] = useState<number>(0);
  const [dateColOffset, setDateColOffset] = useState<number>(new Date().getDay());
  const [taskIdsForDate, setTaskIdsForDate] = useState<string[]>([]);

  const [sliderSlidingDirection, setSliderSlidingDirection] = useState<'back' | 'forward' | ''>('');
  const [listSlidingDirection, setListSlidingDirection] = useState<'back' | 'forward' | ''>('');

  // retrieve project when id changes
  useEffect(() => {
    if (!loading) {
      // init project
      if (projectId === 'undefined') return;
      const retrievedProject = getProject(projectId);
      if (retrievedProject) setRetrievedProject(retrievedProject);
      else console.error(`ProjectId: ${projectId} not found`);

      // init taskIdsForDate
      findTasksForThisDate(retrievedProject);

      // setup swipe gesture to change dates
      const changeDateColSwiperTarget = document.querySelector('.calendar-content');
      if (changeDateColSwiperTarget) {
        const changeDateColSwiperGesture = createGesture({
          el: changeDateColSwiperTarget,
          onMove: function onContentSwipeMove(detail: GestureDetail) {
            if (detail.deltaX < -100) setListSlidingDirection('back');
            if (detail.deltaX > 100) setListSlidingDirection('forward');
          },
          onEnd: function onContentSwipeEnd(detail: GestureDetail) {
            if (detail.deltaX < -100) {
              setDateColOffset((prev) => {
                let newColOffset = prev + 1;
                if (newColOffset > 6) {
                  newColOffset -= 7;
                  setDateRowOffset((prev) => prev + 1);
                }
                return newColOffset;
              });
            }
            if (detail.deltaX > 100) {
              setDateColOffset((prev) => {
                let newColOffset = prev - 1;
                if (newColOffset < 0) {
                  newColOffset += 7;
                  setDateRowOffset((prev) => prev - 1);
                }
                return newColOffset;
              });
            }
            setListSlidingDirection('');
          },
          gestureName: 'changeDateColSwiperGesture',
        });
        changeDateColSwiperGesture.enable();
      }
      const changeDateRowSwiperTarget = document.querySelector('.calendar-view-date-slider');
      if (changeDateRowSwiperTarget) {
        const changeDateRowSwiperGesture = createGesture({
          el: changeDateRowSwiperTarget,
          onMove: function onSliderSwipeMove(detail: GestureDetail) {
            if (detail.deltaX < -100) setSliderSlidingDirection('back');
            if (detail.deltaX > 100) setSliderSlidingDirection('forward');
          },
          onEnd: function onSliderSwipeEnd(detail: GestureDetail) {
            if (detail.deltaX < -100) setDateRowOffset((prev) => prev + 1);
            if (detail.deltaX > 100) setDateRowOffset((prev) => prev - 1);
            setSliderSlidingDirection('');
          },
          gestureName: 'changeDateRowSwiperGesture',
        });
        changeDateRowSwiperGesture.enable();
      }
    }
  }, [loading, projectId, tasks, dateRowOffset, dateColOffset]);

  /**
   * Finds and sets task IDs that are due on a specific date for a given project.
   *
   * This function calculates the date based on the current day of the week and
   * the specified row and column offsets. It then iterates over the task IDs
   * in the provided project, checks if each task is due on the calculated date
   * using the taskDue utility function, and updates the state with the IDs of
   * the tasks that are due.
   *
   * @param {ProjectType} retrievedProject - The project to find tasks for.
   */
  function findTasksForThisDate(retrievedProject: ProjectType) {
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - new Date().getDay() + dateColOffset + dateRowOffset * 7);

    let foundTaskIds: string[] = [];
    retrievedProject.taskIds.forEach((taskId: string) => {
      const task = getTask(taskId);
      if (!task) return;
      if (new Date(task.createdDate) > new Date(checkDate)) return;

      if (taskDue(task, checkDate)) foundTaskIds.push(taskId);
    });
    setTaskIdsForDate(foundTaskIds);
  }

  /**
   * Popover for options specific to the calendar view
   * @returns {JSX.Element}
   */
  function calendarOptionsPopover(): JSX.Element {
    return (
      <IonContent class="ion-padding">
        <IonButtons>
          <IonButton
            onClick={() => {
              document.getElementById('open-edit-project-modal')?.click();
              dismissCalendarPopover();
            }}
          >
            {localeToString('edit', locale) as string}
          </IonButton>
          <IonButton
            onClick={() => {
              let newProject = { ...retrievedProject } as ProjectType;
              newProject.viewSettings.calendarSettings.settings.showDone =
                !newProject.viewSettings.calendarSettings.settings.showDone;
              setRetrievedProject(newProject);
              setProject(newProject);
              dismissCalendarPopover();
            }}
          >
            {
              localeToString(
                !retrievedProject?.viewSettings.calendarSettings.settings.showDone ? 'hide' : 'show',
                locale,
              ) as string
            }{' '}
            {localeToString('done', locale) as string}
          </IonButton>
          <IonButton
            onClick={() => {
              let newProject = { ...retrievedProject } as ProjectType;
              newProject.viewSettings.calendarSettings.settings.showDetails =
                !newProject.viewSettings.calendarSettings.settings.showDetails;
              setRetrievedProject(newProject);
              setProject(newProject);
              dismissCalendarPopover();
            }}
          >
            {
              localeToString(
                !retrievedProject?.viewSettings.calendarSettings.settings.showDetails ? 'hide' : 'show',
                locale,
              ) as string
            }{' '}
            {localeToString('details', locale) as string}
          </IonButton>
          {/* add option for hiding singular tasks */}
        </IonButtons>
      </IonContent>
    );
  }
  const [presentCalendarPopover, dismissCalendarPopover] = useIonPopover(calendarOptionsPopover);

  /**
   * A date slider that displays this week and allows you to navigate to the past or future week
   * @returns {JSX.Element}
   */
  function dateSlider(): JSX.Element {
    let dates = [];
    let date = new Date();
    for (let i = 0; i < 7; i++) {
      date = new Date();
      date.setDate(date.getDate() + i - new Date().getDay() + dateRowOffset * 7);
      dates.push(date.toISOString().split('T')[0] + ' ' + date.getDay());
    }
    date = new Date();
    date.setDate(new Date().getDate() - new Date().getDay() + dateColOffset + dateRowOffset * 7);
    return (
      <div>
        <div
          style={{
            borderBottom: `${retrievedProject?.color} 5px solid`,
          }}
          className="date-slider-label"
        >
          {/* year and month */}
          {date.getFullYear()} {(localeToString('monthsOfYearAbbr', locale) as string[])[date.getMonth()]}.
        </div>
        <div
          className={`${sliderSlidingDirection === 'forward' ? 'slider-forward ' : ''}
          ${sliderSlidingDirection === 'back' ? 'slider-back ' : ''}
          calendar-view-date-slider`}
        >
          <button
            onClick={() => {
              setTaskIdsForDate([]);
              setDateRowOffset((prev) => prev - 1);
            }}
          >
            <IonIcon icon={chevronBackOutline} />
          </button>
          {/* this weeks dates */}
          {dates.map((date, index) => (
            <button
              onClick={() => {
                setTaskIdsForDate([]);
                setDateColOffset(index);
              }}
              style={{
                borderColor: dateColOffset === index ? retrievedProject?.color : '#00000000',
                borderWidth: '2px',
                borderStyle: 'solid',
              }}
              key={date}
            >
              <div>{(localeToString('dayOfWeekInitials', locale) as string[])[index]}</div>
              <div>{date.substring(8, 10).replace(/^0+/, '')}</div>
            </button>
          ))}
          <button
            onClick={() => {
              setTaskIdsForDate([]);
              setDateRowOffset((prev) => prev + 1);
            }}
          >
            <IonIcon icon={chevronForwardOutline} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* menu button */}
          <IonButtons slot="start" collapse={true}>
            <IonMenuButton />
          </IonButtons>
          {/* calendar slider */}
          <div>{dateSlider()}</div>
          {/* options button */}
          <IonButtons slot="end" collapse={true}>
            <IonButton onClick={(e: any) => presentCalendarPopover({ event: e })}>
              <IonIcon icon={ellipsisVerticalOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding calendar-content">
        <IonList
          className={`${listSlidingDirection === 'forward' ? 'list-forward ' : ''}
          ${listSlidingDirection === 'back' ? 'list-back ' : ''}
          calendar-view-date-list`}
        >
          {taskIdsForDate.map((taskId: string, index: number) => {
            if (
              retrievedProject?.viewSettings.calendarSettings.settings.showDone ||
              (!retrievedProject?.viewSettings.calendarSettings.settings.showDone &&
                taskOverdue(getTask(taskId), new Date()))
            )
              return (
                <IonItem key={index}>
                  <TaskItem
                    offsetDays={dateRowOffset * 7 - new Date().getDay() + dateColOffset}
                    taskId={taskId}
                    key={index}
                    showDetails={retrievedProject?.viewSettings.calendarSettings.settings.showDetails}
                  />
                </IonItem>
              );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default CalendarView;
