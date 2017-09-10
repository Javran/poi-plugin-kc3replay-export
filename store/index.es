import _ from 'lodash'
import { bindActionCreators } from 'redux'
import { store } from 'views/create-store'
import { modifyObject } from 'subtender'
import { convertReplay } from '../convert-replay'

const initState = {
  recordMeta: {},
  // record id => record
  battleRecords: {},
  ui: {
    mapId: null,
    recordId: null,
    activePage: 1,
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

  if (action.type === '@poi-plugin-kc3replay-export@battleRecords@Add') {
    const {id, record} = action
    return modifyObject(
      'battleRecords',
      modifyObject(
        id, () => record
      )
    )(state)
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
  battleRecordsAdd: (id, record) => ({
    type: '@poi-plugin-kc3replay-export@battleRecords@Add',
    id, record,
  }),
  requestBattleRecord: recordId => (dispatch, getState) =>
    setTimeout(() => {
      // TODO: quick and dirty
      const state = _.get(getState(), ['ext','poi-plugin-kc3replay-export','_'])
      const {battleRecords, ui} = state
      const {mapId} = ui
      if (!_.isEmpty(battleRecords[recordId]))
        return

      const recordMetaList = _.get(state.recordMeta, mapId, [])
      const recordMetaInd = recordMetaList.findIndex(record =>
        (Array.isArray(record) ? record[0] : record).id === recordId)

      if (recordMetaInd === -1) {
        console.warn(`invalid record id: ${recordId}`)
      }

      try {
        const recordMeta = recordMetaList[recordMetaInd]
        dispatch(actionCreator.battleRecordsAdd(recordId, convertReplay(recordMeta)))
      } catch (e) {
        console.error(`error while processing record ${recordId}`, e)
      }
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
