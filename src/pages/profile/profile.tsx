import React from 'react';
import BaseFormPage from '../../core/pages/form-page';

export function Profile() {
  
  return (
    <React.Fragment >
      <BaseFormPage key='1' items={[
        {
          type: 'form',
          caption: 'Profile',
          masterData: {
            colCountByScreen: {
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4
            }
          },
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory/1"
        }
      ]} />
    </React.Fragment> 
  );
}

