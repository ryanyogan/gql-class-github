import React, { Fragment } from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { withState } from 'recompose';

import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import Button, { ButtonUnobtrusive } from '../../Button';
import FetchMore from '../../FetchMore';

import './style.css';

const ISSUE_STATES = {
  NONE: 'NONE',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

const TRANSITION_LABELS = {
  [ISSUE_STATES.NONE]: 'Show Open Issues',
  [ISSUE_STATES.OPEN]: 'Show Closed Issues',
  [ISSUE_STATES.CLOSED]: 'Hide Issues',
};

const TRANSITION_STATE = {
  [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
  [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
  [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE,
};

const GET_ISSUES_OF_REPO = gql`
  query(
    $repositoryName: String!
    $repositoryOwner: String!
    $issueState: IssueState!
    $cursor: String
  ) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5, states: [$issueState], after: $cursor) {
        edges {
          node {
            id
            number
            state
            title
            url
            bodyHTML
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

const updateQuery = (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return {
    ...previousResult,
    repository: {
      ...previousResult.repository,
      issues: {
        ...previousResult.repository.issues,
        ...fetchMoreResult.repository.issues,
        edges: [
          ...previousResult.repository.issues.edges,
          ...fetchMoreResult.repository.issues.edges,
        ],
      },
    },
  };
};

const isShow = issueState => issueState !== ISSUE_STATES.NONE;

const Issues = ({
  repositoryOwner,
  repositoryName,
  issueState,
  onChangeIssueState,
}) => (
  <div className="Issues">
    <IssueFilter
      repositoryName={repositoryName}
      repositoryOwner={repositoryOwner}
      issueState={issueState}
      onChangeIssueState={onChangeIssueState}
    />

    {isShow(issueState) && (
      <Query
        query={GET_ISSUES_OF_REPO}
        variables={{
          repositoryOwner,
          repositoryName,
          issueState,
        }}
        notifyOnNetworkStatusChange
      >
        {({ data, loading, error, fetchMore }) => {
          if (error) {
            return <ErrorMessage error={error} />;
          }

          const { repository } = data;

          if (loading && !repository) {
            return <Loading />;
          }

          if (!repository.issues.edges.length) {
            return <div className="IssueList">No issues ...</div>;
          }

          return (
            <Fragment>
              <IssueList issues={repository.issues} />;
              <FetchMore
                loading={loading}
                hasNextPage={repository.issues.pageInfo.hasNextPage}
                variables={{
                  cursor: repository.issues.pageInfo.endCursor,
                }}
                updateQuery={updateQuery}
                fetchMore={fetchMore}
              >
                Issues
              </FetchMore>
            </Fragment>
          );
        }}
      </Query>
    )}
  </div>
);

const IssueList = ({ issues }) => (
  <div className="IssueList">
    {issues.edges.map(({ node }) => <IssueItem key={node.id} issue={node} />)}
  </div>
);

const prefetchIssues = (
  client,
  repositoryOwner,
  repositoryName,
  issueState,
) => {
  const nextIssueState = TRANSITION_STATE[issueState];

  if (isShow(nextIssueState)) {
    client.query({
      query: GET_ISSUES_OF_REPO,
      variables: {
        repositoryOwner,
        repositoryName,
        issueState: nextIssueState,
      },
    });
  }
};

const IssueFilter = ({
  issueState,
  onChangeIssueState,
  repositoryName,
  repositoryOwner,
}) => (
  <ApolloConsumer>
    {client => (
      <ButtonUnobtrusive
        onClick={() => onChangeIssueState(TRANSITION_STATE[issueState])}
        onMouseOver={prefetchIssues(
          client,
          repositoryOwner,
          repositoryName,
          issueState,
        )}
      >
        {TRANSITION_LABELS[issueState]}
      </ButtonUnobtrusive>
    )}
  </ApolloConsumer>
);

export default withState('issueState', 'onChangeIssueState', ISSUE_STATES.NONE)(
  Issues,
);
