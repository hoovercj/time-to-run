import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Week, WeekProps } from '../components/v2/Week';
import { addDays } from '../lib/utils';
import { Workout } from '../components/v2/model';

export default {
  title: 'Week',
  component: Week,
} as Meta;

const Template: Story<WeekProps> = (args) => <Week {...args} />;

const today = new Date();
export const EmptyWeek = Template.bind({});
EmptyWeek.args =  {
  weekNumber: 1,
  days: [
    { date: today},
    { date: addDays(today, 1) },
    { date: addDays(today, 2) },
    { date: addDays(today, 3) },
    { date: addDays(today, 4) },
    { date: addDays(today, 5) },
    { date: addDays(today, 6) },
  ],
  onSave: (day) => {},
}

const getWorkout = (id: string): Workout => ({
  // id,
  totalDistance: 4,
  description: "Recovery #4D"
});

export const WorkoutWeek = Template.bind({});
WorkoutWeek.args =  {
  weekNumber: 1,
  days: [
    {
      date: today,
      workout: getWorkout("0"),
    },
    {
      date: addDays(today, 1),
      workout: getWorkout("1"),
    },
    {
      date: addDays(today, 2),
      workout: getWorkout("2"),
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
  onSave: (day) => {},
}

export const WorkoutColumn = Template.bind({});
WorkoutColumn.args =  {
  ...WorkoutWeek.args,
  display: "column",
}