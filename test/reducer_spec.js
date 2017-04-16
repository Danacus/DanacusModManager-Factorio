import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';
import reducer from '../src/reducer'

describe('reducer', () => {
  it('can be used with reduce', () => {
    const actions = [
      {type: 'SET_LOGIN_DATA', username: 'my_username', token: 'my_token'},
      {type: 'SET_PATHS',
        paths: {
          modPath: '/path/to/mods',
          savePath: '/path/to/saves',
          playerDataPath: '/path/to/player-data.json',
          executablePaths: [
            '/first/path/to/executable',
            '/second/path/to/executable'
          ]
        }
      },
      {type: 'ADD_INSTALLED_MODS',
        installedMods: [
          {
            name: 'mod1',
            version: '0.0.1'
          },
          {
            name: 'mod2',
            version: '0.0.2'
          }
        ]
      },
      {type: 'ADD_INSTALLED_MODS',
        installedMods: [
          {
            name: 'mod3',
            version: '0.0.3'
          }
        ]
      }
    ]
    const finalState = actions.reduce(reducer, new Map({
      userData: new Map(),
      mods: new Map()
    }))

    expect(finalState).to.equal(
      new Map({
        mods: new Map({
          installed: new Map({
            mod1: new Map({
              name: 'mod1',
              version: '0.0.1'
            }),
            mod2: new Map({
              name: 'mod2',
              version: '0.0.2'
            }),
            mod3: new Map({
              name: 'mod3',
              version: '0.0.3'
            })
          })
        }),
        userData: new Map({
          account: new Map({
            username: 'my_username',
            token: 'my_token'
          }),
          paths: new Map({
            modPath: '/path/to/mods',
            savePath: '/path/to/saves',
            playerDataPath: '/path/to/player-data.json',
            executablePaths: new List([
              '/first/path/to/executable',
              '/second/path/to/executable'
            ])
          })
        })
      })
    )
  })
})
