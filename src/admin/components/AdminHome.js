import React, { useState, useEffect } from 'react';
import { fetchRequests } from '../services/api-admin';
import { ListContainer, ListItem, Filter, Stars } from '../../elements';
import * as moment from 'moment';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  requests: {
    gridColumn: '1/3',
    gridRow: 'auto',
  },
  filter: {
    padding: '20px 0px 20px 0px',
  },
  redText: {
    color: 'red',
  },
});

const AdminHome = (props) => {
  const { userData } = props;
  const [allRequests, setAllRequests] = useState([]);
  const [filter, setFilter] = useState('Unfulfilled');
  const classes = useStyles();

  useEffect(() => {
    if (userData) {
      fetchRequests(userData).then((json) => setAllRequests(json));
    }
  }, []);

  const renderRequests = () => {
    let requests;
    if (filter === 'Unfulfilled') {
      requests = allRequests.filter((r) => !r.fulfilled);
    } else if (filter === 'New Reviews') {
      requests = allRequests.filter(
        (r) => r.review && !r.review.admin_reviewed
      );
    } else if (filter === 'Cancelled') {
      requests = allRequests.filter((r) => r.cancelled);
    } else if (filter === 'Completed') {
      requests = allRequests.filter(
        (r) =>
          r.fulfilled && !r.cancelled && new Date(r.start_time) < new Date()
      );
    } else {
      requests = allRequests;
    }
    requests.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    return requests.map((r) => {
      let status;
      if (r.fulfilled) {
        if (new Date(r.start_time) < new Date() && !r.cancelled) {
          status = 'COMPLETED';
        } else {
          status = 'FULFILLED';
        }
      } else {
        status = 'UNFULFILLED';
      }
      return (
        <ListItem
          styles={
            filter === 'Unfulfilled' ? 'unfulfilledOnly' : 'upcomingPastDates'
          }
          key={r.id}
          id={r.id}
          destination={`/admin/requests/${r.id}`}
        >
          <p>{moment(r.start_time).calendar()}</p>
          <p>
            {status}
            {r.cancelled ? (
              <span className={classes.redText}> - CANCELLED</span>
            ) : null}
          </p>
          <p>{r.review ? <Stars review={r.review} /> : null}</p>
        </ListItem>
      );
    });
  };

  const handleChange = (e) => {
    const optionsArray = Array.from(e.target.options);
    optionsArray
      .filter((option) => option.selected)
      .forEach((option) => setFilter(option.value));
  };

  const renderFilter = () => {
    return (
      <Filter
        styles={classes.filter}
        title='Filter: '
        value={filter}
        onChange={handleChange}
      >
        <option value='Unfulfilled'>Unfulfilled</option>
        <option value='New Reviews'>New Reviews</option>
        <option value='Completed'>Completed</option>
        <option value='Cancelled'>Cancelled</option>
        <option value='All'>All</option>
      </Filter>
    );
  };

  return (
    <ListContainer
      title={
        filter === 'New Reviews' ? 'Newly Reviewed' : filter + ' ' + 'Requests'
      }
      styles={classes.requests}
    >
      {renderFilter()}
      {renderRequests()}
    </ListContainer>
  );
};

export default AdminHome;
