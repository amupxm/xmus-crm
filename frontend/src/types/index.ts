export type LayoutType = 'default' | 'minimal' | 'dashboard';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  layout?: LayoutType;
  title?: string;
}
