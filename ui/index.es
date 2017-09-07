import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store, extendReducer } from 'views/create-store'
import { ExportMain } from './export-main'

import { loadIndex, groupRecords } from '../load-index'
// import { convertReplay } from '../convert-replay'
import { reducer, withBoundActionCreator } from '../store'

const {$} = window

$('#fontawesome-css')
  .setAttribute('href', require.resolve('font-awesome/css/font-awesome.css'))

extendReducer('poi-plugin-kc3replay-export', reducer)

setTimeout(() => {
  const records = loadIndex()
  const grouppedRecords = groupRecords(records, _.get(store.getState(),'fcd.map'))
  withBoundActionCreator(bac =>
    bac.recordMetaReplace(grouppedRecords)
  )
})

ReactDOM.render(
  <Provider store={store}>
    <div className="kc3replay-export">
      <ExportMain />
    </div>
  </Provider>,
  $("#content-root"))

// const recordInfo = grouppedRecords['pvp'][0]
// const recordInfo = grouppedRecords['39-7'][0]

// console.log(JSON.stringify(convertReplay(recordInfo)))
