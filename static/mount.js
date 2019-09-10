import App from './App.js'
import { set, lensPath, __ as _ } from './ramda/es/index.js'

const mountPoint = document.getElementById('app')

ReactDOM.render(React.createElement(App, null), mountPoint)
