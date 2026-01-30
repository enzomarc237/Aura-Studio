
import React from 'react';
import { Template } from './types';
import { Icon } from './components/Icon';

export const TEMPLATES: Template[] = [
  {
    name: 'Dashboard UI',
    type: 'ui',
    prompt: 'A modern, dark-themed dashboard UI for a financial analytics app, featuring data visualizations and charts.',
    icon: <Icon name="layout" />,
  },
  {
    name: 'Mobile App Wireframe',
    type: 'wireframe',
    prompt: 'A high-fidelity wireframe for a mobile social networking app. Key screens: feed, profile, messaging.',
    icon: <Icon name="smartphone" />,
  },
  {
    name: 'Geometric Logo',
    type: 'logo',
    prompt: 'A minimalist geometric logo for a tech startup named "Orbit". Use shades of blue and a circular motif.',
    icon: <Icon name="hexagon" />,
  },
  {
    name: 'Data Icon Set',
    type: 'svg',
    prompt: 'A set of 4 simple, flat-style SVG icons representing data, analytics, cloud, and security.',
    icon: <Icon name="database" />,
  },
   {
    name: 'E-commerce Homepage',
    type: 'ui',
    prompt: 'Clean and bright UI for an e-commerce website selling handmade ceramics. Focus on product imagery.',
    icon: <Icon name="shopping-cart" />,
  },
  {
    name: 'Web App Wireframe',
    type: 'wireframe',
    prompt: 'High-fidelity wireframe for a project management web application. Include a Kanban board view.',
    icon: <Icon name="monitor" />,
  },
];
