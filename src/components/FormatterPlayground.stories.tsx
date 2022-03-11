import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormatterPlayground } from "./FormatterPlayground";

export default {
  title: 'Example/Formatter',
  component: FormatterPlayground,
} as ComponentMeta<typeof FormatterPlayground>;

const Template: ComponentStory<typeof FormatterPlayground> = (args) => <FormatterPlayground {...args} />;

export const Formatter = Template.bind({});
Formatter.args = {
  defaultValue: "Run #5D (5 x #1d)",
  inputUnits: 'miles',
  outputUnits: 'miles',
  editable: true,
}
