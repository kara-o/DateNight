import React, { useState } from "react";
import { createUser } from "../services/api";
import {
  Button,
  MyLink,
  Form,
  LoginSignUpContainer,
  MyInput,
  Errors,
} from "../../elements";

<<<<<<< HEAD:src/user/components/UserSignUp.js
const UserSignUp = (props) => {
=======
const SignUp = (props) => {
>>>>>>> 0afcdee7106953dde1a2592a68a99503f31af97b:src/user/components/Signup.js
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [errors, setErrors] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser(formData).then((json) => {
      if (!json.errors) {
        props.history.push("/login?account_confirmation_pending=true");
      } else {
        setErrors({
          fullMessages: json.errors.full_messages,
        });
      }
    });
  };

  const renderErrors = (errors) => {
    return errors.fullMessages.map((error, idx) => <li key={idx}>{error}</li>);
  };

  return (
    <LoginSignUpContainer>
      <h1 className="title-fantasy-font">Welcome</h1>
      <Form>
        {errors ? <Errors errors={errors} /> : null}
        <MyInput
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <MyInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <MyInput
          type="password"
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleChange}
          placeholder="Confirm Password"
        />
        <MyInput
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="First Name"
        />
        <MyInput
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <MyInput
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
        />
        <Button type="submit" onClick={handleSubmit}>
          Sign Up
        </Button>
      </Form>
      <MyLink destination="/login">Back</MyLink>
    </LoginSignUpContainer>
  );
};

export default UserSignUp;
