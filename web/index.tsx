import { MountableElement, render } from 'solid-js/web';

function HelloWorld() {
  return <div>Nyako!</div>;
}

render(() => <HelloWorld />, document.getElementById('root') as MountableElement)