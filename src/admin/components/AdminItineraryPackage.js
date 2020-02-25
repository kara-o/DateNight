import React, { useState, useEffect } from 'react';
import Button from '../../layout/Button';
import { TextField, MenuItem, Paper } from '@material-ui/core';
import {
  createItineraryPackage,
  fetchItineraryPackage,
  updateItineraryPackage
} from '../services/api-admin';
import { fetchOptions } from '../../user/services/api';

import { connect } from 'react-redux';

const mapStateToProps = state => ({
  auth: state.auth
});

const AdminItineraryPackage = props => {
  const { auth } = props;
  const [title, setTitle] = useState('');
  const [blurb, setBlurb] = useState('');
  const [neighborhoodSelection, setNeighborhoodSelection] = useState(null);
  const [priceRangeSelection, setPriceRangeSelection] = useState(null);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [errors, setErrors] = useState(null);
  const packageId = props.match.params.id;

  useEffect(() => {
    if (auth.uid) {
      fetchOptions('neighborhoods', auth).then(list => {
        list.sort((a, b) => a.name.localeCompare(b.name));
        setNeighborhoods(list);
        setNeighborhoodSelection(list[0].id);
      });
      fetchOptions('price_ranges', auth).then(list => {
        setPriceRanges(list);
        setPriceRangeSelection(list[0].id);
      });
      if (props.edit) {
        fetchItineraryPackage(auth, packageId).then(pkg => {
          setTitle(pkg.title);
          setBlurb(pkg.blurb);
          setNeighborhoodSelection(pkg.neighborhood_id);
          setPriceRangeSelection(pkg.price_range_id);
        });
      }
    }
  }, [auth.uid]);

  const handleSubmit = e => {
    e.preventDefault();

    const data = {
      title,
      blurb,
      neighborhood_id: neighborhoodSelection,
      price_range_id: priceRangeSelection
    };

    if (props.edit) {
      updateItineraryPackage(packageId, data, auth).then(json => {
        if (!json.errors) {
          props.history.push(`/admin/itinerary_packages/${packageId}`);
        } else {
          setErrors({
            errorObj: json.errors.error_obj,
            fullMessages: json.errors.full_messages
          });
        }
      });
    } else {
      createItineraryPackage(data, auth).then(json => {
        if (!json.errors) {
          props.history.push('/admin/itinerary_packages');
        } else {
          setErrors({
            errorObj: json.errors.error_obj,
            fullMessages: json.errors.full_messages
          });
        }
      });
    }
  };

  const renderErrors = errors => {
    return errors.fullMessages.map((error, idx) => <li key={idx}>{error}</li>);
  };

  const renderOptions = (array, attribute) => {
    return array.map(o => {
      return (
        <MenuItem key={o.id} value={o.id}>
          {o[`${attribute}`]}
        </MenuItem>
      );
    });
  };

  if (neighborhoodSelection === null || priceRangeSelection === null) {
    return (
      <form className='create-form' autoComplete='off'>
        <p>Loading...</p>
      </form>
    );
  }

  return (
    <Paper elevation={10} className='new-pkg-paper'>
      <form className='create-form' autoComplete='off'>
        <h1>Create New Itinerary Package</h1>
        <ul className='errors'>{errors ? renderErrors(errors) : null}</ul>

        <TextField
          label='Title'
          className='title text'
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <TextField
          select
          label='Neighborhood'
          className='select neighborhood-picker'
          value={neighborhoodSelection}
          onChange={e => setNeighborhoodSelection(e.target.value)}
          margin='normal'
        >
          {renderOptions(neighborhoods, 'name')}
        </TextField>

        <TextField
          select
          label='Price range'
          className='select price-picker'
          value={priceRangeSelection}
          onChange={e => setPriceRangeSelection(e.target.value)}
          margin='normal'
        >
          {renderOptions(priceRanges, 'max_amount')}
        </TextField>

        <TextField
          multiline
          rows={3}
          label='Blurb'
          className='textarea notes'
          value={blurb}
          onChange={e => setBlurb(e.target.value)}
          margin='normal'
        />

        <Button type='submit' onClick={handleSubmit}>
          Submit
        </Button>
      </form>
    </Paper>
  );
};

export default connect(mapStateToProps)(AdminItineraryPackage);
