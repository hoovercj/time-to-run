import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Day, DayProps } from '../components/v2/Day';

export default {
  title: 'Day',
  component: Day,
} as Meta;

const Template: Story<DayProps> = (args) => <Day {...args} />;

const workoutString = "Recovery #4D";
export const Workout = Template.bind({});
Workout.args =  {
  content: {
    date: new Date(),
    workout: {
      // id: "1",
      description: workoutString,
      totalDistance: 5
    }
  },
  onSave: (workout) => {},
}

export const ReadonlyWorkout = Template.bind({});
ReadonlyWorkout.args =  {
  content: {
    date: new Date(),
    workout: {
      // id: "1",
      description: workoutString,
      totalDistance: 5
    }
  },
  onSave: undefined,
}

export const EmptyDay = Template.bind({});
EmptyDay.args =  {
  content: {
    date: new Date(),
  },
  onSave: undefined
}
