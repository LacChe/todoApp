import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import React from 'react';
import { triangle, ellipse, square, add } from 'ionicons/icons';
import { Route } from 'react-router';

import ListView from '../components/taskViews/ListView';
import MatrixView from '../components/taskViews/MatrixView';
import CalendarView from '../components/taskViews/CalendarView';

import { useParams } from 'react-router';
import { TabType } from '../types';

import './Project.css';

interface ProjectProps {
  setCurrentTab: (tabName: TabType) => Promise<void>;
}

/**
 * The `Project` component renders a tab-based navigation interface for a project,
 * allowing users to switch between different views: List, Matrix, and Calendar.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.setCurrentTab - A function to update the current tab preference.
 *
 * @returns {JSX.Element} A tabbed interface with routes specific to the project ID.
 * The component utilizes `IonTabs` and `IonTabBar` from Ionic framework, with each tab
 * representing a different view of the project.
 */
const Project: React.FC<ProjectProps> = ({ setCurrentTab }: { setCurrentTab: Function }): JSX.Element => {
  let { projectId } = useParams() as any;

  return (
    <>
      <IonFab vertical="bottom" horizontal="end">
        <IonFabButton onClick={() => console.log('fab click')}>
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>

      <IonTabs>
        <IonTabBar slot="bottom">
          <IonTabButton
            tab="list"
            href={`/app/project/${projectId}/list`}
            onClick={() => {
              setCurrentTab('list');
            }}
          >
            <IonIcon icon={triangle} />
            <IonLabel>List</IonLabel>
          </IonTabButton>
          <IonTabButton
            tab="matrix"
            href={`/app/project/${projectId}/matrix`}
            onClick={() => {
              setCurrentTab('matrix');
            }}
          >
            <IonIcon icon={ellipse} />
            <IonLabel>Matrix</IonLabel>
          </IonTabButton>
          <IonTabButton
            tab="calendar"
            href={`/app/project/${projectId}/calendar`}
            onClick={() => {
              setCurrentTab('calendar');
            }}
          >
            <IonIcon icon={square} />
            <IonLabel>Calendar</IonLabel>
          </IonTabButton>
        </IonTabBar>

        <IonRouterOutlet>
          <Route exact path="/app/project/:projectId/list" component={ListView} />
          <Route exact path="/app/project/:projectId/matrix" component={MatrixView} />
          <Route exact path="/app/project/:projectId/calendar" component={CalendarView} />
        </IonRouterOutlet>
      </IonTabs>
    </>
  );
};

export default Project;
