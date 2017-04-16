import React from 'react';
import './App.scss';

import TabsContainer from './Components/Tabs/TabsContainer'

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <TabsContainer />
  }
}
