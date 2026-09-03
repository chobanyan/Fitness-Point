# ACA — PRD (Draft)

> This is a starting draft with reasonable assumptions filled in so there's something
> concrete to react to. Edit anything that's wrong — treat it as a first draft, not a
> decision.

## Problem
People who work out want a simple way to log their workouts and see progress over
time, without a complicated app that demands a lot of setup.

## Target user
Someone who exercises regularly (gym, home workouts, running) and wants a lightweight
log — not a professional athlete needing deep analytics.

## Scope (v1)
- Log a workout: exercise name, sets, reps, weight (or duration for cardio), date
- View a history list of past workouts
- See basic progress for a given exercise (e.g. weight/reps over time)
- Data persists locally in the browser (no account/login required for v1)

## Out of scope (v1)
- User accounts / multi-device sync
- Social features (sharing, following)
- Nutrition tracking
- Mobile app (web only for now)

## Success looks like
- A user can log a workout and see it in their history in under 30 seconds
- A user can tell whether they're progressing on a given exercise at a glance

## Open questions
- Should workouts be organized into named routines/programs, or just a flat log?
- Is weight in lbs, kg, or user-selectable?
