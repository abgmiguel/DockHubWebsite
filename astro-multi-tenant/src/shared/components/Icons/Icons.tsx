import React from 'react';
import {
  Smartphone,
  Search,
  Edit3,
  Code2,
  Store,
  GitBranch,
  DollarSign,
  Wrench,
  Brain,
  ListTodo,
  Folder,
  Coins,
  Database,
  Cpu,
  ChartBar,
  Users,
  Zap,
  FileSearch,
  GitMerge,
  Cloud,
  Activity,
  BarChart3,
  Shield,
  Lock,
  Layers,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

// Map icon names to components
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Smartphone,
  Search,
  Edit3,
  Code2,
  Store,
  GitBranch,
  DollarSign,
  Wrench,
  Brain,
  ListTodo,
  Folder,
  Coins,
  Database,
  Cpu,
  ChartBar,
  Users,
  Zap,
  FileSearch,
  GitMerge,
  Cloud,
  Activity,
  BarChart3,
  Shield,
  Lock,
  Layers,
  RefreshCw
};

// Wrapper function to safely render lucide icons
export const Icon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};

// Export commonly used icons as components
export const PlayIcon = (props: any) => <Play {...props} />;
export const PauseIcon = (props: any) => <Pause {...props} />;
export const Volume2Icon = (props: any) => <Volume2 {...props} />;
export const VolumeXIcon = (props: any) => <VolumeX {...props} />;