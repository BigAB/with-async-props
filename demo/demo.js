import React, { Component } from "react";
import { render } from "react-dom";
import {
  compose,
  mapProps,
  pure,
  branch,
  renderComponent,
  defaultProps,
  withProps,
  withState,
  shouldUpdate,
  setDisplayName,
  onlyUpdateForKeys,
  withPropsOnChange
} from "recompose";
import {
  withAsyncProps,
  mapAsyncProps,
  withAsyncPropsOnChange
} from "~/with-async-props";
import Spinner from "./spinner/spinner";
import UsernameForm from "./username-form/username-form";
import SuffixForm from "./suffix-form/suffix-form";
import "babel-polyfill";

function Deferred() {
  let p, resolve, reject;
  p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  p.resolve = resolve;
  p.reject = reject;
  return p;
}

function waitThenResolve(seconds, value) {
  const d = Deferred();
  setTimeout(() => d.resolve(value), seconds * 1000);
  return d;
}

function waitThenReject(seconds, reason) {
  const d = Deferred();
  setTimeout(() => d.reject(reason), seconds * 1000);
  return d;
}

const users = [
  {
    name: "Adam L Barrett",
    email: "bigab@live.ca",
    username: "BigAB"
  },
  {
    name: "Mark Stahl",
    email: "stahlingrad@xmax.xio",
    username: "mark"
  },
  {
    name: "Devon Shire",
    email: "lifeintheshire@hobbiton.me",
    username: "devo"
  }
];

async function fetchUser(username) {
  if (!username) {
    throw Error("Cannot fetch user without a username");
  }
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );
  if (user === void 0) {
    return waitThenReject(1.5, Error("404 - Username not found"));
  }
  return waitThenResolve(1.5, user);
}

const ErrorMessage = ({ error, children }) => {
  return (
    <div className="error-message" style={{ color: "red" }}>
      {error}
      <div>
        {children}
      </div>
    </div>
  );
};

const enhanceWithUser = compose(
  withAsyncPropsOnChange(
    ["username"],
    async props => {
      if (!props.username) {
        return props; // use default subject
      }
      const user = await fetchUser(props.username);
      return { user };
    },
    { isLoading: true },
    (props, reason) => ({
      ...props,
      error: `Dang, couldn't find ${props.username} in user list`
    })
  ),
  branch(props => props.isLoading, renderComponent(Spinner)),
  branch(props => props.error, renderComponent(ErrorMessage)),
  mapProps(({ user, suffix, children }) => ({
    subject: user && user.name,
    suffix: suffix,
    children: children
  }))
);

const HelloWorld = ({ subject = "World", suffix = "", children }) =>
  <h1>
    Hello {subject}
    {suffix}
    <small>{children}</small>
  </h1>;

const HelloUser = compose(setDisplayName("HelloUser"), enhanceWithUser)(
  HelloWorld
);

const App = compose(
  withState("username", "updateUsername", "bigab"),
  withState("suffix", "updateSuffix", "!")
)(({ username, updateUsername, suffix, updateSuffix }) =>
  <div>
    <UsernameForm value={username} onChange={updateUsername} />
    <HelloUser username={username} suffix={suffix}>
      <div>Child Stuff</div>
    </HelloUser>
    <SuffixForm value={suffix} onChange={updateSuffix} />
  </div>
);

render(<App />, document.getElementById("demo"));
