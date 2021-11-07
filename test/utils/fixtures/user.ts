import { v4 } from 'uuid'

// password is "password"
const passwordHash = '$2a$08$7YAbrO83em590j7yyb6gWes.c.KBHOm8734eWBLOuFijTxxq6MlOe'

export function newUser() {
  return {
    username: v4(),
    email: `${v4()}@email.com`,
    passwordHash,
    signUpDate: new Date(),
  }
}

export function newUserWithoutEmail() {
  return { ...newUser(), email: null }
}

export function newUnregisteredUser() {
  return {
    browserToken: v4(),
  }
}
