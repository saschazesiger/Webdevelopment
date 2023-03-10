/**
 * STRING_COMPETITION STRING_YEAR - STRING_TRADE - STRING_TITLE
 * Frontend - Task 1
 *
 * This file contains the unit tests performed on the frontend task.
 * You may look at the test cases but not modify them.
 *
 * !!! DO NOT EDIT THIS FILE !!!
 */

const Timer = require('../../src/timer.js')

describe('Timer', () => {
    beforeEach(() => {
        cy.visit('/cypress/fixtures/clock.html')
        cy.wait(500)
    })

    afterEach(() => {
        cy.wait(500)
    })

    it('can instantiate a timer', () => {
        cy.get('#clock').then(([el]) => {
            const startMillis = 2 * 60 * 1000
            const timer = new Timer(el, startMillis)

            expect(timer.getClock().getElement()).to.equal(el)
            expect(timer.getClock().getMillis()).to.equal(startMillis)
        })
    })

    it('throws an error when a negative number of milliseconds is set', () => {
        cy.get('#seconds-1').then(([el]) => {
            expect(() => {
                new Timer(el, -700)
            }).to.throw()
        })
    })

    it('can start a timer', () => {
        cy.clock().then((clock) => {
            cy.get('#clock').then(([el]) => {
                const startMillis = 7000
                const timer = new Timer(el, startMillis)

                timer.start()

                expect(timer.getClock().getMillis()).to.equal(startMillis)

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(6000)

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(5000)

                clock.tick(4000)
                expect(timer.getClock().getMillis()).to.equal(1000)
            })
        })
    })

    it('can pause a timer', () => {
        cy.clock().then((clock) => {
            cy.get('#clock').then(([el]) => {
                const startMillis = 7000
                const timer = new Timer(el, startMillis)

                timer.start()

                expect(timer.getClock().getMillis()).to.equal(startMillis)

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(6000)

                timer.pause()

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(6000)

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(6000)
            })
        })
    })

    it('can continue a timer', () => {
        cy.clock().then((clock) => {
            cy.get('#clock').then(([el]) => {
                const startMillis = 7000
                const timer = new Timer(el, startMillis)

                timer.start()

                expect(timer.getClock().getMillis()).to.equal(startMillis)

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(6000)

                timer.pause()

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(6000)

                timer.continue()

                clock.tick(1000)
                expect(timer.getClock().getMillis()).to.equal(5000)

                clock.tick(2000)
                expect(timer.getClock().getMillis()).to.equal(3000)
            })
        })
    })

    it('stops a timer when it finishes', () => {
        cy.clock().then((clock) => {
            cy.get('#clock').then(([el]) => {
                const startMillis = 10000
                const timer = new Timer(el, startMillis)

                timer.start()

                clock.tick(startMillis)
                expect(timer.getClock().getMillis()).to.equal(0)

                clock.tick(2000)
                expect(timer.getClock().getMillis()).to.equal(0)
            })
        })
    })

    it('calls the finish callback when the timer finishes', () => {
        cy.clock().then((clock) => {
            cy.get('#clock').then(([el]) => {
                const callback = cy.stub()

                const startMillis = 10000
                const timer = new Timer(el, startMillis, callback)

                timer.start()

                clock.tick(startMillis)
                expect(timer.getClock().getMillis()).to.equal(0)
                expect(callback).to.be.calledOnce

                clock.tick(2000)
                expect(timer.getClock().getMillis()).to.equal(0)
                expect(callback).to.be.calledOnce
            })
        })
    })

    it('can reset a timer after it finished', () => {
        cy.clock().then((clock) => {
            cy.get('#clock').then(([el]) => {
                const startMillis = 10000
                const timer = new Timer(el, startMillis)

                timer.start()

                expect(timer.getClock().getMillis()).to.equal(startMillis)

                clock.tick(10000)
                expect(timer.getClock().getMillis()).to.equal(0)

                timer.reset()

                expect(timer.getClock().getMillis()).to.equal(startMillis)
            })
        })
    })

    it('can reset a timer and does not continue counting afterwards', () => {
        cy.clock().then((clock) => {
            cy.get('#clock').then(([el]) => {
                const startMillis = 10000
                const timer = new Timer(el, startMillis)

                timer.start()

                expect(timer.getClock().getMillis()).to.equal(startMillis)

                clock.tick(7000)
                expect(timer.getClock().getMillis()).to.equal(3000)

                timer.reset()

                expect(timer.getClock().getMillis()).to.equal(startMillis)

                clock.tick(2000)
                expect(timer.getClock().getMillis()).to.equal(startMillis)
            })
        })
    })
})
