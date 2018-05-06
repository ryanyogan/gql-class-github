import React, { Component, Fragment } from 'react';
import { Mutation } from 'react-apollo';

import { ADD_COMMENT } from './mutations';

import TextArea from '../../TextArea';
import Button from '../../Button';
import ErrorMessage from '../../Error';

class CommentAdd extends Component {
  state = {
    value: '',
  };

  onChange = value => this.setState({ value });

  onSubmit = async (event, addComent) => {
    event.preventDefault();

    await addComent();
    this.setState({ value: '' });
  };

  render() {
    const { issueId } = this.props;
    const { value } = this.state;

    return (
      <Mutation
        mutation={ADD_COMMENT}
        variables={{ body: value, subjectId: issueId }}
      >
        {(addComment, { error }) => (
          <Fragment>
            {error && <ErrorMessage error={error} />}

            <form onSubmit={e => this.onSubmit(e, addComment)}>
              <TextArea
                value={value}
                onChange={e => this.onChange(e.target.value)}
                placeholder="Leave a comment"
              />
              <Button type="submit">Comment</Button>
            </form>
          </Fragment>
        )}
      </Mutation>
    );
  }
}

export default CommentAdd;
