import React from "react";
import {
  withState,
  withHandlers,
  renameProps,
  withProps,
  compose
} from "recompose";
import SingleFieldForm from "../single-field-form/single-field-form";

const enhance = compose(
  renameProps({
    value: "ownValue",
    onChange: "handleChange"
  }),
  withState("value", "updateValue", ({ ownValue }) => ownValue),
  withHandlers({
    onChange: ({ updateValue }) => event => {
      updateValue(event.target.value);
    },
    onSubmit: ({ value, handleChange }) => event => {
      event.preventDefault();
      handleChange(value);
    }
  }),
  withProps({ labelText: "Username" })
);

const UsernameForm = enhance(SingleFieldForm);

export default UsernameForm;
