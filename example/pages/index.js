import { withSlots, slot, fill } from 'slot-fill'
import React from 'react'

const Body = withSlots(props => (
  <main>
    <h1>
      <slot as="title" />
    </h1>
  </main>
))

const App = () => (
  <Body>
    <fill as="title">Hello World</fill>
  </Body>
)

export default App
