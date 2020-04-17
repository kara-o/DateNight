import React, { useEffect, useState } from 'react';
import {
  Button,
  MyLink,
  ItineraryDisplay,
  RequestContainer,
  Filter,
  ListContainer,
  QuestionModal,
  Review
} from '../../elements';
import { useWindowSize } from '../../hooks'
import { fetchRequest, fetchOptions } from '../../user/services/api';
import {
  toggleRequestFulfilled,
  fetchItineraryPackages,
  applyItineraryPackage,
  sendTextMessages,
  scrapeNames,
  scrapeSinglePage,
  deleteItinItem,
  addItinItem
} from '../services/api-admin';
import * as moment from 'moment';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker
} from '@material-ui/pickers';
import { createUseStyles } from 'react-jss';

const KEY = 'AIzaSyCOyujenXkNqsCLNFS0JJS7aZ36oaeUhWs'; // Google Maps API, okay if public

const useStyles = createUseStyles({
  column: {
    width: '100%'
  },
  column1: {
    gridRow: '2/3'
  },
  column2: {
    gridRow: '3/4'
  },
  addBtn: {
    margin: '0px 0px 20px 0px'
  },
  timePicker: {
    maxWidth: '25%'
  },
  emptyItin: {
    fontStyle: 'italic'
  },
  button: {
    marginTop: '20px'
  },
  filter: {
    marginBottom: '20px'
  },
  contactBtn: {
    marginTop: '0px'
  },
  scrapedListItem: {
    '&:hover': {
      cursor: 'pointer',
      color: 'turquoise'
    }
  },
  buttonDiv: {
    marginBottom: '16px'
  }
});

const AdminRequestShow = props => {
  const { userData } = props;
  const [isFetching, setIsFetching] = useState(false)
  const requestId = props.match.params.id;
  const [request, setRequest] = useState(null);
  const [itinPackages, setItinPackages] = useState(null);
  const [scrapedNames, setScrapedNames] = useState([]);
  const [modalInfo, setModalInfo] = useState(null);
  const [resTime, setResTime] = useState(null);
  const [iFrame, setIFrame] = useState(null);
  const [filter, setFilter] = useState('All');
  const [showVenues, setShowVenues] = useState(false);
  const [singleVenue, setSingleVenue] = useState(true)
  const [neighborhoods, setNeighborhoods] = useState([])
  const size = useWindowSize()
  const classes = useStyles();

  useEffect(() => {  //TODO add cleanup function?
    if (userData) {
      fetchRequest(userData, requestId).then(res => {
        setRequest(res.request);
        setIsFetching(true)
        scrapeNames(
          userData,
          moment(res.request.start_time).format('YYYY-MM-DD')
        ).then(names => {
          setScrapedNames(names)
          setIsFetching(false)
        });
      });
      fetchItineraryPackages(userData).then(setItinPackages);
      fetchOptions('neighborhoods', userData).then(list => {
        list.sort((a, b) => a.name.localeCompare(b.name));
        setNeighborhoods(list);
      })
    }
  }, [userData]);

  const handleComplete = () => {
    toggleRequestFulfilled(
      userData,
      requestId,
      !request.fulfilled
    ).then(respJson => {
      setRequest(respJson.request)
      setShowVenues(false)
    });
  };

  const handleApplyPackage = itinPackageId => {
    applyItineraryPackage(requestId, itinPackageId, userData).then(respJson =>
      setRequest(respJson.request)
    );
  };

  const handleMessage = () => {
    sendTextMessages(userData, requestId);
  };

  const handleRemove = item => {
    deleteItinItem(userData, item.id).then(() => {
      fetchRequest(userData, requestId).then(res => {
        setRequest(res.request);
      });
    });
  };

  const openModal = () => {
    const neighborhood = modalInfo.neighborhood
      ? modalInfo.neighborhood
      : 'Seattle';
    return (
      <QuestionModal
        startOpen={true}
        acceptText='Add to Itinerary'
        navigateAwayAction={() => {
          handleAddItinItem()
          setModalInfo(null)
        }}
        declineText='Back'
        closeAction={() => setModalInfo(null)}
      >
        <h2>{modalInfo.name}</h2>
        <p>
          {neighborhood + ' • ' + modalInfo.cuisine + ' • ' + modalInfo.price}
        </p>
        <p>{modalInfo.blurb}</p>
        <a href={modalInfo.make_res_link} target='_blank'>
          Reservation Link
          </a>
        <div className={classes.timePicker}>
          <MuiPickersUtilsProvider className={classes.timePicker} utils={DateFnsUtils}>
            <KeyboardTimePicker
              disableToolbar
              variant='inline'
              minutesStep={15}
              margin='normal'
              label='Time'
              value={resTime}
              onChange={time => setResTime(time)}
            />
          </MuiPickersUtilsProvider>
        </div>
      </QuestionModal>
    );
  };

  const createMapUrl = (name, address) => {
    const urlEscaped = encodeURI(name + ' ' + address);
    const iFrameUrl = `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${urlEscaped}`;
    setIFrame(iFrameUrl);
  };

  const handleAddItinItem = () => {
    const itinInfo = {
      ...modalInfo,
      reservation_time: resTime,
      map_iframe_url: iFrame
    };
    addItinItem(userData, itinInfo, requestId).then(res => {
      setRequest(res.request);
    });
  };

  const renderFilter = () => {
    return (
      <Filter styles={classes.filter} value={filter} onChange={e => {
        setFilter(e.target.value)
        setIsFetching(true)
        scrapeNames(userData, moment(request.start_time).format('YYYY-MM-DD'), e.target.value)
          .then(json => {
            setIsFetching(false)
            setScrapedNames(json)
          })
      }}>
        <option value='All'>All</option>
        {neighborhoods.map(n => {
          return <option key={n.id} value={n.name}>{n.name}</option>
        })}
      </Filter>
    );
  };

  const displayPackages = () => {
    return itinPackages.map(pkg => {
      return (
        <li key={pkg.id}>
          <MyLink destination={`/admin/itinerary_packages/${pkg.id}`}>
            {pkg.price_range.split(' ')[0]} - {pkg.neighborhood} - {pkg.title}
          </MyLink>
          <Button type='button' onClick={() => handleApplyPackage(pkg.id)}>
            Apply
          </Button>
        </li>
      );
    });
  };

  const displayScrapedVenues = () => {
    return isFetching ? loading() : scrapedNames.length
      ? scrapedNames.filter((item, i) => {
        return scrapedNames.indexOf(scrapedNames.find(value => value.name === item.name)) === i
      }).map((info, idx) => (
        <li
          className={classes.scrapedListItem}
          key={idx}
          onClick={() => {
            scrapeSinglePage(userData, info).then(infoJson => {
              setModalInfo(infoJson);
              createMapUrl(infoJson.name, infoJson.address);
            });
          }}
        >
          {info.name}
        </li>
      ))
      : <p>There are no venues available for that specification.</p>;
  };

  const displayVenues = () => {
    const buttonText = singleVenue ? 'Packages' : 'Single Venues'
    const title = !singleVenue ? 'Packages' : `Venues for ${moment(request.start_time).format('MMMM Do YYYY')}`
    return (
      <>
        <Button styles={classes.button} onClick={() => setSingleVenue(!singleVenue)}>{buttonText}</Button>
        <ListContainer title={title} filter={singleVenue ? renderFilter() : null}>
          {singleVenue ? displayScrapedVenues() : displayPackages()}
        </ListContainer>
      </>
    );
  };

  const loading = () => {
    return <p>Loading...</p>
  }

  return request ? (
    <>
      <div className={size.width >= 800 ? classes.column : classes.column1}>
        <RequestContainer
          className={classes.requestContainer}
          title='Request'
          request={request}
          admin={true}
        >
          {new Date(request.start_time) >= new Date() ? (
            <div className={classes.buttonDiv}>
              <Button type='button' onClick={handleComplete}>
                {request.fulfilled ? 'Mark as incomplete' : 'Mark as complete'}
              </Button>
              {request.fulfilled ? (
                <Button type='button' onClick={handleMessage}>
                  Alert (DEMO ONLY)
                </Button>
              ) : null}
            </div>
          ) : (
              <Review admin={true} request={request} userData={userData} />
            )}
          <Button styles={classes.contactBtn} onClick={() => window.open(`mailto:${request.user.email}?subject=Message Regarding Your ${moment(request.start_time).format('MM/DD/YYYY')} Date`)}>Contact User</Button>
        </RequestContainer>
        {showVenues ? (
          <ItineraryDisplay
            items={request.itinerary_items}
            admin={true}
            handleRemove={handleRemove}
          >
            {!request.itinerary_items.length ? <p className={classes.emptyItin}>Add some venues!</p> : null}
          </ItineraryDisplay>
        ) : null}
      </div>
      <div className={size.width >= 800 ? classes.column : classes.column2}>
        {showVenues ? (
          displayVenues()
        ) : (
            <ItineraryDisplay
              items={request.itinerary_items}
              admin={true}
              handleRemove={handleRemove}
            >
              {!request.fulfilled ? (
                <Button
                  styles={classes.addBtn}
                  type='button'
                  onClick={() => setShowVenues(true)}
                >
                  Add to Itinerary
                </Button>
              ) : null}
            </ItineraryDisplay>
          )}
      </div>
      {modalInfo ? openModal() : null}
    </>
  ) : null;
};

export default AdminRequestShow;
