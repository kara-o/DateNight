import React, { useState, useEffect } from 'react';
import {
  fetchItineraryPackage,
  createItineraryPackageItem,
  deletePkgItem
} from '../services/api-admin';
import Button from '../../layout/Button';
import { TextField, Paper } from '@material-ui/core';
import Map from '../../layout/Map';
import { Link } from 'react-router-dom';
import SimpleCard from '../../layout/SimpleCard';

const KEY = 'AIzaSyCOyujenXkNqsCLNFS0JJS7aZ36oaeUhWs';

const ItineraryItemForm = props => {
  const { onSubmit } = props;
  const [duration, setDuration] = useState('');
  const [address, setAddress] = useState('');
  const [place, setPlace] = useState('');
  const [blurb, setBlurb] = useState('');
  const [makeResLink, setMakeResLink] = useState('');
  const [iFrame, setIFrame] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  const handleClick = () => {
    onSubmit({
      duration,
      address,
      place,
      blurb,
      make_res_link: makeResLink,
      map_iframe_url: iFrame,
      map_url: mapUrl
    });
    setDuration('');
    setAddress('');
    setPlace('');
    setBlurb('');
    setMakeResLink('');
    setIFrame('');
    setMapUrl('');
  };

  const handleCreateMap = () => {
    setIFrame(createMapUrl(place, address));
  };

  const createMapUrl = (place, address) => {
    const urlEscaped = encodeURI(place + ' ' + address);
    const iFrameUrl = `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${urlEscaped}`;
    return iFrameUrl;
  };

  return (
    <Paper elevation={10}>
      <form>
        <TextField
          label='Duration (minutes)'
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />
        <TextField
          label='Address'
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <TextField
          label='Place'
          value={place}
          onChange={e => setPlace(e.target.value)}
        />
        <TextField
          multiline
          rows={3}
          label='Blurb'
          value={blurb}
          onChange={e => setBlurb(e.target.value)}
        />
        <TextField
          label='Make reservation link'
          value={makeResLink}
          onChange={e => setMakeResLink(e.target.value)}
        />
        <TextField
          label='Map URL'
          value={mapUrl}
          onChange={e => setMapUrl(e.target.value)}
        />
        <div>
          <Button onClick={handleCreateMap}>Generate Map</Button>
          {iFrame ? <Map url={iFrame} /> : null}
          <Button onClick={handleClick}>Add Item To Package</Button>
        </div>
      </form>
    </Paper>
  );
};

const AdminItineraryPackageShow = props => {
  const { userData } = props;
  const itinPackageId = props.match.params.id;
  const [itinPackage, setItinPackage] = useState(null);
  const [itinPackageItems, setItinPackageItems] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (userData) {
      fetchItineraryPackage(userData, itinPackageId).then(itinPackage => {
        setItinPackage(itinPackage);
        setItinPackageItems(itinPackage.itinerary_package_items);
      });
    }
  }, [userData]);

  const displayItinPackage = () => {
    if (itinPackage) {
      const i = itinPackage;
      return (
        <Paper elevation={10}>
          <p>Neighborhood: {i.neighborhood}</p>
          <p>Blurb: {i.blurb}</p>
          <p>Price Range: {i.price_range}</p>
          <Link to={`/admin/itinerary_packages/${itinPackage.id}/edit`}>
            Edit
          </Link>
        </Paper>
      );
    }
  };

  const handleItemSubmit = formData => {
    createItineraryPackageItem(itinPackageId, formData, userData).then(
      pkgItem => {
        setItinPackageItems(itinPackageItems.concat([pkgItem]));
      }
    );
  };

  const handleDelete = id => {
    deletePkgItem(userData, itinPackage.id, id);
    const newItinPkgItems = itinPackageItems.filter(item => item.id !== id);
    setItinPackageItems(newItinPkgItems);
  };

  if (itinPackage === null || itinPackageItems === null) {
    return <p>Loading...</p>;
  }

  const renderPackageItems = () => {
    if (itinPackageItems) {
      return itinPackageItems.map(pkgItem => {
        return (
          <>
            <SimpleCard pkgItem={pkgItem} handleDelete={handleDelete} />
          </>
        );
      });
    }
  };

  return (
    <>
      <div>
        <h1>Itinerary Package: {itinPackage.title}</h1>{' '}
        <p>{displayItinPackage()}</p>
        <h2>Package Items:</h2>
        <div>{renderPackageItems()}</div>
      </div>
      <div>
        <h2>Add Items</h2>
        <ItineraryItemForm onSubmit={handleItemSubmit} />
      </div>
    </>
  );
};

export default AdminItineraryPackageShow;
