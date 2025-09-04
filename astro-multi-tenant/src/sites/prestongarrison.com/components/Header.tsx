import React from 'react';
import Menu from '../../../shared/components/Navigation/Menu.jsx';
import headerData from '../data/header.json';

const Header: React.FC = () => {
  return <Menu data={headerData} />;
};

export default Header;