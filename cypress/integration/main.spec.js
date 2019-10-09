
const baseUrl = 'http://localhost:3000'

describe('React Paper Scissors', () => {

  it('Entire Game Flow', () => {
    const playerOneName = 'testLars'

    cy.visit(baseUrl)
    cy.contains('Enter name and make a move to play!')

    cy.get('[data-test=name_input]').type(playerOneName)

    cy.get('[data-test=move_ROCK]').click()

    cy.contains('You created this game')

    cy.clearLocalStorage()
    cy.reload(true)

    const playerTwoName = 'opponent'

    cy.contains('not created by you')
    cy.get('[data-test=name_input]').type(playerTwoName)
    cy.get('[data-test=move_SCISSORS]').click()

    cy.contains('LOSE')
    cy.contains('WIN')


  })

  it('Remembers who created the game')

  it('Opens a game as ')



})
