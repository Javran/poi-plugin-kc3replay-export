import _ from 'lodash'
import { modifyObject } from 'subtender'
import { createStructuredSelector } from 'reselect'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  ListGroup,
  ListGroupItem,
  Panel,
  Pagination,
  FormControl,
} from 'react-bootstrap'
import {
  mapIdListSelector,
  mapIdSelector,
  pageRangeSelector,
  activePageSelector,
  activeRecordDetailListSelector,
  battleRecordsSelector,
} from '../selectors'
import { PTyp } from '../ptyp'
import { mapDispatchToProps } from '../store'

const pprMapId = x =>
  x === 'pvp' ? 'Practice' : x

class ExportMainImpl extends Component {
  static propTypes = {
    mapIdList: PTyp.array.isRequired,
    mapId: PTyp.string,
    recordDetailList: PTyp.array.isRequired,
    pageRange: PTyp.number.isRequired,
    activePage: PTyp.number.isRequired,
    uiModify: PTyp.func.isRequired,
    requestBattleRecord: PTyp.func.isRequired,
    battleRecords: PTyp.object.isRequired,
  }

  static defaultProps = {
    mapId: null,
  }

  handleMapIdChange = mapId => () =>
    this.props.uiModify(
      _.flow(
        modifyObject('mapId', () => mapId),
        modifyObject('activePage', () => 1)
      )
    )

  handleSelectPage = activePage =>
    this.props.uiModify(
      modifyObject('activePage', () => activePage)
    )

  render() {
    const {
      mapIdList, mapId, recordDetailList, pageRange, activePage,
      battleRecords,
      requestBattleRecord,
    } = this.props
    recordDetailList.map(
      rd => requestBattleRecord(rd.id)
    )
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1}}>
          <ListGroup>
            {
              mapIdList.map(curMapId => (
                <ListGroupItem
                  onClick={this.handleMapIdChange(curMapId)}
                  key={curMapId} style={{padding: '5px 10px'}}>
                  <div className={curMapId === mapId ? 'text-primary' : ''}>
                    {pprMapId(curMapId)}
                  </div>
                </ListGroupItem>
              ))
            }
          </ListGroup>
        </div>
        <div style={{flex: 4}}>
          <Pagination
            items={pageRange}
            activePage={activePage}
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={5}
            onSelect={this.handleSelectPage}
          />
          <ListGroup>
            {
              recordDetailList.map(rd => (
                <ListGroupItem
                  key={rd.id} style={{padding: '5px 10px'}}>
                  <Panel
                    style={{padding: 0}}
                    header={
                      (<div>
                        <div>
                          {
                            (() => {
                              const tsToStr = x => String(new Date(x))
                              if (Array.isArray(rd.timeSpan)) {
                                return `${tsToStr(rd.timeSpan[0])} ~ ${tsToStr(rd.timeSpan[1])}`
                              } else {
                                return tsToStr(rd.timeSpan)
                              }
                            })()
                          }
                        </div>
                        <div style={{fontSize: '1.5em'}}>{rd.desc}</div>
                      </div>)
                    }>
                    {
                      battleRecords[rd.id] ? (
                        <FormControl
                          componentClass="textarea"
                          value={JSON.stringify(battleRecords[rd.id])}
                        />
                      ) : (<div>Loading</div>)
                    }
                  </Panel>
                </ListGroupItem>
              ))
            }
          </ListGroup>
        </div>
      </div>
    )
  }
}

const ExportMain = connect(
  createStructuredSelector({
    mapIdList: mapIdListSelector,
    mapId: mapIdSelector,
    recordDetailList: activeRecordDetailListSelector,
    pageRange: pageRangeSelector,
    activePage: activePageSelector,
    battleRecords: battleRecordsSelector,
  }),
  mapDispatchToProps,
)(ExportMainImpl)

export { ExportMain }
