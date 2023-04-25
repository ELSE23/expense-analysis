import { ComponentType } from 'react';
import Home from '@/pages';

export interface RouteType {
  path: string;
  Component: ComponentType;
}
export type RouteLists = RouteType[];

const routes: RouteLists = [
  {
    path: '/',
    Component: Home
  }
];

export default routes;
