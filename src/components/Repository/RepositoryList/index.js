import React from 'react';

import RepositorItem from '../RepositoryItem';

import '../style.css';

const RepositoryList = ({ repositories }) =>
  repositories.edges.map(({ node }) => (
    <div key={node.id} className="RepositoryItem">
      <RepositorItem {...node} />
    </div>
  ));

export default RepositoryList;
