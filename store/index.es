import { bindActionCreators } from 'redux'
import { store } from 'views/create-store'
import { modifyObject } from 'subtender'

const initState = {
  recordMeta: {},
  // record id => record
  battleRecords: {},
  ui: {
    mapId: null,
    recordId: null,
  },
}

const reducer = (state = initState, action) => {
  if (action.type === '@poi-plugin-kc3replay-export@recordMeta@Replace') {
    const {newState} = action
    return modifyObject('recordMeta', () => newState)(state)
  }

  if (action.type === '@poi-plugin-kc3replay-export@ui@Modify') {
    const {modifier} = action
    return modifyObject('ui', ui => modifier(ui))(state)
  }

  return state
}

const actionCreator = {
  recordMetaReplace: newState => ({
    type: '@poi-plugin-kc3replay-export@recordMeta@Replace',
    newState,
  }),
  uiModify: modifier => ({
    type: '@poi-plugin-kc3replay-export@ui@Modify',
    modifier,
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
  initState,
  reducer,
  actionCreator,
  mapDispatchToProps,
  withBoundActionCreator,
  asyncBoundActionCreator,
}
