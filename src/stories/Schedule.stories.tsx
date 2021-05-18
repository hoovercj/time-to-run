import React from 'react';
import { Story, Meta } from '@storybook/react';

import schedule from "../workouts/plans/marathon_pfitzinger_18_55";
import { addDays } from '../lib/utils';
import { Schedule, ScheduleProps } from '../components/v2/Schedule';

export default {
  title: 'Schedule',
  component: Schedule,
} as Meta;

const Template: Story<ScheduleProps> = (args) => <Schedule {...args} />;

const today = new Date();
export const Marathon = Template.bind({});
Marathon.args =  {
  firstDayOfWeek: addDays(today, 3).getDay(),
  endDate: today,
  plan: schedule
}
