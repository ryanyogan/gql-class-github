import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import Loading from '../Loading';
import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import ErrorMessage from '../Error';

const GET_REPOS_OF_CURRENT_USER = gql`
  query($cursor: String) {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
        after: $cursor
      ) {
        edges {
          node {
            ...repository
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }

  ${REPOSITORY_FRAGMENT}
`;

const Profile = () => (
  <Query query={GET_REPOS_OF_CURRENT_USER} notifyOnNetworkStatusChange>
    {({ data, loading, error, fetchMore }) => {
      if (error) {
        return <ErrorMessage error={error} />;
      }

      const { viewer } = data;

      if (loading && !viewer) {
        return <Loading />;
      }

      return (
        <RepositoryList
          loading={loading}
          fetchMore={fetchMore}
          repositories={viewer.repositories}
        />
      );
    }}
  </Query>
);

export default Profile;
