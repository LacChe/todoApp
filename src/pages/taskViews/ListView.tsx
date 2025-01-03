import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonPopover,
} from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ProjectType, TaskType } from '../../types';
import { ellipsisVerticalOutline } from 'ionicons/icons';

import './TaskView.css';
import { Context } from '../../dataManagement/ContextProvider';
import TaskItem from '../../components/TaskItem';
import { groupTasks, sortTaskGroups, sortTasks, taskOverdue, localeToString } from '../../dataManagement/utils';

const ListView: React.FC = () => {
  let { projectId } = useParams() as { projectId: string };
  const { loading, getProject, setProject, projects, tasks, getTask, locale } = useContext(Context);

  const [retrievedProject, setRetrievedProject] = useState<ProjectType>();
  const [sortedTasks, setSortedTasks] = useState<{ [key: string]: TaskType[] }>({});

  /**
   * Popover for options specific to the list view
   * @returns {JSX.Element}
   */
  function listOptionsPopover(): JSX.Element {
    return (
      <IonContent class="ion-padding">
        <IonButtons>
          <IonButton
            onClick={() => {
              document.getElementById('open-edit-project-modal')?.click();
              dismissListPopover();
            }}
          >
            {localeToString('edit', locale) as string}
          </IonButton>
          <IonButton
            onClick={() => {
              let newProject = { ...retrievedProject } as ProjectType;
              newProject.viewSettings.listSettings.settings.showDone =
                !newProject.viewSettings.listSettings.settings.showDone;
              setRetrievedProject(newProject);
              setProject(newProject);
              dismissListPopover();
            }}
          >
            {
              localeToString(
                !retrievedProject?.viewSettings.listSettings.settings.showDone ? 'hide' : 'show',
                locale,
              ) as string
            }{' '}
            {localeToString('done', locale) as string}
          </IonButton>
          <IonButton
            onClick={() => {
              let newProject = { ...retrievedProject } as ProjectType;
              newProject.viewSettings.listSettings.settings.showDetails =
                !newProject.viewSettings.listSettings.settings.showDetails;
              setRetrievedProject(newProject);
              setProject(newProject);
              dismissListPopover();
            }}
          >
            {
              localeToString(
                !retrievedProject?.viewSettings.listSettings.settings.showDetails ? 'hide' : 'show',
                locale,
              ) as string
            }{' '}
            {localeToString('details', locale) as string}
          </IonButton>
          <IonButton
            onClick={() => {
              document.getElementById('open-sort-options-modal')?.click();
              dismissListPopover();
            }}
          >
            {localeToString('sort', locale) as string}
          </IonButton>
        </IonButtons>
      </IonContent>
    );
  }
  const [presentListPopover, dismissListPopover] = useIonPopover(listOptionsPopover);

  // sort tasks
  useEffect(() => {
    if (!retrievedProject?.viewSettings.listSettings.settings) return;
    const settings = retrievedProject?.viewSettings.listSettings.settings;

    let taskArray = retrievedProject.taskIds.map((taskId) => getTask(taskId));

    // remove done if hidden
    taskArray = taskArray.filter(
      (task) =>
        retrievedProject?.viewSettings.listSettings.settings.showDone ||
        (!retrievedProject?.viewSettings.listSettings.settings.showDone && taskOverdue(getTask(task.id), new Date())),
    );

    if (!settings.sort) setSortedTasks({ default: taskArray });
    else if (!settings.group || (settings.group as string) === '') {
      setSortedTasks({ default: sortTasks(taskArray, settings.sort, settings.sortDesc) });
    } else {
      setSortedTasks(sortTaskGroups(groupTasks(taskArray, settings.group, projects), settings.sort, settings.sortDesc));
    }
  }, [tasks, projects, retrievedProject]);

  // retrieve project when data changes
  useEffect(() => {
    if (!loading) {
      if (projectId === 'undefined') return;
      setRetrievedProject(getProject(projectId));
    }
  }, [loading, projectId, projects, tasks]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* menu button */}
          <IonButtons slot="start" collapse={true}>
            <IonMenuButton />
          </IonButtons>
          {/* title */}
          <IonTitle>
            <p
              style={{
                borderBottom: `${retrievedProject?.color} 5px solid`,
              }}
            >
              {retrievedProject?.name}
            </p>
          </IonTitle>
          {/* options button */}
          <IonButtons slot="end" collapse={true}>
            <IonButton onClick={(e: any) => presentListPopover({ event: e })}>
              <IonIcon icon={ellipsisVerticalOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* list task items */}
        <IonList>
          {Object.keys(sortedTasks)
            .sort((a, b) => {
              if (a < b) return -1 * (retrievedProject?.viewSettings.listSettings.settings.groupDesc ? -1 : 1);
              if (a > b) return 1 * (retrievedProject?.viewSettings.listSettings.settings.groupDesc ? -1 : 1);
              return 0;
            })
            .map((key, groupIndex) => {
              const displayStrings = localeToString('taskTypeDisplayString', locale);
              return (
                <IonCard key={groupIndex}>
                  {key !== 'default' && (
                    <div className="group-label">
                      {retrievedProject?.viewSettings.listSettings.settings.group === 'typeData'
                        ? (displayStrings[key as keyof typeof displayStrings] as string)
                        : key}
                    </div>
                  )}
                  {sortedTasks[key].map((task, taskIndex) => {
                    if (
                      retrievedProject?.viewSettings.listSettings.settings.showDone ||
                      (!retrievedProject?.viewSettings.listSettings.settings.showDone &&
                        taskOverdue(getTask(task.id), new Date()))
                    )
                      return (
                        <IonItem key={taskIndex}>
                          <TaskItem
                            taskId={task.id}
                            key={taskIndex}
                            showDetails={retrievedProject?.viewSettings.listSettings.settings.showDetails}
                          />
                        </IonItem>
                      );
                  })}
                </IonCard>
              );
            })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ListView;
