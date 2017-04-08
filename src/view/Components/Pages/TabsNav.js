import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
// From https://github.com/oliviertassinari/react-swipeable-views
import SwipeableViews from 'react-swipeable-views';
import InstalledMods from './InstalledMods/InstalledMods'
import OnlineMods from './OnlineMods/OnlineMods'

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  slide: {
    padding: 0,
  },
}

export default class TabsNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      slideIndex: 0,
    }
    this.handleChange = (value) => {
      this.setState({
        slideIndex: value,
      })
    }
  }

  render() {
    return (
      <div>
        <Tabs
          onChange={this.handleChange}
          value={this.state.slideIndex}
        >
          <Tab label="News" value={0} />
          <Tab label="Installed Mods" value={1} />
          <Tab label="Online Mods" value={2} />
          <Tab label="ModPacks" value={3} />
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <div style={styles.slide}>
            <h2 style={styles.headline}>Hi</h2>
            Welcome to Danacus Mod Manager for Factorio!!!<br />
          </div>
          <div style={styles.slide}>
            <InstalledMods></InstalledMods>
          </div>
          <div style={styles.slide}>
            <OnlineMods></OnlineMods>
          </div>
          <div style={styles.slide}>
            ModPacks
          </div>
        </SwipeableViews>
      </div>
    )
  }
}
