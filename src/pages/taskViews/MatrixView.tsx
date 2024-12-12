import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonPopover,
} from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ProjectType } from '../../types';
import { ellipsisVerticalOutline } from 'ionicons/icons';

import './TaskView.css';
import { Context } from '../../dataManagement/ContextProvider';

const MatrixView: React.FC = () => {
  let { projectId } = useParams() as { projectId: string };
  const { loading, getProject, setProject, tasks, getTask } = useContext(Context);

  const [retrievedProject, setRetrievedProject] = useState<ProjectType>();

  /**
   * Popover for options specific to the matrix view
   * @returns {JSX.Element}
   */
  function matrixOptionsPopover(): JSX.Element {
    return (
      <IonContent class="ion-padding">
        <IonButtons>
          <IonButton
            onClick={() => {
              document.getElementById('open-edit-project-modal')?.click();
              dismissMatrixPopover();
            }}
          >
            Edit
          </IonButton>
          <IonButton
            onClick={() => {
              let newProject = { ...retrievedProject } as ProjectType;
              newProject.viewSettings.matrixSettings.settings.showDone =
                !newProject.viewSettings.matrixSettings.settings.showDone;
              setRetrievedProject(newProject);
              setProject(newProject);
              dismissMatrixPopover();
            }}
          >
            {!retrievedProject?.viewSettings.matrixSettings.settings.showDone ? 'Show ' : 'Hide '} Done
          </IonButton>
          <IonButton
            onClick={() => {
              let newProject = { ...retrievedProject } as ProjectType;
              newProject.viewSettings.matrixSettings.settings.showDetails =
                !newProject.viewSettings.matrixSettings.settings.showDetails;
              setRetrievedProject(newProject);
              setProject(newProject);
              dismissMatrixPopover();
            }}
          >
            {!retrievedProject?.viewSettings.matrixSettings.settings.showDetails ? 'Show ' : 'Hide '} Details
          </IonButton>
        </IonButtons>
      </IonContent>
    );
  }
  const [presentMatrixPopover, dismissMatrixPopover] = useIonPopover(matrixOptionsPopover);

  // retrieve project when data changes
  useEffect(() => {
    if (!loading) {
      if (projectId === 'undefined') return;
      const retrievedProject = getProject(projectId);
      if (retrievedProject) setRetrievedProject(retrievedProject);
      else console.error(`ProjectId: ${projectId} not found`);
    }
  }, [loading, projectId, tasks]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': retrievedProject?.color }}>
          {/* menu button */}
          <IonButtons slot="start" collapse={true}>
            <IonMenuButton />
          </IonButtons>
          {/* title */}
          <IonTitle>{retrievedProject?.name} MatrixView</IonTitle>
          {/* options button */}
          <IonButtons slot="end" collapse={true}>
            <IonButton onClick={(e: any) => presentMatrixPopover({ event: e })}>
              <IonIcon icon={ellipsisVerticalOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="matrix-view-content">
        <IonGrid className="matrix-grid">
          <IonRow>
            {retrievedProject?.viewSettings.matrixSettings.blocks.map((block, index) => {
              return (
                <IonCol size="1" key={index}>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardSubtitle style={{ fontSize: '0.65rem', color: block?.color }}>
                        {block.name}
                      </IonCardSubtitle>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>
              );
            })}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MatrixView;
