import React, { Component } from "react";
import ReactTestRenderer from "react-test-renderer";
import { expect } from "chai";
import {
  withAsyncProps,
  mapAsyncProps,
  withAsyncPropsOnChange
} from "../src/with-async-props";
import "steal-mocha";
import "babel-polyfill";

describe("with-async-props (The Package)", () => {
  const BaseComponent = props => <div {...props} />;

  describe("withAsyncProps()", () => {
    it("should merge child props and the resolved value of asyncPropsMapper function passed", done => {
      const deferred = Deferred();
      const Enhance = withAsyncProps(async () => deferred);
      const EnhancedComponent = Enhance(BaseComponent);
      const renderer = ReactTestRenderer.create(
        <EnhancedComponent baz="zap" />
      );
      const div = renderer.toJSON();
      expect(div.props).to.deep.equal({
        baz: "zap"
      });
      deferred.resolve({ foo: "bar" });
      // I wonder if there is a better way to test this - BigAB
      setImmediate(() => {
        expect(renderer.toJSON().props).to.deep.equal({
          foo: "bar",
          baz: "zap"
        });
        done();
      });
    });

    describe("pending props", () => {
      it("should merge the pending props with child props until the returned promise is settled", done => {
        const deferred = Deferred();
        const Enhance = withAsyncProps(async () => deferred, {
          loading: true
        });
        const EnhancedComponent = Enhance(BaseComponent);
        const renderer = ReactTestRenderer.create(
          <EnhancedComponent foo={"bar"} zap="profigliano" />
        );
        const div = renderer.toJSON();
        expect(div.props).to.deep.equal({
          loading: true,
          foo: "bar",
          zap: "profigliano"
        });
        deferred.resolve({ baz: true, zap: "bang" });

        setImmediate(() => {
          expect(renderer.toJSON().props).to.deep.equal({
            baz: true,
            foo: "bar",
            zap: "bang"
          });
          done();
        });
      });

      it("should accept a function as a pendingProps argument, which recieves a props argument and the return value is the new childProps", done => {
        const deferred = Deferred();
        const Enhance = withAsyncProps(
          async () => deferred,
          props => {
            expect(props).to.deep.equal({ zap: "bang" });
            return { baz: true };
          }
        );
        const EnhancedComponent = Enhance(BaseComponent);
        const renderer = ReactTestRenderer.create(
          <EnhancedComponent zap={"bang"} />
        );
        const div = renderer.toJSON();
        expect(div.props).to.deep.equal({ baz: true });
        deferred.resolve({ foo: "bar" });
        setImmediate(() => {
          expect(renderer.toJSON().props).to.deep.equal({
            zap: "bang",
            foo: "bar"
          });
          done();
        });
      });
    });

    describe("error props", () => {
      it("should add a `reason` property to the child props if the asyncProps promise is rejected, if there is no rejectedProps passed", done => {
        const deferred = Deferred();
        const Enhance = withAsyncProps(async () => deferred);
        const EnhancedComponent = Enhance(BaseComponent);
        const renderer = ReactTestRenderer.create(
          <EnhancedComponent foo="bar" />
        );
        const div = renderer.toJSON();
        expect(div.props).to.deep.equal({
          foo: "bar"
        });
        const err = Error("This is the Error");
        deferred.reject(err);
        setImmediate(() => {
          expect(renderer.toJSON().props).to.deep.equal({
            foo: "bar",
            reason: err
          });
          done();
        });
      });

      it("should merge rejectedProps into the child props if the asyncProps promise is rejected, if rejectedProps is a object", done => {
        const deferred = Deferred();
        const Enhance = withAsyncProps(async () => deferred, null, {
          showError: true
        });
        const EnhancedComponent = Enhance(BaseComponent);
        const renderer = ReactTestRenderer.create(
          <EnhancedComponent foo="bar" />
        );
        const div = renderer.toJSON();
        expect(div.props).to.deep.equal({
          foo: "bar"
        });
        const err = Error("This is the Error");
        deferred.reject(err);
        setImmediate(() => {
          expect(renderer.toJSON().props).to.deep.equal({
            foo: "bar",
            showError: true
          });
          done();
        });
      });

      it("should pass child props the result of passing the reason to rejectedProps, if rejectedProps is a function", done => {
        const deferred = Deferred();
        const Enhance = withAsyncProps(
          async () => deferred,
          null,
          (props, reason) => {
            return { why: reason };
          }
        );
        const EnhancedComponent = Enhance(BaseComponent);
        const renderer = ReactTestRenderer.create(
          <EnhancedComponent foo="bar" />
        );
        const div = renderer.toJSON();
        expect(div.props).to.deep.equal({
          foo: "bar"
        });
        const err = Error("This is the Error");
        deferred.reject(err);
        setImmediate(() => {
          expect(renderer.toJSON().props).to.deep.equal({
            why: err
          });
          done();
        });
      });
    });

    it("should wrap the display name on the Enhanced component", () => {
      const Enhance = withAsyncProps(async () => ({}));
      const EnhancedComponent = Enhance(props => {});
      expect(EnhancedComponent.displayName).to.equal(
        "withAsyncProps(Component)"
      );
    });
  });

  describe("mapAsyncProps()", () => {
    it("should **replace** child props with the resolved value of asyncPropsMapper function passed", done => {
      const deferred = Deferred();
      const Enhance = mapAsyncProps(async () => deferred);
      const EnhancedComponent = Enhance(BaseComponent);
      const renderer = ReactTestRenderer.create(
        <EnhancedComponent baz="zap" />
      );
      const div = renderer.toJSON();
      expect(div.props).to.deep.equal({
        baz: "zap"
      });
      deferred.resolve({ foo: "bar" });
      setImmediate(() => {
        expect(renderer.toJSON().props).to.deep.equal({
          foo: "bar"
        });
        done();
      });
    });

    it("should wrap the display name on the Enhanced component", () => {
      const Enhance = mapAsyncProps(async () => ({}));
      const EnhancedComponent = Enhance(props => {});
      expect(EnhancedComponent.displayName).to.equal(
        "mapAsyncProps(Component)"
      );
    });
  });

  describe("withAsyncPropsOnChange()", () => {
    it("should accept an array of keys to check, and only run the async function, if one of those keys is changed on props", () => {
      const deferred = Deferred();
      let asyncPropsCreateDidRun = false;
      const Enhance = withAsyncPropsOnChange(["foo"], async props => {
        asyncPropsCreateDidRun = true;
        return deferred;
      });
      const EnhancedComponent = Enhance(BaseComponent);
      class WrapperComponent extends Component {
        render() {
          return <EnhancedComponent {...this.state} />;
        }
      }
      const renderer = ReactTestRenderer.create(<WrapperComponent />);
      const wrapper = renderer.getInstance();

      expect(asyncPropsCreateDidRun).to.equal(false);
      wrapper.setState({ zap: "bang" });
      expect(asyncPropsCreateDidRun).to.equal(false);
      wrapper.setState({ foo: "bar" });
      expect(asyncPropsCreateDidRun).to.equal(true);
    });

    // shouldMap function gets current props and newProps arguments
    // shouldMap = (props : Object, nextProps : Object) => Boolean
    it("should accept an `shouldMap` function to check, and only run the asyncCreateProps function, if the shouldMap function returns `true`", done => {
      const deferred = Deferred();
      let asyncPropsCreateDidRun = false;
      const Enhance = withAsyncPropsOnChange(
        (props, nextProps) => {
          return nextProps.should === "yes";
        },
        async props => {
          asyncPropsCreateDidRun = true;
          return deferred;
        }
      );
      const EnhancedComponent = Enhance(BaseComponent);
      class WrapperComponent extends Component {
        render() {
          return <EnhancedComponent {...this.state} />;
        }
      }
      const renderer = ReactTestRenderer.create(<WrapperComponent />);
      const wrapper = renderer.getInstance();

      expect(asyncPropsCreateDidRun).to.equal(false);
      wrapper.setState({ should: true }, () => {
        expect(asyncPropsCreateDidRun).to.equal(false);
        wrapper.setState({ should: "yes" }, () => {
          expect(asyncPropsCreateDidRun).to.equal(true);
          done();
        });
      });
    });

    it("should still merge/map pendingProps and rejected props like `withAsyncProps`", done => {
      const deferred = Deferred();
      const Enhance = withAsyncPropsOnChange(
        () => true,
        async () => deferred,
        { loading: true },
        {
          showError: true
        }
      );
      const EnhancedComponent = Enhance(BaseComponent);
      const renderer = ReactTestRenderer.create(
        <EnhancedComponent foo="bar" />
      );
      const div = renderer.toJSON();
      expect(div.props).to.deep.equal({
        foo: "bar",
        loading: true
      });
      const err = Error("This is the Error");
      deferred.reject(err);
      setImmediate(() => {
        expect(renderer.toJSON().props).to.deep.equal({
          foo: "bar",
          showError: true
        });
        done();
      });
    });

    it("should wrap the display name on the Enhanced component", () => {
      const Enhance = withAsyncPropsOnChange([], async () => ({}));
      const EnhancedComponent = Enhance(props => {});
      expect(EnhancedComponent.displayName).to.equal(
        "withAsyncPropsOnChange(Component)"
      );
    });
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
