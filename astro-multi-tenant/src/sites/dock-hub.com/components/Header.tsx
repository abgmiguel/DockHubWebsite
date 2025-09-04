import React from 'react';
import HeaderData from '../../../shared/components/Headers/HeaderData';
import headerData from '../data/header.json';

const Header: React.FC = () => {
  return <HeaderData data={headerData} />;
};

export default Header;