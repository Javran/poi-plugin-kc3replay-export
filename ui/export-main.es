import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { mapIdListSelector } from '../selectors'
import { PTyp } from '../ptyp'

const pprMapId = x =>
  x === 'pvp' ? 'Practice' : x

class ExportMainImpl extends Component {
  static propTypes = {
    mapIdList: PTyp.array.isRequired,
  }

  render() {
    const {mapIdList} = this.props
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1}}>
          <ListGroup>
            {
              mapIdList.map(mapId => (
                <ListGroupItem key={mapId} style={{padding: '5px 10px'}}>
                  {pprMapId(mapId)}
                </ListGroupItem>
              ))
            }
          </ListGroup>
        </div>
        <div style={{flex: 4}}>
          TODO
        </div>
      </div>
    )
  }
}

const ExportMain = connect(
  state => {
    return {
      mapIdList: mapIdListSelector(state),
    }
  }
)(ExportMainImpl)

export { ExportMain }
