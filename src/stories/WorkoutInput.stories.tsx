import React from 'react';
import { Story, Meta } from '@storybook/react';

import { WorkoutInput, WorkoutInputProps } from '../components/v2/WorkoutInput';

export default {
  title: 'WorkoutInput',
  component: WorkoutInput,
} as Meta;

const Template: Story<WorkoutInputProps> = (args) => <WorkoutInput {...args} />;

export const Primary = Template.bind({});
Primary.args =  {
  initialWorkoutString: "Recovery #4D",
}
