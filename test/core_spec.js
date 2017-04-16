import {List, Map, fromJS} from 'immutable';
import {expect} from 'chai';

import {setLoginData, setPaths, addInstalledMods, addOnlineMods} from '../src/core';

describe('application logic', () => {
  describe('set user data', () => {
    it('sets login data', () => {
      const state = new Map({
        userData: new Map(),
        mods: new Map()
      })
      const nextState = setLoginData(state.getIn(['userData']), 'my_username', 'my_token')
      expect(nextState).to.equal(fromJS({
        account: {
          username: 'my_username',
          token: 'my_token'
        }
      }))
    })

    it('sets paths', () => {
      const state = new Map({
        userData: new Map(),
        mods: new Map()
      })
      const nextState = setPaths(state.getIn(['userData']), {
        modPath: '/path/to/mods',
        savePath: '/path/to/saves',
        playerDataPath: '/path/to/player-data.json',
        executablePaths: [
          '/first/path/to/executable',
          '/second/path/to/executable'
        ]
      })
      expect(nextState).to.equal(new Map({
        paths: new Map({
          modPath: '/path/to/mods',
          savePath: '/path/to/saves',
          playerDataPath: '/path/to/player-data.json',
          executablePaths: new List([
            '/first/path/to/executable',
            '/second/path/to/executable'
          ])
        })
      }))
    })
  })

  describe('load mods', () => {
    it('sets installed mods', () => {
      const state = new Map({
        userData: new Map(),
        mods: new Map()
      })
      const nextState = addInstalledMods(state.get('mods'), [
        {
          name: 'mod1',
          version: '0.0.1'
        },
        {
          name: 'mod2',
          version: '0.0.2'
        }
      ])
      expect(nextState.getIn(['installed'])).to.equal(new Map({
        mod1: new Map({
          name: 'mod1',
          version: '0.0.1'
        }),
        mod2: new Map({
          name: 'mod2',
          version: '0.0.2'
        })
      }))
    })

    it('sets online mods', () => {
      const state = new Map({
        userData: new Map(),
        mods: new Map()
      })
      const nextState = addOnlineMods(state.get('mods'), [
        {
          name: 'mod1',
          title: 'Mod1'
        },
        {
          name: 'mod2',
          title: 'Mod2'
        }
      ])
      expect(nextState.getIn(['online'])).to.equal(new Map({
        mod1: new Map({
          name: 'mod1',
          title: 'Mod1'
        }),
        mod2: new Map({
          name: 'mod2',
          title: 'Mod2'
        })
      }))
    })

    it('adds online mods', () => {
      const state = new Map().setIn(['mods', 'online'], new Map({
        mod1: new Map({
          name: 'mod1',
          title: 'Mod1'
        }),
        mod2: new Map({
          name: 'mod2',
          title: 'Mod2'
        })
      }))
      const nextState = addOnlineMods(state.get('mods'), [
        {
          name: 'mod3',
          title: 'Mod3'
        }
      ])
      expect(nextState.getIn(['online'])).to.equal(new Map({
        mod1: new Map({
          name: 'mod1',
          title: 'Mod1'
        }),
        mod2: new Map({
          name: 'mod2',
          title: 'Mod2'
        }),
        mod3: new Map({
          name: 'mod3',
          title: 'Mod3'
        })
      }))
    })
  })
})
