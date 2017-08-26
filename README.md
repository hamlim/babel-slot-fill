# Babel-Slot-Fill 

## ⚠️**This is still in active development**⚠️

Babel Slot Fill is a simple babel plugin that allows you to write React components like this:

```JSX
const Heading = withSlots(props => (
  <header>
    <slot as="title" />
  </header>
));

const MyApp = props => (
  <main>
    <Heading>
      <Fill name="title">
        <h1>Title</h1>
      </Fill>
    </Heading>
  </main>
);
```

which compiles out to:

```JSX
const Heading = props => (
  <header>
    {props.title}
  <header>
);

const MyApp = props => (
  <main>
    <Heading title={<h1>Title</h1>} />
  </main>
);
```

This gives you the developer experience of composing components while also allowing you to pass in more than just `children` to
your components.

