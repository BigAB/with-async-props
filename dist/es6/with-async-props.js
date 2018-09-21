/* eslint no-console: 0 */
import { createFactory } from "react";
import $$observable from "symbol-observable";
import {
  componentFromStreamWithConfig,
  setDisplayName,
  wrapDisplayName,
  shallowEqual
} from "recompose";

const identity = t => t;
const STEADY_CONTEXT = Symbol("with-async-props-steady-context");
const LAST_RESULT = Symbol("with-async-props-last-result");
const LAST_PROPS = Symbol("with-async-props-last-props");
const pick = (obj = {}, keys) => {
  const result = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const mapAsyncPropsStreamWithAsyncFn = (
  asyncCreateProps,
  pendingProps,
  rejectedProps,
  shouldMap = () => true
) => {
  const componentFromStream = componentFromStreamWithConfig({
    fromESObservable: identity,
    toESObservable: identity
  });
  const mapPendingProps =
    typeof pendingProps === "function"
      ? pendingProps
      : props => ({ ...props, ...pendingProps });
  const mapErrorProps =
    typeof rejectedProps === "function"
      ? rejectedProps
      : (props, reason) =>
          rejectedProps ? { ...props, ...rejectedProps } : { ...props, reason };

  return BaseComponent => {
    const factory = createFactory(BaseComponent);

    return componentFromStream(props$ => ({
      subscribe(observer) {
        observer[STEADY_CONTEXT] = {};
        observer[LAST_PROPS] = {};

        const subscription = props$.subscribe({
          next(childProps) {
            // immediatly pass pending props
            if (shouldMap(observer[LAST_PROPS], childProps)) {
              observer.next(factory(mapPendingProps(childProps)));
              // then run asyncCreateProps and pass props when it resolves
              asyncCreateProps
                .call(observer[STEADY_CONTEXT], childProps)
                .then(newProps => {
                  observer.next(factory(newProps));
                  observer[LAST_PROPS] = childProps;
                  observer[LAST_RESULT] = newProps;
                })
                .catch(reason => {
                  const newProps = mapErrorProps(childProps, reason);
                  observer.next(factory(newProps));
                  observer[LAST_PROPS] = childProps;
                  observer[LAST_RESULT] = newProps;
                });
              return observer;
            }
            observer.next(factory({ ...observer[LAST_RESULT], ...childProps }));
            observer[LAST_PROPS] = childProps;
          },
          error() {
            // I wonder what makes this get called - BigAB
          },
          complete() {
            // not sure what I need to to here - BigAB
          }
        });

        return {
          unsubscribe: () => subscription.unsubscribe()
        };
      },
      [$$observable]() {
        return this;
      }
    }));
  };
};

export const withAsyncProps = (
  asyncCreateProps,
  pendingProps,
  rejectedProps
) => {
  const hoc = mapAsyncPropsStreamWithAsyncFn(
    props =>
      asyncCreateProps(props).then(newProps => {
        return { ...props, ...newProps };
      }),
    pendingProps,
    rejectedProps
  );

  if (process.env.NODE_ENV !== "production") {
    return BaseComponent =>
      setDisplayName(wrapDisplayName(BaseComponent, "withAsyncProps"))(
        hoc(BaseComponent)
      );
  }
  return hoc;
};

export const mapAsyncProps = (
  asyncPropsMapper,
  pendingProps,
  rejectedProps
) => {
  const hoc = mapAsyncPropsStreamWithAsyncFn(
    asyncPropsMapper,
    pendingProps,
    rejectedProps
  );

  if (process.env.NODE_ENV !== "production") {
    return BaseComponent =>
      setDisplayName(wrapDisplayName(BaseComponent, "mapAsyncProps"))(
        hoc(BaseComponent)
      );
  }
  return hoc;
};

export const withAsyncPropsOnChange = (
  shouldMapOrKeys,
  asyncPropsMapper,
  pendingProps,
  rejectedProps
) => {
  const shouldMap =
    typeof shouldMapOrKeys === "function"
      ? shouldMapOrKeys
      : (props, nextProps) =>
          !shallowEqual(
            pick(props, shouldMapOrKeys),
            pick(nextProps, shouldMapOrKeys)
          );

  const hoc = mapAsyncPropsStreamWithAsyncFn(
    props =>
      asyncPropsMapper(props).then(newProps => {
        return { ...props, ...newProps };
      }),
    pendingProps,
    rejectedProps,
    shouldMap
  );

  if (process.env.NODE_ENV !== "production") {
    return BaseComponent =>
      setDisplayName(wrapDisplayName(BaseComponent, "withAsyncPropsOnChange"))(
        hoc(BaseComponent)
      );
  }
  return hoc;
};

export default {
  withAsyncProps,
  mapAsyncProps,
  withAsyncPropsOnChange
};
