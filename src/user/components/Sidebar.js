import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import * as moment from 'moment';
import { Link } from 'react-router-dom';
import { MenuItem, MenuList } from '@material-ui/core';

const Sidebar = ({ userData }) => {
  const renderInitials = () => {
    if (!userData.admin) {
      return (
        `${userData.user.first_name.slice(0, 1)}` +
        `${userData.user.last_name.slice(0, 1)}`
      );
    } else {
      return 'ADMIN';
    }
  };

  return (
    <div className='sidebar'>
      <Link
        className='avatar link'
        to={userData && userData.admin ? '/admin' : '/'}
      >
        <Avatar className='avatar'>{renderInitials()}</Avatar>
      </Link>
      {userData && !userData.admin ? (
        <ul className='sidebar-list'>
          <li>
            <strong>
              {userData.user.first_name + ' ' + userData.user.last_name}
            </strong>
          </li>
          <br />
          <li>
            Joined: {moment(userData.user.created_at).format('MMMM Do YYYY')}
          </li>
          <br />
        </ul>
      ) : null}
      {userData && userData.admin ? (
        <>
          <MenuList>
            <MenuItem>
              <Link className='sidebar-link' to='/admin/'>
                Requests
              </Link>
            </MenuItem>
            <MenuItem>
              <Link className='sidebar-link' to='/admin/itinerary_packages'>
                Itinerary Packages
              </Link>
            </MenuItem>
          </MenuList>
        </>
      ) : null}
    </div>
  );
};

export default Sidebar;
