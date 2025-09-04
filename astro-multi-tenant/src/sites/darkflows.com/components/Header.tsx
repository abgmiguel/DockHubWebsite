import React from 'react';
import DarkHeader from '../../../shared/components/Headers/DarkHeader';
import headerData from '../data/header.json';

const Header: React.FC = () => {
  return <DarkHeader data={headerData} />;
};

export default Header;