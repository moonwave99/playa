import { MenuItemConstructorOptions } from 'electron';

export type Action = {
  title: string;
  handler: Function;
  enabled?: boolean;
}

export type ActionCreator<T> = (actionParams: T) => Action;

export type ActionMap<T> = {
  [key: string]: ActionCreator<T>;
}

export type ActionGroupsMap = {
  [key: string]: string[];
}

export function grouper<T>({
  actionGroups,
  actionParams,
  actionGroupsMap,
  actionsMap
}: {
  actionGroups: string[];
  actionParams: T;
  actionGroupsMap: ActionGroupsMap;
  actionsMap: ActionMap<T>;
}): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(actionID => actionsMap[actionID])
      .map(action => {
        const { title, handler, enabled } = action(actionParams);
        return { label: title, click: handler, enabled };
      }),
    ...index < original.length - 1 ? [{ type : 'separator'}] : []
  ], []);
}
