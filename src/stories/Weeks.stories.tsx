import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Weeks, WeeksProps } from '../components/v2/Weeks';
import { addDays } from '../lib/utils';
import { Workout } from '../components/v2/model';

const getWorkout = (id: string): Workout => ({
  // id,
  totalDistance: 4,
  description: "Recovery #4D"
});

export default {
  title: 'Weeks',
  component: Weeks,
} as Meta;

const Template: Story<WeeksProps> = (args) => <Weeks {...args} />;

const today = new Date();
export const TwoWeeks = Template.bind({});
TwoWeeks.args =  {
  weeks: [
    [
      {
        date: today,
      },
      {
        date: addDays(today, 1),
      },
      {
        date: addDays(today, 2),
      },
      {
        date: addDays(today, 3),
        workout: getWorkout("3"),
      },
      {
        date: addDays(today, 4),
        workout: getWorkout("4"),
      },
      {
        date: addDays(today, 5),
        workout: getWorkout("5"),
      },
      {
        date: addDays(today, 6),
        workout: getWorkout("6"),
      },
    ],
    [
      {
        date: addDays(today, 7),
        workout: getWorkout("7"),
      },
      {
        date: addDays(today, 8),
        workout: getWorkout("8"),
      },
      {
        date: addDays(today, 9),
        workout: getWorkout("9"),
      },
      {
        date: addDays(today, 10),
        workout: getWorkout("10"),
      },
      {
        date: addDays(today, 11),
      },
      {
        date: addDays(today, 12),
      },
      {
        date: addDays(today, 13),
      },
    ],
  ],
  onSave: (day) => {},
}
