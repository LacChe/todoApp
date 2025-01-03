import {
  IonAlert,
  IonButton,
  IonDatetime,
  IonIcon,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToolbar,
} from '@ionic/react';
import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';

import { Context } from '../../dataManagement/ContextProvider';
import { checkmarkOutline, closeOutline } from 'ionicons/icons';
import { TaskType, TaskTypeDataTypeNameType, TaskTypeDataTypeValueType } from '../../types';
import DayOfMonthSelection from '../DayOfMonthSelection';
import { localeToString } from '../../dataManagement/utils';

type EditTaskModalProps = {
  basicTaskInfo: TaskType | undefined;
  setBasicTaskInfo: Dispatch<SetStateAction<TaskType | undefined>>;
};

const EditTaskModal: React.FC<EditTaskModalProps> = ({ basicTaskInfo, setBasicTaskInfo }) => {
  const editProjectModal = useRef<HTMLIonModalElement>(null);
  const { getTask, setTask, tasks, deleteTask, currentTaskId, locale } = useContext(Context);

  let retrievedTask: TaskType;
  const [newTaskName, setNewTaskName] = useState<string | undefined>();
  const [newTaskNotes, setNewTaskNotes] = useState<string | undefined>();
  const [newTaskTypeDataName, setNewTaskTypeDataName] = useState<TaskTypeDataTypeNameType | undefined>();
  const [everyNumDaysValue, setEveryNumDaysValue] = useState<number | undefined>();
  const [everyDaysOfWeekValue, setEveryDaysOfWeekValue] = useState<number[] | undefined>();
  const [everyDaysOfMonthValue, setEveryDaysOfMonthValue] = useState<number[] | undefined>();
  const [onDatesValue, setOnDatesValue] = useState<string[] | undefined>();

  useEffect(() => {
    loadData();
  }, [currentTaskId, tasks, basicTaskInfo]);

  /**
   * Loads the data for the task being edited from either the context or the passed
   * basicTaskInfo. This data is then used to update the state variables for the
   * input fields.
   */
  async function loadData() {
    if (basicTaskInfo) retrievedTask = basicTaskInfo;
    else retrievedTask = getTask(currentTaskId);

    setNewTaskName(retrievedTask?.name);
    setNewTaskNotes(retrievedTask?.notes);
    setNewTaskTypeDataName(retrievedTask?.typeData.name);
    switch (retrievedTask?.typeData.name) {
      case 'everyNumDays':
        setEveryNumDaysValue(retrievedTask?.typeData.value as number);
        break;
      case 'everyDaysOfWeek':
        setEveryDaysOfWeekValue(retrievedTask?.typeData.value as number[]);
        break;
      case 'everyDaysOfMonth':
        setEveryDaysOfMonthValue(retrievedTask?.typeData.value as number[]);
        break;
      case 'onDates':
        setOnDatesValue(retrievedTask?.typeData.value as string[]);
        break;
    }
  }

  /**
   * Edits the task with the given ID with the given name, status, notes, and typeData.
   * If doesn't pass data checks, does nothing.
   * After editing, dismisses the modal.
   */
  function handleEditTask() {
    if (!newTaskName || newTaskName === '') return;
    if (!newTaskTypeDataName) return;

    if (basicTaskInfo) retrievedTask = basicTaskInfo;
    else retrievedTask = getTask(currentTaskId);

    retrievedTask.name = newTaskName;
    retrievedTask.notes = newTaskNotes as string;
    // clear completed dates if task type is changed
    const completedOnDates = retrievedTask.typeData.completedOnDates;
    if (retrievedTask.typeData.name !== newTaskTypeDataName) retrievedTask.typeData.completedOnDates = [];

    retrievedTask.typeData = {
      name: newTaskTypeDataName,
      completedOnDates: completedOnDates,
    };
    switch (newTaskTypeDataName) {
      case 'everyNumDays':
        retrievedTask.typeData.value = everyNumDaysValue as TaskTypeDataTypeValueType;
        break;
      case 'everyDaysOfWeek':
        retrievedTask.typeData.value = everyDaysOfWeekValue as TaskTypeDataTypeValueType;
        break;
      case 'everyDaysOfMonth':
        retrievedTask.typeData.value = everyDaysOfMonthValue as TaskTypeDataTypeValueType;
        break;
      case 'onDates':
        retrievedTask.typeData.value = onDatesValue as TaskTypeDataTypeValueType;
        break;
    }

    setTask(retrievedTask);

    setNewTaskName(undefined);
    setNewTaskNotes(undefined);
    setNewTaskTypeDataName(undefined);
    setEveryNumDaysValue(undefined);
    setEveryDaysOfWeekValue(undefined);
    setEveryDaysOfMonthValue(undefined);
    setOnDatesValue(undefined);

    editProjectModal.current?.dismiss();
  }

  /**
   * Deletes the task with the given ID and then dismisses the modal.
   */
  function handleDeleteTask() {
    deleteTask(currentTaskId);
    editProjectModal.current?.dismiss();
  }

  /**
   * Handles the submission of the edit task form by calling handleEditTask()
   * and then dismissing the modal.
   *
   * @param {any} e - The form submission event.
   */
  function handleSubmit(e: any) {
    e.preventDefault();
    handleEditTask();
    editProjectModal.current?.dismiss();
  }

  /**
   * Handles the dismissal of the modal by setting the basicTaskInfo to undefined.
   */
  function handleDismiss() {
    setBasicTaskInfo(undefined);
  }

  return (
    <IonModal
      ref={editProjectModal}
      className="edit-task-modal"
      trigger="open-edit-task-modal"
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      onDidDismiss={handleDismiss}
    >
      <form onSubmit={handleSubmit} className="edit-task-modal-form">
        <IonToolbar>
          <IonButton type="button" slot="start" id="present-delete-confirmation">
            <IonIcon icon={closeOutline} />
          </IonButton>
          <IonButton type="submit" slot="end">
            <IonIcon icon={checkmarkOutline} />
          </IonButton>
        </IonToolbar>
        <div className="form-inputs">
          {/* Name Input */}
          <IonInput
            labelPlacement="floating"
            label={localeToString('taskNamePlaceholder', locale) as string}
            value={newTaskName}
            onIonInput={(e) => setNewTaskName(e.detail.value as string)}
          />
          {/* Notes Input */}
          <IonTextarea
            labelPlacement="floating"
            label={localeToString('notesPlaceholder', locale) as string}
            value={newTaskNotes}
            onIonInput={(e) => setNewTaskNotes(e.detail.value as string)}
          />
          {/* TypeData Name Input */}
          <IonSelect
            labelPlacement="floating"
            value={newTaskTypeDataName}
            onIonChange={(e) => setNewTaskTypeDataName(e.detail.value)}
            interface="popover"
          >
            {Object.keys(localeToString('taskTypeDisplayString', locale)).map((key, index) => {
              const displayStrings = localeToString('taskTypeDisplayString', locale);
              return (
                <IonSelectOption key={index} value={key}>
                  {displayStrings[key as keyof typeof displayStrings]}
                </IonSelectOption>
              );
            })}
          </IonSelect>
          {/* TypeData Value Input everyNumDays */}
          {newTaskTypeDataName === 'everyNumDays' && (
            <div className="edit-task-input-every-num-days">
              {(localeToString('everyNumDaysLabelList', locale) as string[])[0]}
              <IonInput
                min={1}
                type="number"
                placeholder="#"
                value={everyNumDaysValue}
                onIonChange={(e) => setEveryNumDaysValue(e.detail.value ? Number.parseInt(e.detail.value) : 0)}
              />
              {(localeToString('everyNumDaysLabelList', locale) as string[])[1]}
            </div>
          )}
          {/* TypeData Value Input everyDaysOfWeek */}
          {newTaskTypeDataName === 'everyDaysOfWeek' && (
            <IonSelect
              labelPlacement="floating"
              value={everyDaysOfWeekValue}
              onIonChange={(e) => setEveryDaysOfWeekValue(e.detail.value as number[])}
              interface="popover"
              multiple={true}
              placeholder={localeToString('everyDaysOfWeekLabel', locale) as string}
            >
              {(localeToString('weekdaysNames', locale) as string[]).map((weekdayName, index) => (
                <IonSelectOption key={index} value={index}>
                  {weekdayName}
                </IonSelectOption>
              ))}
            </IonSelect>
          )}
          {/* TypeData Value Input everyDaysOfMonth */}
          {newTaskTypeDataName === 'everyDaysOfMonth' && (
            <div className="edit-task-input-every-days-of-month">
              <DayOfMonthSelection
                everyDaysOfMonthValue={everyDaysOfMonthValue}
                setEveryDaysOfMonthValue={setEveryDaysOfMonthValue}
              />
            </div>
          )}
          {/* TypeData Value Input everyDaysOfWeek */}
          {newTaskTypeDataName === 'onDates' && (
            <IonDatetime
              className="edit-task-input-on-dates"
              onIonChange={(e) => setOnDatesValue(e.detail.value as string[])}
              presentation="date"
              multiple={true}
              value={onDatesValue}
            />
          )}
          {/* Confirmation Alert for Deleting */}
          <IonAlert
            header={`${localeToString('delete', locale)} ${newTaskName}?`}
            trigger="present-delete-confirmation"
            buttons={[
              {
                text: localeToString('cancel', locale) as string,
              },
              {
                text: localeToString('delete', locale) as string,
                role: 'confirm',
                handler: handleDeleteTask,
              },
            ]}
          ></IonAlert>
        </div>
      </form>
    </IonModal>
  );
};

export default EditTaskModal;
