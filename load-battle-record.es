import { join } from 'path-extra'
import zlib from 'zlib'
import fs from 'fs'

const {APPDATA_PATH} = window

const getBattleRecordFilePath = id =>
  join(APPDATA_PATH, 'battle-detail', `${id}.json.gz`)

const loadBattleRecord = id => {
  try {
    const fp = getBattleRecordFilePath(id)
    const content = zlib.unzipSync(fs.readFileSync(fp)).toString()
    return JSON.parse(content)
  } catch (e) {
    console.error(`failed to load record for ${id}, ${e}`)
  }
}

export { loadBattleRecord }
