/* eslint no-console: 0 */
import $$observable from "symbol-observable";
import {
  withProps,
  componentFromStreamWithConfig,
  createEagerFactory,
  setDisplayName,
  wrapDisplayName
} from "recompose";

const identity = t => t;

export const mapAsyncPropsStreamWithAsyncFn = (asyncFn, pending) => {
  const componentFromStream = componentFromStreamWithConfig({
    fromESObservable: identity,
    toESObservable: identity
  });
  return BaseComponent => {
    const factory = createEagerFactory(BaseComponent);
    return componentFromStream(props$ => ({
      subscribe(observer) {
        const subscription = props$.subscribe({
          next(childProps) {
            observer.next(factory(pending));
            asyncFn(childProps).then(
              newProps => observer.next(factory(newProps)),
              err => observer.error(err)
            );
            return observer;
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

export const withAsyncProps = (asyncFn, pending, options = {}) => {
  const hoc = mapAsyncPropsStreamWithAsyncFn(asyncFn, pending);

  if (process.env.NODE_ENV !== "production") {
    return BaseComponent =>
      setDisplayName(wrapDisplayName(BaseComponent, "withAsyncProps"))(
        hoc(BaseComponent)
      );
  }
  return hoc;
};

export default withAsyncProps;
