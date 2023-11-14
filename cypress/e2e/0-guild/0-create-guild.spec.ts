before(() => {
  cy.clearIndexedDB()
})

describe("create guild page (without wallet)", () => {
  before(() => {
    cy.visit("/create-guild")
  })

  it("shows connect wallet modal", () => {
    cy.getByDataTest("platforms-grid").within(() => {
      cy.get("div[role='group']").first().click()
    })
    cy.getByDataTest("wallet-selector-modal")
      .should("exist")
      .within(() => {
        cy.get("button[aria-label='Close']").click()
      })

    cy.contains("Create guild without platform").click()
    cy.getByDataTest("wallet-selector-modal").should("exist")
  })
})

describe("create guild page (with wallet)", () => {
  before(() => {
    cy.visit("/create-guild")
    cy.connectWallet()
  })

  it("can create a guild without platform", () => {
    cy.contains("Create guild without platform").click()
    cy.get(".chakra-step [data-status='active'] div").should("contain.text", "2")

    cy.contains("Start from scratch").click({ force: true })
    cy.get(".chakra-step p[data-status='active']").should("contain.text", "Basic")
    cy.contains("Growth").click({ force: true })
    cy.get(".chakra-step p[data-status='active']").should("contain.text", "Growth")

    cy.contains("Next").click()

    cy.get("input[name='name']").focus().blur()
    cy.get("input[name='name'] ~ .chakra-collapse")
      .should("exist")
      .contains("This field is required")
    cy.getByDataTest("create-guild-button").should("be.disabled")
    cy.get("input[name='name']").type(
      `${Cypress.env("platformlessGuildName")} ${Cypress.env("RUN_ID")}`
    )
    cy.getByDataTest("create-guild-button").should("be.disabled")

    cy.get("input[name='socialLinks.TWITTER']").focus().blur()
    cy.get("input[name='socialLinks.TWITTER']")
      .parent()
      .siblings(".chakra-collapse")
      .contains("This field is required")
    cy.getByDataTest("create-guild-button").should("be.disabled")
    cy.get("input[name='socialLinks.TWITTER']").type("guild.xyz")
    cy.get("input[name='socialLinks.TWITTER']")
      .parent()
      .siblings(".chakra-collapse")
      .contains("Invalid Twitter URL")
    cy.getByDataTest("create-guild-button").should("be.disabled")
    cy.get("input[name='socialLinks.TWITTER']").clear().type("twitter.com/guildxyz")
    cy.getByDataTest("create-guild-button").should("be.enabled")

    cy.intercept("POST", `${Cypress.env("guildApiUrl")}/guilds`).as(
      "createGuildRequest"
    )

    cy.getByDataTest("create-guild-button").click()

    cy.wait("@createGuildRequest").its("response.statusCode").should("eq", 201)
  })
})
