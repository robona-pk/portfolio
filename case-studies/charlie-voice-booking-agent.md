# Charlie — Voice Booking Agent for At-Home Eye Care

**Type:** Independent product experiment (prototype)  
**Domain:** Voice AI · Assisted booking · Accessibility · O2O services  
**Stack:** FastAPI · SQLite · Browser voice APIs · Deterministic state machine

## Problem

At-home eye tests and frame trials are especially useful for customers who would rather call than use an app. Senior citizens and other less tech-confident customers may want the service but need a low-friction way to book it on their own.

The product challenge was to make booking feel simple and reassuring while keeping every step precise and reliable.

## The booking flow

Voice is only the interface. A deterministic state machine decides what happens next, so each step is explicit, validated and traceable.

1. **Capture intent:** the caller chooses an eye test or a frame trial.
2. **Check serviceability:** validate a 6-digit pincode, then check eligible areas.
3. **Offer a real slot:** normalise the requested date and return only available slots.
4. **Confirm safely:** read back the summary, collect explicit consent, then book.
5. **Learn from demand:** callers in unsupported areas can join a waitlist for future coverage.

## How it works

`Customer (calls or types) → Voice UI (listens and speaks) → State machine (validates and routes) → Booking API → Database`

The state machine owns every booking decision. An optional model only helps interpret the caller's current answer, so the conversation can stay natural without the model controlling the outcome.

## Where the pattern fits next

Charlie is a reusable assisted-action pattern for any app where a customer needs to complete a real-world task and would benefit from a phone-first, guided route: home services, healthcare scheduling, retail demos and installations, and insurance or financial appointments.

## Links

- [Watch the demo](https://docs.google.com/videos/d/1ODUBoZVEVvevSUnQqDwE0KWQi2xAfvQpcNDs6XvWNaM/edit?usp=sharing)
- [Source code](https://github.com/robona-pk/Voice-Booking-Agent---ClearView)
