import { useState } from 'react';

export const useSideBar = (initialTab = 'Dashboard') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return {
    activeTab,
    handleTabChange
  };
};