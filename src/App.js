import React from 'react'
import './App.css'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import axios from 'axios'

const Weapon = (props) => {
  return (
    <button
      data-test={`move_${props.type}`}
      onClick={() => { props.onPlayerMove({ move: props.type }) }}>
      {props.type}
    </button>
  )
}

class LocalPlayer extends React.Component {
  state = {
    move: '',
    name: ''
  }

  constructor (props) {
    super(props)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.submit = this.submit.bind(this)
    this.setMove = this.setMove.bind(this)
  }

  handleNameChange (event) {
    this.setState({ name: event.target.value })
  }

  setMove (move) {
    this.setState(move)
  }

  submit (event) {
    event.preventDefault()
    const { name, move } = this.state
    this.props.onPlayerMove({ name, move })
  }

  render () {
    return (
      <form onSubmit={this.submit}>
        <input
          data-test="name_input"
          value={this.state.name}
          onChange={this.handleNameChange}
          type="text"
          placeholder="Your name"
          onFocus={(e) => e.target.placeholder = ''}
          onBlur={(e) => e.target.placeholder = 'Your name'}
        />
        <WeaponSelect onPlayerMove={this.setMove}/>
      </form>
    )
  }
}

class WeaponSelect extends React.Component {
  render () {
    return (
      <div>
        <Weapon onPlayerMove={this.props.onPlayerMove} type="ROCK"></Weapon>
        <Weapon onPlayerMove={this.props.onPlayerMove} type="PAPER"></Weapon>
        <Weapon onPlayerMove={this.props.onPlayerMove} type="SCISSORS"></Weapon>
      </div>
    )
  }
}

// should really just display a point-of-view and game-status dependent middle view
class GameStatus extends React.Component {

  constructor (props) {
    super(props)
    if (props.game) {
      this.state = {
        game: props.game,
      }
    }
  }

  pending () {
    if (this.props.isOwnGame) {
      return (
        <div>
          <p>Send this link to your opponent!</p>
          <a href={window.location.href}>{window.location.href}</a>
        </div>
      )
    }

    return (
      <p>not created by you</p>
    )
  }

  complete () {
    const { isOwnGame } = this.props
    const { game } = this.state

    let localPlayer
    let remotePlayer

    if (isOwnGame) {
      localPlayer = game.playerOne
      remotePlayer = game.playerTwo
    } else {
      localPlayer = game.playerTwo
      remotePlayer = game.playerOne
    }

    isOwnGame ? localPlayer = game.playerOne : localPlayer = game.playerTwo

    return (
      <div>
        <p>You: {localPlayer.name} {localPlayer.outcome} </p>
        <p>vs: {remotePlayer.name} {remotePlayer.outcome} </p>
      </div>
    )
  }

  notStarted () {
    return (
      <p> Enter name and make a move to play! </p>
    )
  }

  render () {
    if (!this.state) return this.notStarted()

    const isCompleteGame = this.state.game.playerOne && this.state.game.playerTwo
    if (isCompleteGame) return this.complete()

    return this.pending()
  }
}

class ExistingGame extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      isLoading: true,
      game: null
    }
  }

  async componentWillMount () {
    await this.getGame(this.props.match.params.id)
  }

  getGame = async (id) => {
    let { data } = await axios({
      method: 'get',
      url: `http://localhost:3001/api/games/${id}`,
    })

    if (data.game) data = data.game
    this.setState({ game: data, isLoading: false })
  }

  putMove = async ({ move, name }) => {
    this.setState({ isLoading: true })
    const { data } = await axios({
      method: 'put',
      url: `http://localhost:3001/api/games/${this.state.game.id}/move`,
      data: { name, move }
    })

    this.setState({ game: data.game, isLoading: false })
  }

  gameIsComplete = () => { return this.state && this.state.game && this.state.game.playerOne && this.state.game.playerTwo}
  isOwnGame = () => { return localStorage.getItem(this.props.match.params.id)}

  render () {
    const { game, isLoading } = this.state
    if (isLoading) return (<p>Loading...</p>)

    const status = this.gameIsComplete() ? 'Complete' : 'Pending'

    return (
      <div>
        <GameStatus
          status={status}
          isOwnGame={this.isOwnGame()}
          game={game}
        />

        {!this.isOwnGame() && status !== 'Complete' &&

        <LocalPlayer
          defaultName="Player Two"
          onPlayerMove={this.putMove}/>
        }
      </div>
    )
  }
}

class CreateGame extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      isLoaded: false,
      game: null
    }
  }

  postMove = async ({ name, move }) => {
    let { data } = await axios({
      method: 'post',
      url: 'http://localhost:3001/api/games',
      data: {
        name, move
      },
      json: true
    })

    this.setState({
      game: data
    })

    localStorage.setItem(data.id, name)
  }

  setName = (name) => {
    this.setState({ name })
  }

  render () {
    const { game } = this.state
    const { setName, postMove } = this

    if (game && game.id) {
      return <Redirect to={`/game/${game.id}`}/>
    }

    return (
      <div className="createGame">
        <h1>Create</h1>

        <GameStatus/>

        <LocalPlayer
          defaultName="Player One"
          onNameChange={setName}
          onPlayerMove={postMove}
        />
      </div>
    )
  }
}

function App () {
  return (
    <BrowserRouter>
      <Switch>

        <Route path="/game/:id" component={ExistingGame}/>

        <Route path="/" component={CreateGame}/>

      </Switch>
    </BrowserRouter>
  )
}

export default App
