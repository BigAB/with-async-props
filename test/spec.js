import React from "react";
import ReactTestRenderer from "react-test-renderer";
import { expect } from "chai";
import { withAsyncProps } from "../src/with-async-props";
import "steal-mocha";
import "babel-polyfill";

describe("with-async-props", () => {
  const BaseComponent = props => <div {...props} />;

  it("should provide the pending props until the return value resolves", done => {
    const deferred = Deferred();
    const Enhance = withAsyncProps(async () => deferred, {
      loading: true
    });
    const EnhancedComponent = Enhance(BaseComponent);
    const renderer = ReactTestRenderer.create(<EnhancedComponent />);
    const div = renderer.toJSON();
    expect(div.props).to.deep.equal({ loading: true });
    deferred.resolve({ foo: "bar" });
    // I wonder if there is a better way to test this -BigAB
    setImmediate(() => {
      expect(renderer.toJSON().props).to.deep.equal({ foo: "bar" });
      done();
    });
  });

  it("should wrap the display name on the Enhanced component", () => {
    const Enhance = withAsyncProps(async () => ({}));
    const EnhancedComponent = Enhance(props => {});
    expect(EnhancedComponent.displayName).to.equal("withAsyncProps(Component)");
  });
});

function Deferred() {
  let resolve, reject;
  const p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  p.resolve = v => (resolve(v), p);
  p.reject = e => (reject(e), p);
  return p;
}
