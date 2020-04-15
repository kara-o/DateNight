import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
    maxWidth: '600px',
    margin: '10px',
    padding: '10px'
  }
});

const Form = ({ children }) => {
  const classes = useStyles();
  return <form className={classes.form}>{children}</form>;
};

export default Form;
