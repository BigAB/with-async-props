import React from "react";

const SingleFieldForm = ({ labelText, value, onSubmit, onChange }) =>
  <form onSubmit={onSubmit}>
    <label>
      {labelText}:
      <input type="text" value={value} onChange={onChange} />
    </label>
    <input type="submit" value="Submit" />
  </form>;

export default SingleFieldForm;
