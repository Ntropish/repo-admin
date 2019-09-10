import { set, lensPath, __ as _ } from './ramda/es/index.js'

const e = React.createElement

const {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  MuiThemeProvider,
  createMuiTheme,
} = MaterialUI

const useStyles = MaterialUI.makeStyles(theme => ({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    padding: '6em',
    fontFamily: 'Verdana, Geneva, sans-serif',
    fontSize: '14px',
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
  },
}))

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
})

export default function App() {
  const classes = useStyles()
  const [state, setState] = React.useState({})
  const socketRef = React.useRef(null)
  const commands = {
    log(...values) {
      console.log(...values)
    },
    set(path, value) {
      if (path[0] === 'taskStates' && path.length === 1) {
        setState(set(lensPath(path), value, state))
      }
    },
  }
  const sendCommand = sCommand =>
    socketRef.current.send(JSON.stringify(sCommand))
  React.useEffect(() => {
    const socket = new WebSocket(
      `ws://localhost:${document.body.dataset.admin}`,
    )
    socketRef.current = socket
    socket.onopen = e => {
      socket.send(JSON.stringify(['install', 'a']))
    }

    socket.onmessage = e => {
      const [command, ...args] = JSON.parse(e.data)
      commands[command](...args)
    }

    return () => socket.close()
  }, [])
  const { taskStates = {} } = state

  return e(
    MuiThemeProvider,
    { theme },
    e(
      'div',
      { className: classes.layout },
      e(Typography, { variant: 'h2' }, 'tasks'),
      e(TaskList, { taskStates, commander: sendCommand }),
    ),
  )
}

const useTaskListStyles = MaterialUI.makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
}))
function TaskList({ taskStates, commander }) {
  const classes = useTaskListStyles()
  const button = (command, task) =>
    e(
      TableCell,
      {
        align: 'right',
        style: { width: '100px' },
        onClick: () => commander([command, task]),
        size: 'small',
      },
      e(Button, { edge: 'end', 'aria-label': command }, command),
    )
  const taskRows = Object.keys(taskStates).map(task =>
    e(
      TableRow,
      { key: task },
      e(TableCell, { component: 'th', scope: 'row' }, task),
      e(
        TableCell,
        { align: 'right' },
        e(Typography, { variant: 'button' }, taskStates[task]),
      ),
      button('verify', task),
      button('install', task),
      button('uninstall', task),
    ),
  )
  return e(
    Paper,
    { className: classes.root },
    e(Table, { className: classes.table }, e(TableBody, null, ...taskRows)),
  )
}
