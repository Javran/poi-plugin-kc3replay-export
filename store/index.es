import { bindActionCreators } from 'redux'
import { store } from 'views/create-store'

const initState = {
  recordMeta: {},
}

const reducer = (state = initState, action) => {
  if (action.type === '@poi-plugin-kc3replay-export@recordMeta@Replace') {
    const {newState} = action
    return newState
  }
  return state
}

const actionCreator = {
  recordMetaReplace: newState => ({
    type: '@poi-plugin-kc3replay-export@recordMeta@Replace',
    newState,
  }),
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreator, dispatch)

const withBoundActionCreator = (func, dispatch=store.dispatch) =>
  func(mapDispatchToProps(dispatch))

const asyncBoundActionCreator = (func, dispatch=store.dispatch) =>
  dispatch(() => setTimeout(() =>
    withBoundActionCreator(func, dispatch)))

export {
  reducer,
  actionCreator,
  mapDispatchToProps,
  withBoundActionCreator,
  asyncBoundActionCreator,
}
