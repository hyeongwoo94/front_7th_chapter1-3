import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import ViewToolbar from './ViewToolbar';

const meta: Meta<typeof ViewToolbar> = {
  title: 'Components/ViewToolbar',
  component: ViewToolbar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ViewToolbar>;

const DefaultStory = () => {
  const [view, setView] = useState<'week' | 'month'>('week');
  const navigate = (dir: 'prev' | 'next') => {
    console.log(`Navigate ${dir}`);
  };
  return <ViewToolbar view={view} setView={setView} navigate={navigate} />;
};

export const Default: Story = {
  render: () => <DefaultStory />,
};

const WeekViewStory = () => {
  const [view, setView] = useState<'week' | 'month'>('week');
  const navigate = (dir: 'prev' | 'next') => {
    console.log(`Navigate ${dir}`);
  };
  return <ViewToolbar view={view} setView={setView} navigate={navigate} />;
};

export const WeekView: Story = {
  render: () => <WeekViewStory />,
};

const MonthViewStory = () => {
  const [view, setView] = useState<'week' | 'month'>('month');
  const navigate = (dir: 'prev' | 'next') => {
    console.log(`Navigate ${dir}`);
  };
  return <ViewToolbar view={view} setView={setView} navigate={navigate} />;
};

export const MonthView: Story = {
  render: () => <MonthViewStory />,
};
