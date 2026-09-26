import { 
  Users, 
  Calendar, 
  Columns, 
  User, 
  Bell, 
  Shield, 
  Clock, 
  LayoutPanelLeft, 
  Search,
  Umbrella
} from 'lucide-react';
import {
  VIEW_STAFF,
  VIEW_MONTH,
  VIEW_WEEK,
  VIEW_DAYS_OFF,
  VIEW_SETTINGS_SIDEBAR,
  VIEW_SETTINGS_OMNIBOX,
  VIEW_SETTINGS_PROFILE,
  VIEW_SETTINGS_DATE_TIME,
  VIEW_SETTINGS_NOTIFICATIONS,
  VIEW_SETTINGS_SECURITY
} from '../constants/views';

const viewInfos = {
  [VIEW_STAFF]: { name: 'Staff', icon: Users },
  [VIEW_MONTH]: { name: 'Months', icon: Calendar },
  [VIEW_WEEK]: { name: 'Weeks', icon: Columns },
  [VIEW_DAYS_OFF]: { name: 'Days Off', icon: Umbrella },
  [VIEW_SETTINGS_SIDEBAR]: { name: 'Sidebar', icon: LayoutPanelLeft },
  [VIEW_SETTINGS_OMNIBOX]: { name: 'Omnibox', icon: Search },
  [VIEW_SETTINGS_DATE_TIME]: { name: 'Date & Time', icon: Clock },
  [VIEW_SETTINGS_PROFILE]: { name: 'Profile', icon: User },
  [VIEW_SETTINGS_NOTIFICATIONS]: { name: 'Notifications', icon: Bell },
  [VIEW_SETTINGS_SECURITY]: { name: 'Security', icon: Shield },
};

export const getViewInfo = (viewId) => {
  const info = viewInfos[viewId];
  if (info) {
    return info;
  }
  return { name: viewId, icon: null };
};
