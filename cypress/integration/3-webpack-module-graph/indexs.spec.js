context ('graph e2e test', () => {
  beforeEach (() => {
    cy.intercept ('GET', '**/data.js').as ('getData')
    cy.visit (`/`)
  })
  it ('should xhr is successful', function () {

    cy.wait ('@getData').its ('response.statusCode').should ('be.oneOf', [200, 304])
    cy.window ().then (window => {
      cy.writeFile ('cypress/fixtures/originTreeNodeData.json', window.originGraphNodeData)
      cy.writeFile ('cypress/fixtures/originGraphNodeData.json', window.originGraphNodeData)
      cy.writeFile ('cypress/fixtures/optimizeTreeNodeData.json', window.optimizeTreeNodeData)
      cy.writeFile ('cypress/fixtures/optimizeGraphNodeData.json', window.optimizeGraphNodeData)
    })
  })

  it ('should button is available', function () {
    cy.get ('#model').as ('btn-model')

    cy.get ('#button')
    .should ('have.text', 'optimized')
    .click ()
    .wait (1000)
    .should ('have.text', 'original')

    cy.get ('#button1')
    .should ('have.text', 'graph')
    .click ()
    .wait (1000)
    .should ('have.text', 'tree')
  })
})